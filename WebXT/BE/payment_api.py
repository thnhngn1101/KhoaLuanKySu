from flask import Blueprint, request, jsonify
from sqlalchemy import text
from db import engine, get_db_connection
from datetime import datetime
import uuid

payment_bp = Blueprint("payment_api", __name__)

@payment_bp.route("/api/pay-bus-fare", methods=["POST"])
def pay_bus_fare():
    """
    API trừ tiền sau khi xác thực khuôn mặt (vé xe buýt)
    - Nhận: user_cccd (từ face), license_plate (xe đã đăng nhập)
    """
    data = request.get_json()
    user_cccd = data.get("user_cccd")
    license_plate = data.get("license_plate")

    if not user_cccd or not license_plate:
        return jsonify({"error": "Thiếu dữ liệu."}), 400

    try:
        with engine.begin() as conn:
            # 1. Lấy route_id từ biển số xe
            row = conn.execute(
                text("SELECT route_id FROM buses WHERE license_plate = :plate"),
                {"plate": license_plate}
            ).fetchone()
            if not row:
                return jsonify({"error": "Không tìm thấy tuyến của xe."}), 404
            route_id = row.route_id

            # 2. Lấy loại hành khách (student/regular) và lấy MSSV nếu là SV
            user_info = conn.execute(text("""
                SELECT u.passenger_type_id, pt.type_name, u.student_id
                FROM users u JOIN passenger_types pt ON u.passenger_type_id = pt.id
                WHERE u.cccd = :cccd
            """), {"cccd": user_cccd}).fetchone()
            if not user_info:
                return jsonify({"error": "Không tìm thấy thông tin khách."}), 404
            passenger_type, type_name, student_id = user_info

            # 3. Lấy giá vé đúng theo tuyến & loại hành khách (KHÔNG giảm tiếp)
            if type_name.lower() in ["sinh viên", "hs/sv"]:
                price_row = conn.execute(
                    text("""
                        SELECT price FROM ticket_prices
                        WHERE route_id = :route_id AND ticket_type ILIKE '%hs/sv%'
                    """),
                    {"route_id": route_id}
                ).fetchone()
                if not price_row:
                    # Nếu không có giá vé HS/SV, fallback sang vé thường
                    price_row = conn.execute(
                        text("""
                            SELECT price FROM ticket_prices
                            WHERE route_id = :route_id AND ticket_type ILIKE '%bình thường%'
                        """),
                        {"route_id": route_id}
                    ).fetchone()
                discount = 0
                final_price = float(price_row.price)
            else:
                price_row = conn.execute(
                    text("""
                        SELECT price FROM ticket_prices
                        WHERE route_id = :route_id AND ticket_type ILIKE '%bình thường%'
                    """),
                    {"route_id": route_id}
                ).fetchone()
                discount = 0
                final_price = float(price_row.price)

            final_price = round(final_price)

            # 4. Lấy số dư ví
            wallet = conn.execute(
                text("SELECT balance FROM wallets WHERE user_cccd = :cccd FOR UPDATE"),
                {"cccd": user_cccd}
            ).fetchone()
            if not wallet:
                return jsonify({"error": "Không tìm thấy ví khách."}), 404

            balance = float(wallet.balance)
            if balance < final_price:
                return jsonify({"error": "Không đủ số dư. Vui lòng nạp thêm tiền."}), 402

            # 5. Trừ tiền và ghi lịch sử
            new_balance = balance - final_price
            conn.execute(
                text("UPDATE wallets SET balance = :bal, updated_at = :now WHERE user_cccd = :cccd"),
                {"bal": new_balance, "now": datetime.now(), "cccd": user_cccd}
            )

            conn.execute(
                text("""
                    INSERT INTO payments (id, user_cccd, bus_license_plate, amount, discount_applied, paid_at)
                    VALUES (:id, :cccd, :plate, :amount, :discount, :paid_at)
                """),
                {
                    "id": str(uuid.uuid4()),
                    "cccd": user_cccd,
                    "plate": license_plate,
                    "amount": final_price,
                    "discount": discount,
                    "paid_at": datetime.now()
                }
            )

        # Tạo response (nếu là sinh viên trả về thêm student_id, type_name)
        response_data = {
            "success": True,
            "message": f"Đã thanh toán vé {final_price:,}đ. Số dư còn lại: {new_balance:,}đ",
            "deducted": final_price,
            "discount": discount,
            "route_id": route_id,
            "new_balance": new_balance,
            "type_name": type_name
        }
        if type_name.lower() in ["sinh viên", "hs/sv"]:
            response_data["student_id"] = student_id  # Có thể là None nếu chưa cập nhật

        return jsonify(response_data)

    except Exception as e:
        return jsonify({"error": f"Lỗi hệ thống: {str(e)}"}), 500
