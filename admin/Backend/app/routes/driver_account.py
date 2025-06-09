from flask import Blueprint, request, jsonify
from app.models.driver import Driver, DriverAccount
from app.database import db
from werkzeug.security import generate_password_hash
driver_account_bp = Blueprint('driver_account', __name__, url_prefix='/api/drivers')
@driver_account_bp.route('', methods=['GET', 'OPTIONS'])
def test_route():
    data = request.get_json()

    driver = Driver.query.get(data.get('driver_cccd'))
    if not driver:
        return jsonify({'error': 'Driver not found'}), 404

    if driver.account:
        return jsonify({'error': 'Account already exists for this driver'}), 400

    account = DriverAccount(
        driver_cccd=data['driver_cccd'],
        driver_password=generate_password_hash(data['password']),
        is_active=True
    )
    db.session.add(account)
    db.session.commit()

    return jsonify({'message': 'Tạo tài khoản tài xế thành công'}), 201
