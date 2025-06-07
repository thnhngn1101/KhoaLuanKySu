from flask import Blueprint, request, jsonify
from PIL import Image
import base64
from io import BytesIO
import tenseal as ts
import torch
from facenet_pytorch import InceptionResnetV1, MTCNN
from sqlalchemy import select
import numpy as np
import cv2
from db import engine, get_db_connection, metadata

face_bp = Blueprint('face_api', __name__)

# Model & context mã hóa
face_model = InceptionResnetV1(pretrained='vggface2').eval()
face_detector = MTCNN(image_size=160, margin=20)
face_context = ts.context(ts.SCHEME_TYPE.CKKS, 8192, [60, 40, 40, 60])
face_context.global_scale = 2**40
face_context.generate_galois_keys()
face_embeddings = metadata.tables["face_embeddings"]

# --- THRESHOLD dễ dãi ---
SIMILARITY_THRESHOLD = 0.65   # Chỉ cần giống 65%
FACE_MIN_RATIO = 0.02         # Mặt >2% diện tích ảnh
TILT_TOLERANCE = 1.4          # Được nghiêng thoải mái
BLURRY_THRESHOLD = 10         # Ảnh rất mờ vẫn OK

def extract_embedding(img: Image.Image):
    face = face_detector(img)
    if face is None:
        return None
    with torch.no_grad():
        return face_model(face.unsqueeze(0)).squeeze().numpy()

def cosine_similarity(enc_vec1, enc_vec2):
    dot = enc_vec1.dot(enc_vec2).decrypt()[0]
    norm1 = enc_vec1.dot(enc_vec1).decrypt()[0] ** 0.5
    norm2 = enc_vec2.dot(enc_vec2).decrypt()[0] ** 0.5
    # Nếu giá trị là complex, lấy phần thực
    if isinstance(dot, complex): dot = dot.real
    if isinstance(norm1, complex): norm1 = norm1.real
    if isinstance(norm2, complex): norm2 = norm2.real
    return dot / (norm1 * norm2)

def is_blurry(image, threshold=BLURRY_THRESHOLD):
    gray = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2GRAY)
    return cv2.Laplacian(gray, cv2.CV_64F).var() < threshold

def face_area_ratio(box, shape):
    x1, y1, x2, y2 = box
    face_area = (x2 - x1) * (y2 - y1)
    return face_area / (shape[0] * shape[1])

def is_tilted(box, tolerance=TILT_TOLERANCE):
    x1, y1, x2, y2 = box
    ratio = (x2 - x1) / (y2 - y1)
    return ratio > (1 + tolerance) or ratio < (1 - tolerance)

@face_bp.route("/verify-face-web", methods=["POST"])
def verify_face_web():
    try:
        data = request.get_json()
        if not data or "image" not in data:
            return jsonify({ "status": "error", "message": "Thiếu dữ liệu ảnh." })

        img_data = data["image"].split(",")[1] if "," in data["image"] else data["image"]
        img_bytes = base64.b64decode(img_data)
        img = Image.open(BytesIO(img_bytes)).convert("RGB")

        # Phát hiện khuôn mặt
        boxes, _ = face_detector.detect(img)
        if boxes is None or len(boxes) != 1:
            return jsonify({ "status": "fail", "reason": "not_one_face", "message": "❌ Cần đúng 1 khuôn mặt." })

        errors = []
        box = boxes[0]
        if face_area_ratio(box, img.size[::-1]) < FACE_MIN_RATIO:
            errors.append("Khuôn mặt quá nhỏ.")
        if is_tilted(box, tolerance=TILT_TOLERANCE):
            errors.append("Khuôn mặt đang nghiêng quá mức.")
        if is_blurry(img, threshold=BLURRY_THRESHOLD):
            errors.append("Ảnh bị mờ. Vui lòng giữ yên khuôn mặt.")

        embedding = extract_embedding(img)
        if embedding is None:
            errors.append("Không nhận diện được khuôn mặt.")

        if errors:
            return jsonify({
                "status": "fail",
                "reason": "bad_quality",
                "message": "❌ " + " ".join(errors)
            })

        enc_vector = ts.ckks_vector(face_context, embedding.tolist())

        # So sánh với DB – luôn lấy similarity cao nhất
        max_sim = 0
        matched_cccd = None
        with engine.connect() as conn:
            for record in conn.execute(select(face_embeddings)).fetchall():
                db_vec = ts.ckks_vector_from(face_context, record.encrypted_embedding)
                sim = cosine_similarity(enc_vector, db_vec)
                if sim > max_sim:
                    max_sim = sim
                    matched_cccd = record.user_cccd

        # Đánh giá dựa vào max_sim
        if max_sim >= SIMILARITY_THRESHOLD and matched_cccd:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT ua.email, ua.ho_va_ten FROM users_account ua WHERE ua.user_cccd = %s", (matched_cccd,))
            user_info = cur.fetchone()
            cur.close()
            conn.close()

            return jsonify({
                "status": "success",
                "user_cccd": matched_cccd,
                "email": user_info[0] if user_info else "",
                "full_name": user_info[1] if user_info else "",
                "max_similarity": float(max_sim)
            })
        else:
            return jsonify({
                "status": "fail",
                "reason": "not_matched",
                "max_similarity": float(max_sim),
                "message": "❌ Không xác thực được. Độ tương đồng: %.1f%%" % (max_sim * 100)
            })

    except Exception as e:
        return jsonify({ "status": "error", "message": f"Lỗi hệ thống: {str(e)}" })
