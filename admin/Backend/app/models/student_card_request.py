from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from uuid import uuid4
from datetime import datetime
from app.database import db
import uuid
class StudentCardRequest(db.Model):
    __tablename__ = 'student_card_requests'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_cccd = db.Column(String(12), ForeignKey("users.cccd"), nullable=False)
    image_url = db.Column(String(255), nullable=False)
    enroll_year = db.Column(Integer)
    status = db.Column(String(20), default="pending")
    note = db.Column(String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    reviewed_at = db.Column(DateTime)
    user = db.relationship('User', backref='student_card_requests')

