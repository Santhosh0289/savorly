from flask import Flask, jsonify
from config import Config
from extensions import db, jwt, cors

from routes.auth import auth_bp
from routes.foods import foods_bp
from routes.orders import orders_bp
from routes.admin import admin_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": [
        "http://localhost:5173",
        "https://savorly-nine.vercel.app",
        r"https://savorly-.*\.vercel\.app"
    ]}})

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(foods_bp, url_prefix="/api/foods")
    app.register_blueprint(orders_bp, url_prefix="/api/orders")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

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

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)