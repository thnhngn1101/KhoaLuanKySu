from flask import Flask
from flask_cors import CORS
from driver_api import driver_bp
from face_api import face_bp
from payment_api import payment_bp    # ← Dòng này

app = Flask(__name__)
CORS(app)

# Đăng ký các blueprint
app.register_blueprint(driver_bp)
app.register_blueprint(face_bp)
app.register_blueprint(payment_bp)    # ← Dòng này

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
