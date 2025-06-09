from flask import Blueprint, request, jsonify
from app.models.driver import Driver, DriverAccount
from app.database import db
from datetime import datetime
driver_bp = Blueprint('drivers', __name__)
# GET: Lấy tất cả tài xế
@driver_bp.route('/', methods=['GET'])
def get_all_drivers():
    drivers = Driver.query.all()
    return jsonify([{
        'cccd': d.driver_cccd,
        'full_name': d.full_name,
        'phone_number': d.phone_number,
        'gender': d.gender,
        'birth_year': d.birth_year,
        'age': d.age,
        'created_at': d.created_at,
        'is_active': d.account.is_active if d.account else None
    } for d in drivers]), 200
    
# POST: Tạo tài xế mới
@driver_bp.route('/', methods=['POST'])
def create_driver():
    try:
        data = request.get_json()
        driver = Driver(
            driver_cccd=data['cccd'],
            full_name=data['full_name'],
            phone_number=data['phone_number'],
            gender=data['gender'],
            birth_year=data['birth_year'],
            age=datetime.now().year - int(data['birth_year']),
            created_at=datetime.utcnow()
        )
        db.session.add(driver)
        db.session.commit()
        return jsonify({'message': 'Tạo tài xế thành công'}), 201
    except Exception as e:
            print("Lỗi tạo tài xế:", e)  # In lỗi ra terminal
            return jsonify({'error': 'Lỗi khi tạo tài xế', 'details': str(e)}), 500 

# PUT: Cập nhật thông tin tài xế
@driver_bp.route('/<string:cccd>', methods=['PUT'])
def update_driver(cccd):
    driver = Driver.query.get(cccd)
    if not driver:
        return jsonify({'error': 'Không tìm thấy tài xế'}), 404

    data = request.get_json()
    driver.full_name = data['full_name']
    driver.phone_number = data['phone_number']
    driver.gender = data['gender']
    driver.birth_year = data['birth_year']
    driver.age = datetime.now().year - int(data['birth_year'])
    db.session.commit()
    return jsonify({'message': 'Cập nhật tài xế thành công'}), 200

# DELETE: Xóa tài xế
@driver_bp.route('/<string:cccd>', methods=['DELETE'])
def delete_driver(cccd):
    driver = Driver.query.get(cccd)
    if not driver:
        return jsonify({'error': 'Không tìm thấy tài xế'}), 404

    db.session.delete(driver)
    db.session.commit()
    return jsonify({'message': 'Xóa tài xế thành công'}), 200