from flask import Flask, flash, request, jsonify, session
from flask_mail import Mail, Message
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import os, secrets, psycopg2
from dotenv import load_dotenv
from functools import wraps

from sqlalchemy import create_engine, Table, Column, String, LargeBinary, TIMESTAMP, MetaData, ForeignKey, select
from datetime import datetime

from flask import send_from_directory
from werkzeug.utils import secure_filename
import os
from payment_history_api import payment_history_bp

UPLOAD_FOLDER = os.path.join("uploads", "student_cards")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# === PostgreSQL Setup ===
DATABASE_URL = os.getenv("DATABASE_URL") or "postgresql://khoaluan_owner:npg_JOW4CSV8fqId@ep-rapid-cloud-a1nzf35c-pooler.ap-southeast-1.aws.neon.tech/khoaluan?sslmode=require"
engine = create_engine(DATABASE_URL)
metadata = MetaData()
metadata.reflect(bind=engine)

# Load biến môi trường
load_dotenv()
FE_BASE_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')

#tuyen
@app.route("/api/bus_routes", methods=["GET"])
def get_all_routes():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, route_name FROM bus_routes ORDER BY id")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify([{"id": row[0], "route_name": row[1]} for row in rows])

@app.route("/api/bus_routes/<route_id>", methods=["GET"])
def get_route_detail(route_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT br.route_name, brd.departure_description, brd.arrival_description, brd.operator,
               brd.route_type, brd.distance_km, brd.vehicle_type, brd.service_hours,
               brd.trip_count, brd.trip_duration, brd.trip_interval
        FROM bus_routes br
        JOIN bus_route_details brd ON br.id = brd.route_id
        WHERE br.id = %s
    """, (route_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        return jsonify({"error": "Route not found"}), 404
    return jsonify({
        "route_name": row[0],
        "departure_description": row[1],
        "arrival_description": row[2],
        "operator": row[3],
        "route_type": row[4],
        "distance_km": float(row[5]),
        "vehicle_type": row[6],
        "service_hours": row[7],
        "trip_count": row[8],
        "trip_duration": row[9],
        "trip_interval": row[10],
    })

@app.route("/api/bus_routes/<route_id>/prices", methods=["GET"])
def get_ticket_prices(route_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT ticket_type, price FROM ticket_prices WHERE route_id = %s", (route_id,))
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify([{"ticket_type": r[0], "price": r[1]} for r in rows])

CORS(app, supports_credentials=True, 
     origins=["http://localhost:5173"], 
     allow_headers=["Content-Type", "user_cccd"])

app.register_blueprint(payment_history_bp)

# Kết nối database
def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

# Cấu hình email
app.config.update(
    MAIL_SERVER='smtp.gmail.com',
    MAIL_PORT=587,
    MAIL_USE_TLS=True,
    MAIL_USERNAME=os.getenv('MAIL_USERNAME'),
    MAIL_PASSWORD=os.getenv('MAIL_PASSWORD'),
    MAIL_DEFAULT_SENDER=os.getenv('MAIL_USERNAME')
)
mail = Mail(app)

# --- ĐĂNG KÝ ---
@app.route("/register", methods=["POST"])
def register():
    data = request.form
    cccd = data.get("cccd", "").strip()
    ho_va_ten = data.get("ho_va_ten", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    confirm_password = data.get("confirm_password", "")

    if not cccd or not ho_va_ten or not email or not password:
        return "Vui lòng nhập đầy đủ thông tin.", 400

    if len(cccd) != 12 or not cccd.isdigit():
        return "CCCD phải gồm đúng 12 chữ số.", 400

    if password != confirm_password:
        return "Mật khẩu xác nhận không khớp.", 400

    hashed_password = generate_password_hash(password)
    verification_token = secrets.token_urlsafe(32)

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Kiểm tra trùng cccd/email
        cur.execute("SELECT 1 FROM users_account WHERE user_cccd = %s OR email = %s", (cccd, email))
        if cur.fetchone():
            return "CCCD hoặc Email đã tồn tại.", 400

        # Lấy passenger_type mặc định
        cur.execute("SELECT id FROM passenger_types WHERE type_name = %s", ("Người dùng khác",))
        row = cur.fetchone()
        if not row:
            return "Chưa có loại hành khách 'Người dùng khác' trong bảng passenger_types.", 500
        passenger_type_id = row[0]

        # --- Trích xuất thông tin từ CCCD ---
        province_code = cccd[:3]
        gender_code = int(cccd[3])
        year_suffix = int(cccd[4:6])

        # Giới tính & thế kỷ
        if gender_code in [0, 1]:
            century = 1900
            gender = "Nam" if gender_code == 0 else "Nữ"
        elif gender_code in [2, 3]:
            century = 2000
            gender = "Nam" if gender_code == 2 else "Nữ"
        else:
            return "CCCD không hợp lệ – mã giới tính không xác định.", 400

        birth_year = century + year_suffix
        age = datetime.now().year - birth_year

        # Kiểm tra mã tỉnh có tồn tại không
        cur.execute("SELECT 1 FROM provinces WHERE province_code = %s", (province_code,))
        if not cur.fetchone():
            return f"Mã tỉnh {province_code} trong CCCD không tồn tại trong hệ thống.", 400

        # --- Chèn vào bảng users ---
        cur.execute("""
            INSERT INTO users (cccd, full_name, passenger_type_id, province_code, gender, birth_year, age)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (cccd, ho_va_ten, passenger_type_id, province_code, gender, birth_year, age))

        # --- Chèn vào bảng users_account ---
        cur.execute("""
            INSERT INTO users_account (user_cccd, email, ho_va_ten, password, is_verified, verification_token)
            VALUES (%s, %s, %s, %s, FALSE, %s)
        """, (cccd, email, ho_va_ten, hashed_password, verification_token))

        conn.commit()

        # Gửi email xác minh
        verify_link = f"{FE_BASE_URL}/verify/{verification_token}"
        msg = Message("Xác nhận Email", recipients=[email], body=f"Vui lòng xác nhận tài khoản tại: {verify_link}")
        mail.send(msg)

        return "Đăng ký thành công. Vui lòng kiểm tra email để xác nhận."
    except Exception as e:
        conn.rollback()
        return f"Lỗi hệ thống: {str(e)}", 500
    finally:
        cur.close()
        conn.close()

