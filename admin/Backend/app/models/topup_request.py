from app.database import db
import uuid
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime

class TopUpRequest(db.Model):
    __tablename__ = 'topup_requests'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_cccd = db.Column(db.String(12), db.ForeignKey('users.cccd'), nullable=False)
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='pending')
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    approved_at = db.Column(db.DateTime)

    user = db.relationship('User', backref='topup_requests')
