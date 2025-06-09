from flask import Blueprint, request, jsonify
from app.models.device import Device
from app.database import db

device_bp = Blueprint('devices', __name__)

@device_bp.route('/', methods=['POST'])
def create_device():
    data = request.json
    device = Device(
        name=data['name'],
        bus_code=data['bus_code'],
        location=data.get('location'),
        is_active=data.get('is_active', True)
    )
    db.session.add(device)
    db.session.commit()
    return jsonify({'message': 'Thiết bị đã được thêm'}), 201

@device_bp.route('/', methods=['GET'])
def get_all_devices():
    try:
        devices = Device.query.all()
        return jsonify([{
            'id': str(d.id),
            'name': d.name,
            'bus_code': d.bus_code,
            'location': d.location,
            'is_active': d.is_active
        } for d in devices]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@device_bp.route('/<uuid:id>', methods=['PUT'])
def update_device(id):
    device = Device.query.get_or_404(id)
    data = request.json
    device.name = data.get('name', device.name)
    device.bus_code = data.get('bus_code', device.bus_code)
    device.location = data.get('location', device.location)
    device.is_active = data.get('is_active', device.is_active)
    db.session.commit()
    return jsonify({'message': 'Thiết bị đã được cập nhật'})

@device_bp.route('/<uuid:id>', methods=['DELETE'])
def delete_device(id):
    device = Device.query.get_or_404(id)
    db.session.delete(device)
    db.session.commit()
    return jsonify({'message': 'Thiết bị đã được xóa'})