# --- ĐĂNG NHẬP ---
@app.route("/login", methods=["POST"])
def login():
    data = request.form
    cccd = data.get("cccd", "").strip()
    password = data.get("password", "")

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT user_cccd, ho_va_ten, email, password, is_verified FROM users_account WHERE user_cccd = %s", (cccd,))
        user = cur.fetchone()
        if not user:
            return "Sai CCCD hoặc không tồn tại.", 400
        if not check_password_hash(user[3], password):
            return "Sai mật khẩu", 400
        if not user[4]:
            return "Tài khoản chưa xác minh.", 403

        # ✅ Lưu đủ thông tin vào session để xác thực
        session["cccd"] = user[0]
        session["ho_va_ten"] = user[1]
        session["email"] = user[2]  # <-- Bắt buộc có dòng này
        session["role"] = "user"

        return jsonify({
            "message": "Đăng nhập thành công",
            "ho_va_ten": user[1]
        })

    except Exception as e:
        return str(e), 500
    finally:
        cur.close()
        conn.close()

# --- XÁC MINH EMAIL ---
@app.route("/verify/<token>")
def verify_email(token):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            UPDATE users_account
            SET is_verified = TRUE, verification_token = NULL
            WHERE verification_token = %s
            RETURNING email
        """, (token,))
        user = cur.fetchone()
        if user:
            conn.commit()
            return jsonify({ "message": "Xác nhận thành công!", "email": user[0] })
        return "Liên kết không hợp lệ hoặc đã hết hạn", 400
    except Exception as e:
        conn.rollback()
        return str(e), 500
    finally:
        cur.close()
        conn.close()

# --- ĐĂNG XUẤT ---
@app.route("/logout")
def logout():
    session.clear()
    return "Đăng xuất thành công"

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "email" not in session:
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated_function

# --- DASHBOARD (simple test) ---
@app.route("/dashboard")
@login_required
def dashboard():
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT u.cccd, u.full_name, ua.email, u.phone_number, pt.type_name,
                       u.student_id, u.student_enroll_year, u.gender, u.birth_year, u.age,
                       pr.province_name, u.created_at, ua.is_verified
                FROM users u
                JOIN passenger_types pt ON u.passenger_type_id = pt.id
                JOIN provinces pr ON u.province_code = pr.province_code
                JOIN users_account ua ON ua.user_cccd = u.cccd
                WHERE u.cccd = %s
            """, (session["cccd"],))
            user = cur.fetchone()
            if user:
                return jsonify({
                    "cccd": user[0],
                    "full_name": user[1],
                    "email": user[2],
                    "phone_number": user[3],
                    "passenger_type": user[4],
                    "student_id": user[5],
                    "student_enroll_year": user[6],
                    "gender": user[7],
                    "birth_year": user[8],
                    "age": user[9],
                    "province": user[10],
                    "created_at": user[11].strftime("%Y-%m-%d %H:%M:%S"),
                    "is_verified": user[12]
                })
    return jsonify({"error": "Không tìm thấy thông tin người dùng."}), 404

