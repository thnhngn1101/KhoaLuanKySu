from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from app.database import db
from app.routes.user_routes import user_bp
from app.models import user  
from app.models.user import User
from app.models.provice_code import Province
from app.models.passenger_type import PassengerType
from app.routes.driver_routes import driver_bp
from app.models import device 
from app.routes.device_routes import device_bp
# from app.routes.transaction_routes import transaction_bp
from app.routes.driver_account import driver_account_bp
from app.routes.login_user_account import login_user_account_bp
from app.routes.topup_routes import topup_bp
from app.routes.student_card_routes import student_card_bp
# from app.routes.driver_assignments import driver_assignment_bp
from app.routes.bus_route_routes import bus_route_bp
# from app.routes.bus_routes import bus_bp
from app.routes.dashboard_routes import dashboard_bp
import uuid
from flask_jwt_extended import JWTManager

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)
    app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://khoaluan_owner:npg_JOW4CSV8fqId@ep-rapid-cloud-a1nzf35c-pooler.ap-southeast-1.aws.neon.tech/khoaluan?sslmode=require"

    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'b2Qw8k3Jv9nKp1xLz7Qw4e5sT8uV6yX2z1A0b9C7d6E5F4G3H2J1K0L9M8N7B6V5'

    db.init_app(app)
    migrate = Migrate(app, db) 

    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(driver_bp, url_prefix='/api/drivers')
    app.register_blueprint(driver_account_bp, url_prefix='/api/driver-accounts')
    app.register_blueprint(login_user_account_bp)
    app.register_blueprint(topup_bp, url_prefix='/api/topup') 
    app.register_blueprint(student_card_bp, url_prefix='/api/student-card')
    # app.register_blueprint(driver_assignment_bp, url_prefix='/api/driver-assignment')
    app.register_blueprint(bus_route_bp, url_prefix='/api/bus-routes')
    # app.register_blueprint(bus_bp, url_prefix='/api/buses')
    
    app.register_blueprint(device_bp, url_prefix='/api/devices')
    # app.register_blueprint(transaction_bp, url_prefix='/api/transactions')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    
    jwt = JWTManager(app)

    return app

