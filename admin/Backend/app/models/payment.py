from app.database import db

class Payment(db.Model):
    __tablename__ = 'payments'

    id = db.Column(db.String(36), primary_key=True)
    user_cccd = db.Column(db.String(12), db.ForeignKey('users.cccd'), nullable=False)
    bus_license_plate = db.Column(db.String, nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    discount_applied = db.Column(db.Numeric(10, 2), default=0)
    paid_at = db.Column(db.DateTime, nullable=False)

    user = db.relationship('User', backref='payments', lazy=True) 