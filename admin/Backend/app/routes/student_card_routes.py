from flask import Blueprint, request, jsonify
from app.models.student_card_request import StudentCardRequest
from app.models.user import User
from app.database import db
from datetime import datetime
from uuid import UUID

student_card_bp = Blueprint('student_card', __name__)

# GET: Lấy tất cả yêu cầu
@student_card_bp.route('/', methods=['GET'])
def get_all_requests():
    requests = StudentCardRequest.query.order_by(StudentCardRequest.created_at.desc()).all()
    result = [{
        'id': str(r.id),
        'user_cccd': r.user_cccd,
        'user_name': r.user.full_name if r.user else '',
        'image_url': r.image_url,
        'enroll_year': r.enroll_year,
        'status': r.status,
        'note': r.note,
        'created_at': r.created_at.isoformat(),
        'reviewed_at': r.reviewed_at.isoformat() if r.reviewed_at else None
    } for r in requests]
    return jsonify(result)

# POST: Tạo yêu cầu mới
@student_card_bp.route('/', methods=['POST'])
def create_request():
    data = request.json
    user = User.query.filter_by(cccd=data.get('user_cccd')).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    new_request = StudentCardRequest(
        user_cccd=user.cccd,
        image_url=data.get('image_url'),
        enroll_year=data.get('enroll_year'),
        status='pending',
        note=data.get('note')
    )
    db.session.add(new_request)
    db.session.commit()
    return jsonify({'message': 'Student card request created'}), 201

# PUT: Cập nhật trạng thái và ghi chú
@student_card_bp.route('/<uuid:req_id>', methods=['PUT'])
def update_status(req_id):
    data = request.json
    request_record = StudentCardRequest.query.get_or_404(req_id)

    new_status = data.get('status')
    if new_status not in ['approved', 'rejected']:
        return jsonify({'error': 'Invalid status'}), 400

    request_record.status = new_status
    request_record.note = data.get('note', request_record.note)
    request_record.reviewed_at = datetime.utcnow()

    db.session.commit()
    return jsonify({'message': 'Status updated successfully'})

# DELETE: Xóa yêu cầu
@student_card_bp.route('/<uuid:req_id>', methods=['DELETE'])
def delete_request(req_id):
    request_record = StudentCardRequest.query.get_or_404(req_id)
    db.session.delete(request_record)
    db.session.commit()
    return jsonify({'message': 'Request deleted successfully'})
