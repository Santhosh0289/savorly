from datetime import datetime, timezone
from extensions import db
import bcrypt

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(20))
    role = db.Column(db.String(10), default="user")  # 'user' or 'admin'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    orders = db.relationship("Order", backref="customer", lazy=True)

    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    def check_password(self, password):
        return bcrypt.checkpw(password.encode(), self.password_hash.encode())

    def to_dict(self):
        return {"id": self.id, "name": self.name, "email": self.email,
                "phone": self.phone, "role": self.role,
                "created_at": self.created_at.replace(tzinfo=timezone.utc).isoformat()}


class Food(db.Model):
    __tablename__ = "foods"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.String(300))
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50))
    image_url = db.Column(db.Text)   # was String(300) — base64 data URIs need TEXT
    is_available = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "description": self.description,
                "price": self.price, "category": self.category,
                "image_url": self.image_url, "is_available": self.is_available}


class Order(db.Model):
    __tablename__ = "orders"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    address = db.Column(db.String(300), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    notes = db.Column(db.String(300))
    status = db.Column(db.String(20), default="queued")  # queued, cooking, out_for_delivery, delivered
    total = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # used for queue ordering

    items = db.relationship("OrderItem", backref="order", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "customer_name": self.customer.name,
            "customer_email": self.customer.email,
            "address": self.address,
            "phone": self.phone,
            "notes": self.notes,
            "status": self.status,
            "total": self.total,
            "created_at": self.created_at.replace(tzinfo=timezone.utc).isoformat(),
            "items": [i.to_dict() for i in self.items],
        }


class OrderItem(db.Model):
    __tablename__ = "order_items"
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"), nullable=False)
    food_id = db.Column(db.Integer, db.ForeignKey("foods.id"), nullable=False)
    food_name = db.Column(db.String(120))
    quantity = db.Column(db.Integer, default=1)
    price = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {"food_id": self.food_id, "food_name": self.food_name,
                "quantity": self.quantity, "price": self.price}
