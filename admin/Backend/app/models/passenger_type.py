from app.database import db
import uuid
from sqlalchemy.dialects.postgresql import UUID


class PassengerType(db.Model):
    __tablename__ = 'passenger_types'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)

    users = db.relationship('User', backref='passenger_type', lazy=True)