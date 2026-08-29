from flask import Flask, jsonify
from sqlalchemy.exc import IntegrityError
from config import Config
from extensions import db, jwt, cors

from routes.auth import auth_bp
from routes.foods import foods_bp
from routes.orders import orders_bp
from routes.admin import admin_bp
from routes.assistant import assistant_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": [
        "http://localhost:5173",
        "https://savorly-1.onrender.com"
    ]}})

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(foods_bp, url_prefix="/api/foods")
    app.register_blueprint(orders_bp, url_prefix="/api/orders")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(assistant_bp, url_prefix="/api/assistant")

    with app.app_context():
        db.create_all()

    @app.route("/")
    def index():
        return jsonify({
            "message": "Savorly API is running",
            "health_check": "/api/health",
            "foods": "/api/foods/"
        })

    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok"})

    @app.errorhandler(IntegrityError)
    def handle_integrity_error(error):
        db.session.rollback()
        return jsonify({"error": "This action conflicts with existing related data."}), 400

    @app.errorhandler(500)
    def handle_server_error(error):
        db.session.rollback()
        return jsonify({"error": "Something went wrong on the server."}), 500

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)