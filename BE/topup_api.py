from flask import Blueprint, request, jsonify
from datetime import datetime
import uuid, os
from dotenv import load_dotenv

load_dotenv()
topup_bp = Blueprint('topup', __name__)

@topup_bp.route('/request-topup', methods=['POST'])
def request_topup():
    try:
        data = request.get_json()
        amount = int(data.get('amount', 0))
        user_cccd = request.headers.get('user_cccd')

        if not user_cccd:
            return jsonify({'error': '❌ Thiếu CCCD'}), 400
        if amount < 10000:
            return jsonify({'error': '❌ Số tiền tối thiểu là 10.000 VND'}), 400

        request_id = uuid.uuid4().hex[:10]
        print(f"[Topup Request] #{request_id} | CCCD: {user_cccd} | Amount: {amount} | Status: Pending")

        # Tùy chọn: ghi vào DB hoặc gửi email cho admin ở đây

        return jsonify({
            'request_id': request_id,
            'message': f"✅ Đã gửi yêu cầu nạp {amount:,} VND. Vui lòng chờ admin duyệt.",
            'status': 'pending'
        })
    except Exception as e:
        return jsonify({'error': f"Lỗi: {str(e)}"}), 500