#update-profile
@app.route("/update-profile", methods=["POST"])
@login_required
def update_profile():
    data = request.get_json()
    cccd = session["cccd"]

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Lấy dữ liệu gốc từ DB
        cur.execute("""
            SELECT u.full_name, ua.email, u.phone_number
            FROM users u
            JOIN users_account ua ON ua.user_cccd = u.cccd
            WHERE u.cccd = %s
        """, (cccd,))
        user = cur.fetchone()
        if not user:
            return "Không tìm thấy người dùng.", 404

        current_full_name, current_email, current_phone = user

        # Nếu field trống thì giữ nguyên giá trị cũ
        new_full_name = data.get("full_name", "").strip() or current_full_name
        new_email = data.get("email", "").strip().lower() or current_email
        new_phone = data.get("phone_number", "").strip() or current_phone

        email_changed = (new_email != current_email)

        # Nếu email đổi thì kiểm tra xem email mới đã được dùng chưa
        if email_changed:
            cur.execute("SELECT 1 FROM users_account WHERE email = %s", (new_email,))
            if cur.fetchone():
                return "Email mới đã được sử dụng.", 400

        # Cập nhật bảng users
        cur.execute("""
            UPDATE users
            SET full_name = %s, phone_number = %s
            WHERE cccd = %s
        """, (new_full_name, new_phone, cccd))

        # Cập nhật bảng users_account
        if email_changed:
            verification_token = secrets.token_urlsafe(32)
            cur.execute("""
                UPDATE users_account
                SET email = %s, ho_va_ten = %s, is_verified = FALSE, verification_token = %s
                WHERE user_cccd = %s
            """, (new_email, new_full_name, verification_token, cccd))

            # Gửi lại email xác minh
            verify_link = f"{FE_BASE_URL}/verify/{verification_token}"
            msg = Message("Xác nhận Email mới", recipients=[new_email],
                          body=f"Bạn vừa cập nhật email. Vui lòng xác nhận tại: {verify_link}")
            mail.send(msg)
        else:
            cur.execute("""
                UPDATE users_account
                SET ho_va_ten = %s
                WHERE user_cccd = %s
            """, (new_full_name, cccd))

        conn.commit()
        return "Cập nhật thành công. Nếu bạn đổi email, hãy kiểm tra hộp thư để xác minh."
    except Exception as e:
        conn.rollback()
        return f"Lỗi: {str(e)}", 500
    finally:
        cur.close()
        conn.close()

