from flask import Blueprint, request, jsonify
from datetime import datetime
import uuid
import psycopg2
import os

topup_bp = Blueprint('topup', __name__)
DB_URL = os.environ.get("DATABASE_URL") or "postgresql://khoaluan_owner:npg_JOW4CSV8fqId@ep-rapid-cloud-a1nzf35c-pooler.ap-southeast-1.aws.neon.tech/khoaluan?sslmode=require"

def get_db_conn():
    return psycopg2.connect(DB_URL)

# Lấy thông tin user (full_name) bằng CCCD (GET với query param)
@topup_bp.route('/user-info', methods=['GET'])
def user_info():
    user_cccd = request.args.get('user_cccd')
    if not user_cccd:
        return jsonify({'error': 'Thiếu CCCD'}), 400
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("SELECT full_name FROM users WHERE cccd = %s", (user_cccd,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        return jsonify({'error': 'Không tìm thấy user'}), 404
    return jsonify({'full_name': row[0]})

# Lấy số dư ví (GET với query param)
@topup_bp.route('/wallet', methods=['GET'])
def get_wallet():
    user_cccd = request.args.get('user_cccd')
    if not user_cccd:
        return jsonify({'error': 'Thiếu CCCD'}), 400
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("SELECT balance FROM wallets WHERE user_cccd = %s", (user_cccd,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        return jsonify({'balance': 0})
    return jsonify({'balance': float(row[0])})

# Nạp tiền (POST - user_cccd gửi qua JSON body)
@topup_bp.route('/request-topup', methods=['POST'])
def request_topup():
    try:
        data = request.get_json()
        user_cccd = data.get('user_cccd')
        amount = float(data.get('amount', 0))
        if not user_cccd:
            return jsonify({'error': '❌ Thiếu CCCD'}), 400
        if amount < 10000:
            return jsonify({'error': '❌ Số tiền tối thiểu là 10.000 VND'}), 400

        request_id = str(uuid.uuid4())
        created_at = datetime.now()
        conn = get_db_conn()
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM wallets WHERE user_cccd = %s", (user_cccd,))
        if not cur.fetchone():
            cur.execute("INSERT INTO wallets (user_cccd, balance) VALUES (%s, 0)", (user_cccd,))
        cur.execute("""
            INSERT INTO topup_requests (id, user_cccd, amount, status, created_at)
            VALUES (%s, %s, %s, %s, %s)
        """, (request_id, user_cccd, amount, 'pending', created_at))
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            'request_id': request_id,
            'message': f"✅ Đã gửi yêu cầu nạp {int(amount):,} VND. Vui lòng chờ admin duyệt.",
            'status': 'pending'
        })
    except Exception as e:
        return jsonify({'error': f"Lỗi: {str(e)}"}), 500
