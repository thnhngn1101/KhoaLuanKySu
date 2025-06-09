from app.database import db
from datetime import datetime
class Driver(db.Model):
    __tablename__ = 'drivers'
    driver_cccd = db.Column(db.String(12), primary_key=True)
    full_name = db.Column(db.Text, nullable=False)
    phone_number = db.Column(db.String)
    gender = db.Column(db.String)
    birth_year = db.Column(db.Integer)
    age = db.Column(db.Integer)
    created_at = db.Column(db.DateTime)

    account = db.relationship("DriverAccount", backref="driver", uselist=False)


class DriverAccount(db.Model):
    __tablename__ = 'driver_accounts'
    driver_cccd = db.Column(db.String(12), db.ForeignKey('drivers.driver_cccd'), primary_key=True)
    driver_password = db.Column(db.Text, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    last_login = db.Column(db.DateTime)
    
# class DriverAssignment(db.Model):
#     __tablename__ = 'driver_assignments'

#     license_plate = db.Column(db.String, db.ForeignKey('buses.license_plate', ondelete='CASCADE'), primary_key=True)
#     driver_cccd = db.Column(db.String(12), db.ForeignKey('drivers.driver_cccd', ondelete='CASCADE'), primary_key=True)
#     assigned_date = db.Column(db.Date, primary_key=True)
#     login_time = db.Column(db.DateTime, default=datetime.utcnow)
#     bus = db.relationship('Bus', back_populates='assignments')
#     driver = db.relationship('Driver', back_populates='assignments')