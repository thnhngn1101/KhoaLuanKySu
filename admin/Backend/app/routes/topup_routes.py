from flask import Blueprint, request, jsonify
from app.models.topup_request import TopUpRequest
from app.models.user import User
from app.database import db
from datetime import datetime

topup_bp = Blueprint('topup', __name__)

@topup_bp.route('/', methods=['GET'])
def get_all_topups():
    topups = TopUpRequest.query.order_by(TopUpRequest.created_at.desc()).all()
    result = [{
        'id': str(t.id),
        'user_cccd': t.user_cccd,
        'user_name': t.user.full_name if t.user else '',
        'amount': float(t.amount),
        'status': t.status,
        'created_at': t.created_at,
        'approved_at': t.approved_at
    } for t in topups]
    return jsonify(result)

@topup_bp.route('/<uuid:topup_id>', methods=['PUT'])
def update_topup_status(topup_id):
    data = request.json
    topup = TopUpRequest.query.get_or_404(topup_id)

    if 'status' in data and data['status'] in ['approved', 'rejected']:
        topup.status = data['status']
        topup.approved_at = datetime.utcnow() if data['status'] == 'approved' else None
        db.session.commit()
        return jsonify({'message': 'Status updated'})
    return jsonify({'error': 'Invalid status'}), 400

@topup_bp.route('/', methods=['POST'])
def create_topup():
    data = request.json
    user = User.query.filter_by(cccd=data.get('user_cccd')).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    new_topup = TopUpRequest(
        user_cccd=user.cccd,
        amount=data.get('amount'),
        status=data.get('status', 'pending'),
        created_at=datetime.utcnow()
    )
    db.session.add(new_topup)
    db.session.commit()
    return jsonify({'message': 'Top-up request created'})

@topup_bp.route('/<uuid:topup_id>', methods=['DELETE'])
def delete_topup(topup_id):
    topup = TopUpRequest.query.get_or_404(topup_id)
    db.session.delete(topup)
    db.session.commit()
    return jsonify({'message': 'Top-up deleted'})
