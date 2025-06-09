from flask import Blueprint, request, jsonify
from app.models.bus_route import BusRoute, BusRouteDetail, TicketPrice
from app.database import db

bus_route_bp = Blueprint('bus_routes', __name__)

# --- CRUD tuyến ---
@bus_route_bp.route('/', methods=['GET'])
def get_routes():
    routes = BusRoute.query.all()
    return jsonify([
        {
            'id': r.id,
            'route_name': r.route_name,
            'detail': {
                'departure_description': r.detail.departure_description if r.detail else '',
                'arrival_description': r.detail.arrival_description if r.detail else '',
                'operator': r.detail.operator if r.detail else '',
                'route_type': r.detail.route_type if r.detail else '',
                'distance_km': str(r.detail.distance_km) if r.detail and r.detail.distance_km else '',
                'vehicle_type': r.detail.vehicle_type if r.detail else '',
                'service_hours': r.detail.service_hours if r.detail else '',
                'trip_count': r.detail.trip_count if r.detail else '',
                'trip_duration': r.detail.trip_duration if r.detail else '',
                'trip_interval': r.detail.trip_interval if r.detail else ''
            },
            'prices': [
                {'id': p.id, 'ticket_type': p.ticket_type, 'price': p.price}
                for p in r.prices
            ]
        }
        for r in routes
    ])

@bus_route_bp.route('/', methods=['POST'])
def create_route():
    data = request.json
    route = BusRoute(id=data['id'], route_name=data['route_name'])
    detail = BusRouteDetail(
        route_id=data['id'],
        departure_description=data.get('departure_description'),
        arrival_description=data.get('arrival_description'),
        operator=data.get('operator'),
        route_type=data.get('route_type'),
        distance_km=data.get('distance_km'),
        vehicle_type=data.get('vehicle_type'),
        service_hours=data.get('service_hours'),
        trip_count=data.get('trip_count'),
        trip_duration=data.get('trip_duration'),
        trip_interval=data.get('trip_interval')
    )
    db.session.add(route)
    db.session.add(detail)

    for price in data.get('prices', []):
        db.session.add(TicketPrice(
            id=price['id'],
            route_id=data['id'],
            ticket_type=price['ticket_type'],
            price=price['price']
        ))
    db.session.commit()
    return jsonify({'message': 'Route created successfully'})

@bus_route_bp.route('/<route_id>', methods=['PUT'])
def update_route(route_id):
    route = BusRoute.query.get(route_id)
    if not route:
        return jsonify({'error': 'Route not found'}), 404
    data = request.json
    route.route_name = data['route_name']
    if route.detail:
        route.detail.departure_description = data.get('departure_description')
        route.detail.arrival_description = data.get('arrival_description')
        route.detail.operator = data.get('operator')
        route.detail.route_type = data.get('route_type')
        route.detail.distance_km = data.get('distance_km')
        route.detail.vehicle_type = data.get('vehicle_type')
        route.detail.service_hours = data.get('service_hours')
        route.detail.trip_count = data.get('trip_count')
        route.detail.trip_duration = data.get('trip_duration')
        route.detail.trip_interval = data.get('trip_interval')

    TicketPrice.query.filter_by(route_id=route_id).delete()
    for price in data.get('prices', []):
        db.session.add(TicketPrice(
            id=price['id'],
            route_id=route_id,
            ticket_type=price['ticket_type'],
            price=price['price']
        ))

    db.session.commit()
    return jsonify({'message': 'Route updated successfully'})

@bus_route_bp.route('/<route_id>', methods=['DELETE'])
def delete_route(route_id):
    route = BusRoute.query.get(route_id)
    if not route:
        return jsonify({'error': 'Route not found'}), 404
    db.session.delete(route)
    db.session.commit()
    return jsonify({'message': 'Route deleted successfully'})