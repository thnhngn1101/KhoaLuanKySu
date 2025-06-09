from app.database import db

class Province(db.Model):
    __tablename__ = 'provinces'

    province_code = db.Column(db.String(10), primary_key=True)
    name = db.Column(db.String(100), nullable=False)

    users = db.relationship('User', backref='province', lazy=True)