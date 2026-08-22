from flask import Blueprint, jsonify
from models import Food

foods_bp = Blueprint("foods", __name__)

@foods_bp.route("/", methods=["GET"])
def get_foods():
    foods = Food.query.filter_by(is_available=True).all()
    return jsonify([f.to_dict() for f in foods])