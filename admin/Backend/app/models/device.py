from app import db
from sqlalchemy.dialects.postgresql import UUID
import uuid

class Device(db.Model):
    __tablename__ = 'devices'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(100), nullable=False)            
    bus_code = db.Column(db.String(50), nullable=False)         
    location = db.Column(db.String(100))
    is_active = db.Column(db.Boolean, default=True)
    last_ping_at = db.Column(db.DateTime)
