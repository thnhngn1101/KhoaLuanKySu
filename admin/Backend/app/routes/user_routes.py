from flask import Blueprint, request, jsonify
from app.models.user import User
from app.database import db
from datetime import datetime

user_bp = Blueprint('users', __name__)

@user_bp.route('/', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([{
        'cccd': u.cccd,
        'full_name': u.full_name,
        'email': u.email,
        'phone_number': u.phone_number,
        'passenger_type_id': u.passenger_type_id,
        'province_code': u.province_code,
        'student_id': u.student_id,
        'student_enroll_year': u.student_enroll_year,
        'gender': u.gender,
        'birth_year': u.birth_year,
        'age': u.age,
        'created_at': u.created_at
    } for u in users]), 200

@user_bp.route('/', methods=['POST'])
def create_user():
    data = request.get_json()

    if not all(k in data for k in ['cccd', 'full_name', 'passenger_type_id', 'province_code', 'birth_year']):
        return jsonify({'error': 'Thiếu thông tin bắt buộc'}), 400

    user = User(
        cccd=data['cccd'],
        full_name=data['full_name'],
        email=data.get('email'),
        phone_number=data.get('phone_number'),
        passenger_type_id=data['passenger_type_id'],
        province_code=data['province_code'],
        student_id=data.get('student_id'),
        student_enroll_year=data.get('student_enroll_year'),
        gender=data.get('gender'),
        birth_year=data.get('birth_year'),
        age=datetime.now().year - int(data['birth_year']),
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'Tạo người dùng thành công'}), 201

@user_bp.route('/<string:cccd>', methods=['PUT'])
def update_user(cccd):
    user = User.query.get(cccd)
    if not user:
        return jsonify({'error': 'Không tìm thấy người dùng'}), 404
    data = request.get_json()
    user.full_name = data['full_name']
    user.email = data.get('email')
    user.phone_number = data.get('phone_number')
    user.passenger_type_id = data['passenger_type_id']
    user.province_code = data['province_code']
    user.student_id = data.get('student_id')
    user.student_enroll_year = data.get('student_enroll_year')
    user.gender = data.get('gender')
    user.birth_year = data.get('birth_year')
    user.age = datetime.now().year - int(data['birth_year'])
    db.session.commit()
    return jsonify({'message': 'Cập nhật người dùng thành công'}), 200

@user_bp.route('/<string:cccd>', methods=['DELETE'])
def delete_user(cccd):
    user = User.query.get(cccd)
    if not user:
        return jsonify({'error': 'Không tìm thấy người dùng'}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'Xóa người dùng thành công'}), 200
