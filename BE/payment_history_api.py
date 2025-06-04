from flask import Blueprint, request, jsonify
import psycopg2
import os

payment_history_bp = Blueprint('payment_history', __name__)

DB_URL = os.environ.get("DATABASE_URL") or "postgresql://khoaluan_owner:npg_JOW4CSV8fqId@ep-rapid-cloud-a1nzf35c-pooler.ap-southeast-1.aws.neon.tech/khoaluan?sslmode=require"

def get_db_conn():
    return psycopg2.connect(DB_URL)

def get_user_cccd():
    # Ưu tiên param, rồi tới header, form (tuỳ bạn FE gửi như nào)
    return (
        request.args.get('user_cccd')
        or request.headers.get('user_cccd')
        or request.headers.get('User_cccd')
        or request.form.get('user_cccd')
    )

@payment_history_bp.route('/payment-history', methods=['GET'])
def payment_history():
    user_cccd = get_user_cccd()
    if not user_cccd:
        # FE sẽ nhận được lỗi này nếu chưa truyền CCCD
        return jsonify([])  # Hoặc: return jsonify({'error': 'Thiếu CCCD'}), 400

    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT 
            p.id,
            p.amount, 
            p.paid_at, 
            p.bus_license_plate, 
            b.route_id,
            r.route_name
        FROM payments p
        JOIN buses b ON p.bus_license_plate = b.license_plate
        JOIN bus_routes r ON b.route_id = r.id
        WHERE p.user_cccd = %s
        ORDER BY p.paid_at DESC
    """, (user_cccd,))
    rows = cur.fetchall()
    cur.close()
    conn.close()

    result = [
        {
            'id': str(row[0]),
            'amount': float(row[1]),
            'paid_at': row[2].strftime("%Y-%m-%d %H:%M:%S"),
            'license_plate': row[3],
            'route_id': row[4],
            'route_name': row[5]
        } for row in rows
    ]
    return jsonify(result)
