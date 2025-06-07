from flask import Blueprint, request, session, send_from_directory
from werkzeug.utils import secure_filename
from sqlalchemy import text
from datetime import datetime
import os

# Đảm bảo thư mục uploads tồn tại
UPLOAD_FOLDER = os.path.join("uploads", "student_cards")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

student_bp = Blueprint("student", __name__)

# ===== Upload ảnh thẻ sinh viên (từ user) =====
@student_bp.route("/upload-student-card", methods=["POST"])
def upload_student_card():
    if "cccd" not in session:
        return "Chưa đăng nhập.", 401

    if "file" not in request.files:
        return "Không có file nào được gửi.", 400
    file = request.files["file"]
    if file.filename == "":
        return "Không có tên file.", 400

    student_id = request.form.get("student_id")
    if not student_id:
        return "Vui lòng nhập mã số sinh viên.", 400

    filename = secure_filename(f"{session['cccd']}_student_card.jpg")
    save_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(save_path)

    # Lưu vào bảng request
    from db import engine
    with engine.begin() as conn:
        existed = conn.execute(
            text("SELECT id FROM student_card_requests WHERE user_cccd = :cccd AND status = 'pending'"),
            {"cccd": session["cccd"]}
        ).fetchone()
        if existed:
            return "Đang có yêu cầu chờ duyệt.", 409

        conn.execute(
            text("""
                INSERT INTO student_card_requests (user_cccd, image_url, student_id, status, created_at)
                VALUES (:cccd, :image_url, :student_id, 'pending', :created_at)
            """),
            {
                "cccd": session["cccd"],
                "image_url": filename,
                "student_id": student_id,
                "created_at": datetime.now()
            }
        )
    return "✅ Đã gửi yêu cầu xác minh sinh viên. Vui lòng chờ duyệt.", 200

