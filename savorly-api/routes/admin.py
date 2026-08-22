from flask import Blueprint, request, jsonify
from functools import wraps
from extensions import db
from models import User, Food, Order
from flask_jwt_extended import jwt_required, get_jwt

admin_bp = Blueprint("admin", __name__)

def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if claims.get("role") != "admin":
            return jsonify({"error": "Admins only"}), 403
        return fn(*args, **kwargs)
    return wrapper

# ---- Customers ----
@admin_bp.route("/customers", methods=["GET"])
@admin_required
def customers():
    users = User.query.filter_by(role="user").all()
    return jsonify([u.to_dict() for u in users])

# ---- Foods CRUD ----
@admin_bp.route("/foods", methods=["POST"])
@admin_required
def add_food():
    data = request.get_json()
    food = Food(name=data["name"], description=data.get("description"),
                price=data["price"], category=data.get("category"),
                image_url=data.get("image_url"))
    db.session.add(food)
    db.session.commit()
    return jsonify(food.to_dict()), 201

@admin_bp.route("/foods/<int:food_id>", methods=["PUT"])
@admin_required
def update_food(food_id):
    food = Food.query.get_or_404(food_id)
    data = request.get_json()
    for field in ["name", "description", "price", "category", "image_url", "is_available"]:
        if field in data:
            setattr(food, field, data[field])
    db.session.commit()
    return jsonify(food.to_dict())

@admin_bp.route("/foods/<int:food_id>", methods=["DELETE"])
@admin_required
def delete_food(food_id):
    food = Food.query.get_or_404(food_id)
    db.session.delete(food)
    db.session.commit()
    return jsonify({"message": "deleted"})

# ---- Orders / Queue ----
@admin_bp.route("/orders", methods=["GET"])
@admin_required
def all_orders():
    # FIFO queue: earliest placed first
    orders = Order.query.order_by(Order.created_at.asc()).all()
    return jsonify([o.to_dict() for o in orders])

@admin_bp.route("/orders/<int:order_id>/status", methods=["PATCH"])
@admin_required
def update_status(order_id):
    order = Order.query.get_or_404(order_id)
    order.status = request.get_json()["status"]
    db.session.commit()
    return jsonify(order.to_dict())

# ---- Dashboard stats ----
@admin_bp.route("/stats", methods=["GET"])
@admin_required
def stats():
    from sqlalchemy import func
    orders = Order.query.all()
    total_revenue = sum(o.total for o in orders)
    total_orders = len(orders)
    total_customers = User.query.filter_by(role="user").count()

    by_status = db.session.query(Order.status, func.count(Order.id)).group_by(Order.status).all()
    revenue_by_day = db.session.query(
        func.date(Order.created_at), func.sum(Order.total)
    ).group_by(func.date(Order.created_at)).order_by(func.date(Order.created_at)).all()

    top_foods = db.session.query(
        Food.name, func.sum(db.session.query(func.count()).select_from(Food).scalar_subquery())
    )  # placeholder replaced below

    from models import OrderItem
    top_foods = db.session.query(
        OrderItem.food_name, func.sum(OrderItem.quantity).label("qty")
    ).group_by(OrderItem.food_name).order_by(func.sum(OrderItem.quantity).desc()).limit(5).all()

    return jsonify({
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "total_customers": total_customers,
        "by_status": [{"status": s, "count": c} for s, c in by_status],
        "revenue_by_day": [{"date": str(d), "revenue": r} for d, r in revenue_by_day],
        "top_foods": [{"name": n, "qty": q} for n, q in top_foods],
    })