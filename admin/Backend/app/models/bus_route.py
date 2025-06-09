from app import db
from datetime import datetime

class BusRoute(db.Model):
    __tablename__ = 'bus_routes'

    id = db.Column(db.String(10), primary_key=True)
    route_name = db.Column(db.String(255), nullable=False)

    detail = db.relationship("BusRouteDetail", back_populates="route", uselist=False, cascade="all, delete")
    prices = db.relationship("TicketPrice", back_populates="route", cascade="all, delete")


class BusRouteDetail(db.Model):
    __tablename__ = 'bus_route_details'

    route_id = db.Column(db.String(10), db.ForeignKey('bus_routes.id'), primary_key=True)
    departure_description = db.Column(db.Text)
    arrival_description = db.Column(db.Text)
    operator = db.Column(db.Text)
    route_type = db.Column(db.String(100))
    distance_km = db.Column(db.Numeric(5,2))
    vehicle_type = db.Column(db.String(50))
    service_hours = db.Column(db.String(50))
    trip_count = db.Column(db.String(50))
    trip_duration = db.Column(db.String(50))
    trip_interval = db.Column(db.String(50))

    route = db.relationship("BusRoute", back_populates="detail")


class TicketPrice(db.Model):
    __tablename__ = 'ticket_prices'

    id = db.Column(db.String, primary_key=True)
    route_id = db.Column(db.String, db.ForeignKey('bus_routes.id'), nullable=False)
    ticket_type = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Integer, nullable=False)

    route = db.relationship("BusRoute", back_populates="prices")
    
# class Bus(db.Model):
#     __tablename__ = 'buses'

#     license_plate = db.Column(db.String, primary_key=True)
#     route_id = db.Column(db.String, db.ForeignKey('bus_routes.id', ondelete='CASCADE'), nullable=False)
#     capacity = db.Column(db.Integer, nullable=False)
#     vehicle_type = db.Column(db.String)
#     is_active = db.Column(db.Boolean, default=True)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)
#     bus = db.relationship("Bus", backref="assignments") 
#     route = db.relationship('BusRoute', backref=db.backref('buses', cascade='all, delete'))