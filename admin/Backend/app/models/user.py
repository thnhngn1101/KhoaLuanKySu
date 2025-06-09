from app.database import db
from sqlalchemy.dialects.postgresql import UUID
from passlib.hash import bcrypt

class User(db.Model):
    __tablename__ = 'users'

    cccd = db.Column(db.String(12), primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100))
    phone_number = db.Column(db.String(20))

    passenger_type_id = db.Column(UUID(as_uuid=True), db.ForeignKey('passenger_types.id'), nullable=False)
    province_code = db.Column(db.String(10), db.ForeignKey('provinces.province_code'), nullable=False)

    student_id = db.Column(db.String(20))
    student_enroll_year = db.Column(db.String(4))
    gender = db.Column(db.String(10))
    birth_year = db.Column(db.String(4))
    age = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    
class UsersAccount(db.Model):
    __tablename__ = 'users_account'
    user_cccd = db.Column(db.String(12), db.ForeignKey('users.cccd'), primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    ho_va_ten = db.Column(db.String(100), nullable=False)
    password = db.Column(db.Text, nullable=False)
    is_verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.Text)
    reset_token = db.Column(db.Text)
    
    user = db.relationship('User', backref='users_account', lazy=True)

    def set_password(self, raw_password):
        self.password = bcrypt.hash(raw_password)

    def check_password(self, raw_password):
        return bcrypt.verify(raw_password, self.password)
