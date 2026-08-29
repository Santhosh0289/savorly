from flask import Blueprint, request, jsonify
from extensions import db
from models import Order, OrderItem, Food
from flask_jwt_extended import jwt_required, get_jwt_identity

orders_bp = Blueprint("orders", __name__)

@orders_bp.route("/", methods=["POST"])
@jwt_required()
def place_order():
    data = request.get_json()
    user_id = int(get_jwt_identity())
    items = data["items"]  # [{food_id, quantity}]

    total = 0
    order = Order(user_id=user_id, address=data["address"],
                  phone=data["phone"], notes=data.get("notes"), total=0)
    db.session.add(order)
    db.session.flush()

    for it in items:
        food = Food.query.get(it["food_id"])
        if not food:
            continue
        line_total = food.price * it["quantity"]
        total += line_total
        db.session.add(OrderItem(order_id=order.id, food_id=food.id,
                                  food_name=food.name, quantity=it["quantity"],
                                  price=food.price))

    order.total = total
    db.session.commit()
    return jsonify(order.to_dict()), 201


@orders_bp.route("/my", methods=["GET"])
@jwt_required()
def my_orders():
    user_id = int(get_jwt_identity())
    orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
    return jsonify([o.to_dict() for o in orders])