# Gửi email khôi phục mật khẩu
@app.route("/forgot-password", methods=["POST"])
def forgot_password():
    email = request.form['email']
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT is_verified FROM users_account WHERE email = %s", (email,))
        user = cur.fetchone()
        if not user:
            return "Email không tồn tại.", 400
        if not user[0]:
            return "Email chưa xác minh.", 400

        token = secrets.token_urlsafe(32)
        cur.execute("UPDATE users_account SET reset_token = %s WHERE email = %s", (token, email))
        conn.commit()

        url = f"{FE_BASE_URL}/reset-password/{token}"
        msg = Message("Khôi phục mật khẩu", recipients=[email], body=f"Đặt lại mật khẩu tại: {url}")
        mail.send(msg)
        return "Đã gửi email khôi phục mật khẩu."
    except Exception as e:
        conn.rollback()
        return str(e), 500
    finally:
        cur.close()
        conn.close()

@app.route("/reset-password/<token>", methods=["POST"])
def reset_password(token):
    new_password = request.form['new_password']
    confirm_password = request.form['confirm_password']
    if new_password != confirm_password:
        return "Mật khẩu xác nhận không khớp.", 400

    hashed = generate_password_hash(new_password)
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            UPDATE users_account SET password = %s, reset_token = NULL
            WHERE reset_token = %s RETURNING email
        """, (hashed, token))
        if cur.fetchone():
            conn.commit()
            return "Đặt lại mật khẩu thành công!"
        return "Token không hợp lệ hoặc hết hạn.", 400
    except Exception as e:
        conn.rollback()
        return str(e), 500
    finally:
        cur.close()
        conn.close()

@app.route('/change-password', methods=['POST'])
def change_password():
    if 'email' not in session:
        return "Bạn chưa đăng nhập.", 401

    email = session['email']
    old_password = request.form['old_password']
    new_password = request.form['new_password']
    confirm_password = request.form['confirm_password']

    if new_password != confirm_password:
        return "Mật khẩu xác nhận không khớp.", 400

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT password FROM users_account WHERE email = %s", (email,))
        user = cur.fetchone()
        if not user:
            return "Không tìm thấy người dùng.", 400
        if not check_password_hash(user[0], old_password):
            return "Mật khẩu hiện tại không đúng.", 400

        hashed = generate_password_hash(new_password)
        cur.execute("UPDATE users_account SET password = %s WHERE email = %s", (hashed, email))
        conn.commit()
        return "Đổi mật khẩu thành công!"
    except Exception as e:
        conn.rollback()
        return str(e), 500
    finally:
        cur.close()
        conn.close()

#tải ảnh thẻ sinh viên
@app.route("/upload-student-card", methods=["POST"])
@login_required
def upload_student_card():
    if "file" not in request.files:
        return "Không có file nào được gửi.", 400

    file = request.files["file"]
    if file.filename == "":
        return "Không có tên file.", 400

    filename = secure_filename(f"{session['cccd']}_student_card.jpg")
    save_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(save_path)

    return "✅ Tải ảnh thẻ thành công!", 200

@app.route("/uploads/student_cards/<filename>")
def get_student_card(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# --- ĐĂNG KÝ CÁC ROUTE NẠP TIỀN ---
from topup_api import topup_bp
app.register_blueprint(topup_bp)

# Gửi test email khi chạy app
if __name__ == '__main__':
    with app.app_context():
        try:
            test_msg = Message('Test Email', recipients=[os.getenv('MAIL_USERNAME')])
            test_msg.body = 'Đây là email kiểm tra từ hệ thống'
            mail.send(test_msg)
            print("✅ Kết nối email thành công!")
        except Exception as e:
            print(f"❌ Lỗi kết nối email: {e}")
            print("1. Đã bật xác minh 2 bước & tạo mật khẩu ứng dụng")
            print("2. Kiểm tra cấu hình trong .env")
            print("3. Kiểm tra tường lửa/mạng chặn cổng 587")
    app.run(debug=True)
