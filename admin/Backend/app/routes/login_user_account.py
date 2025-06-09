from flask import Blueprint, request, jsonify
from app.models.user import UsersAccount
from app.models.passenger_type import PassengerType
from app.database import db
from datetime import datetime
import uuid
from flask_jwt_extended import create_access_token

login_user_account_bp = Blueprint('login_user_account', __name__, url_prefix='/api/login_user_account')

@login_user_account_bp.route('/', methods=['GET'])
def get_user_accounts():
    user_accounts = UsersAccount.query.all()
    result = [{
        'cccd': acc.user_cccd,
        'email': acc.email,
        'ho_va_ten': acc.ho_va_ten,
        'passenger_type_id': str(acc.user.passenger_type_id) if acc.user else None,
        'passenger_type_name': (
            acc.user.passenger_type.name
            if acc.user and acc.user.passenger_type else None
        )
    } for acc in user_accounts]

    return jsonify(result), 200

@login_user_account_bp.route('/<cccd>', methods=['PUT'])
def update_passenger_type(cccd):
    data = request.json
    account = UsersAccount.query.get(cccd)
    if not account:
        return jsonify({'error': 'Account not found'}), 404

    if 'passenger_type_id' in data:
        account.user.passenger_type_id = uuid.UUID(data['passenger_type_id'])
        db.session.commit()
    return jsonify({'message': 'Updated successfully'})

@login_user_account_bp.route('/passenger_types', methods=['GET'])
def get_passenger_types():
    types = PassengerType.query.all()
    return jsonify([{'id': t.id, 'type_name': t.type_name} for t in types])

@login_user_account_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user = UsersAccount.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'msg': 'Sai email hoặc mật khẩu'}), 401
    access_token = create_access_token(identity=user.user_cccd)
    return jsonify(access_token=access_token, user_cccd=user.user_cccd)

@login_user_account_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    ho_va_ten = data.get('ho_va_ten')
    cccd = data.get('cccd')
    if not all([email, password, ho_va_ten, cccd]):
        return jsonify({'msg': 'Thiếu thông tin'}), 400
    if UsersAccount.query.filter_by(email=email).first():
        return jsonify({'msg': 'Email đã tồn tại'}), 400
    if UsersAccount.query.filter_by(user_cccd=cccd).first():
        return jsonify({'msg': 'CCCD đã tồn tại'}), 400
    user = UsersAccount(user_cccd=cccd, email=email, ho_va_ten=ho_va_ten)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return jsonify({'msg': 'Đăng ký thành công'})