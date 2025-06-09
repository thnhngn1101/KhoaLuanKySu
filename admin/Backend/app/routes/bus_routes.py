# from flask import Blueprint, request, jsonify
# from app.models.bus_route import Bus
# from datetime import datetime
# from app.database import db
# bus_bp = Blueprint('bus_bp', __name__)

# # Get all buses
# @bus_bp.route('/', methods=['GET'])
# def get_all_buses():
#     buses = Bus.query.all()
#     return jsonify([{
#         'license_plate': b.license_plate,
#         'route_id': b.route_id,
#         'capacity': b.capacity,
#         'vehicle_type': b.vehicle_type,
#         'is_active': b.is_active,
#         'created_at': b.created_at.isoformat()
#     } for b in buses]), 200

# # Get a single bus by license_plate
# @bus_bp.route('/<string:license_plate>', methods=['GET'])
# def get_bus(license_plate):
#     bus = Bus.query.get_or_404(license_plate)
#     return jsonify({
#         'license_plate': bus.license_plate,
#         'route_id': bus.route_id,
#         'capacity': bus.capacity,
#         'vehicle_type': bus.vehicle_type,
#         'is_active': bus.is_active,
#         'created_at': bus.created_at.isoformat()
#     })

# # Create a new bus
# @bus_bp.route('/', methods=['POST'])
# def create_bus():
#     data = request.get_json()
#     new_bus = Bus(
#         license_plate=data['license_plate'],
#         route_id=data['route_id'],
#         capacity=data['capacity'],
#         vehicle_type=data.get('vehicle_type'),
#         is_active=data.get('is_active', True),
#         created_at=datetime.utcnow()
#     )
#     db.session.add(new_bus)
#     db.session.commit()
#     return jsonify({'message': 'Bus created successfully'}), 201

# # Update a bus
# @bus_bp.route('/<string:license_plate>', methods=['PUT'])
# def update_bus(license_plate):
#     data = request.get_json()
#     bus = Bus.query.get_or_404(license_plate)

#     bus.route_id = data.get('route_id', bus.route_id)
#     bus.capacity = data.get('capacity', bus.capacity)
#     bus.vehicle_type = data.get('vehicle_type', bus.vehicle_type)
#     bus.is_active = data.get('is_active', bus.is_active)

#     db.session.commit()
#     return jsonify({'message': 'Bus updated successfully'})

# # Delete a bus
# @bus_bp.route('/<string:license_plate>', methods=['DELETE'])
# def delete_bus(license_plate):
#     bus = Bus.query.get_or_404(license_plate)
#     db.session.delete(bus)
#     db.session.commit()
#     return jsonify({'message': 'Bus deleted successfully'})
