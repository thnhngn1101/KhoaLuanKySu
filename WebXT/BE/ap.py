from flask import Flask, request, jsonify
from PIL import Image
import base64
from io import BytesIO
import tenseal as ts
from sqlalchemy import create_engine, select, MetaData, text
import cv2
import numpy as np
import torch
from facenet_pytorch import InceptionResnetV1, MTCNN
from flask_cors import CORS
from datetime import date
import psycopg2
import os

from dotenv import load_dotenv



# === Setup model và context mã hóa ===
face_model = InceptionResnetV1(pretrained='vggface2').eval()
face_detector = MTCNN(image_size=160, margin=20)

face_context = ts.context(ts.SCHEME_TYPE.CKKS, 8192, [60, 40, 40, 60])
face_context.global_scale = 2**40
face_context.generate_galois_keys()

# === DB connection ===
DATABASE_URL = "postgresql://postgres:1234@localhost/DoAnKhoaLuan"
engine = create_engine(DATABASE_URL)
metadata = MetaData()
metadata.reflect(bind=engine)

face_embeddings = metadata.tables["face_embeddings"]
driver_assignments = metadata.tables["driver_assignments"]


load_dotenv()
# Kết nối database
def get_db_connection():
    return psycopg2.connect(
        dbname=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        host=os.getenv('DB_HOST'),
        port=os.getenv('DB_PORT')
    )



# === Flask App ===
app = Flask(__name__)

CORS(app)  # Cho phép tất cả domain tạm thời (an toàn khi dev)

# === API: Đăng nhập tài xế ===
@app.route("/api/driver_login", methods=["POST"])
def driver_login():
    try:
        data = request.get_json()
        cccd = data.get("cccd")
        license_plate = data.get("license_plate")
        today = date.today()

        if not cccd or not license_plate:
            return jsonify({ "success": False, "message": "Thiếu CCCD hoặc biển số xe." }), 400


        # ✅ Kiểm tra phân công hôm nay
        with engine.connect() as conn:
            query = text("""
                SELECT * FROM driver_assignments 
                WHERE driver_cccd = :cccd AND license_plate = :license_plate AND assigned_date = :today
            """)
            result = conn.execute(query, {"cccd": cccd, "license_plate": license_plate, "today": today}).fetchone()

        if result:
            return jsonify({ "success": True }), 200
        else:
            return jsonify({ "success": False, "message": "❌ Sai biển hoặc CCCD hoặc chưa được phân công." }), 401

    except Exception as e:
        return jsonify({ "success": False, "message": str(e) }), 500


@app.route("/api/driver_info/<cccd>")
def driver_info(cccd):
    today = date.today()
    query = text("""
        SELECT d.full_name, da.license_plate, br.route_name
        FROM drivers d
        JOIN driver_assignments da ON da.driver_cccd = d.driver_cccd AND da.assigned_date = :today
        JOIN buses b ON b.license_plate = da.license_plate
        JOIN bus_routes br ON br.id = b.route_id
        WHERE d.driver_cccd = :cccd
    """)
    with engine.connect() as conn:
        result = conn.execute(query, {"cccd": cccd, "today": today}).fetchone()
        if result:
            return jsonify({
                "full_name": result.full_name,
                "license_plate": result.license_plate,
                "route_name": result.route_name
            })
        else:
            return jsonify({ "error": "Không tìm thấy tài xế hôm nay." }), 404



#Face_api
def extract_embedding(img: Image.Image):
    face = face_detector(img)
    if face is None:
        return None
    with torch.no_grad():
        return face_model(face.unsqueeze(0)).squeeze().numpy()

def cosine_similarity(enc_vec1, enc_vec2):
    dot = enc_vec1.dot(enc_vec2).decrypt()[0].real
    norm1 = enc_vec1.dot(enc_vec1).decrypt()[0] ** 0.5
    norm2 = enc_vec2.dot(enc_vec2).decrypt()[0] ** 0.5
    return dot / (norm1 * norm2)

def get_face_embeddings_table():
    return "face_embeddings"

def is_blurry(image, threshold=80.0):
    gray = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2GRAY)
    return cv2.Laplacian(gray, cv2.CV_64F).var() < threshold

def face_area_ratio(box, shape):
    x1, y1, x2, y2 = box
    face_area = (x2 - x1) * (y2 - y1)
    return face_area / (shape[0] * shape[1])

def is_tilted(box, tolerance=0.4):
    x1, y1, x2, y2 = box
    ratio = (x2 - x1) / (y2 - y1)
    return ratio > (1 + tolerance) or ratio < (1 - tolerance)

@app.route("/verify-face-web", methods=["POST"])
def verify_face_web():
    try:
        data = request.get_json()
        if not data or "image" not in data:
            return jsonify({ "status": "error", "message": "Thiếu dữ liệu ảnh." })

        img_data = data["image"].split(",")[1]
        img_bytes = base64.b64decode(img_data)
        img = Image.open(BytesIO(img_bytes)).convert("RGB")

        boxes, _ = face_detector.detect(img)
        if boxes is None or len(boxes) != 1:
            return jsonify({ "status": "fail", "message": "❌ Cần đúng 1 khuôn mặt." })

        if is_tilted(boxes[0]):
            return jsonify({ "status": "fail", "message": "❌ Khuôn mặt đang nghiêng quá mức." })
        if face_area_ratio(boxes[0], img.size[::-1]) < 0.2:
            return jsonify({ "status": "fail", "message": "❌ Khuôn mặt quá nhỏ." })
        if is_blurry(img):
            return jsonify({ "status": "fail", "message": "❌ Ảnh bị mờ. Vui lòng giữ yên khuôn mặt." })

        embedding = extract_embedding(img)
        if embedding is None:
            return jsonify({ "status": "fail", "message": "❌ Không nhận diện được khuôn mặt." })

        enc_vector = ts.ckks_vector(face_context, embedding.tolist())

        matched_cccd = None
        with engine.connect() as conn:
            for record in conn.execute(select(face_embeddings)).fetchall():
                db_vec = ts.ckks_vector_from(face_context, record.encrypted_embedding)
                sim = cosine_similarity(enc_vector, db_vec)
                if sim > 0.8:
                    matched_cccd = record.user_cccd
                    break

        if matched_cccd:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT ua.email, ua.ho_va_ten FROM users_account ua WHERE ua.user_cccd = %s", (matched_cccd,))
            user_info = cur.fetchone()
            cur.close()
            conn.close()

            if user_info:
                return jsonify({
                    "status": "success",
                    "email": user_info[0],
                    "full_name": user_info[1]
                })

        return jsonify({ "status": "fail", "message": "❌ Không xác thực được." })

    except Exception as e:
        return jsonify({ "status": "error", "message": str(e) })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
