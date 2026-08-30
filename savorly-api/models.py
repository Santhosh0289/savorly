from datetime import datetime, timedelta, timezone
from extensions import db
import bcrypt
import secrets

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    password_hash = db.Column(db.String(200), nullable=True)
    phone = db.Column(db.String(20), unique=True, nullable=True)
    role = db.Column(db.String(10), default="user")  # 'user' or 'admin'
    auth_provider = db.Column(db.String(20), default="password")
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    orders = db.relationship("Order", backref="customer", lazy=True)

    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    def check_password(self, password):
        return bool(self.password_hash) and bcrypt.checkpw(password.encode(), self.password_hash.encode())

    def to_dict(self):
        return {"id": self.id, "name": self.name, "email": self.email,
                "phone": self.phone, "role": self.role, "is_verified": self.is_verified,
                "auth_provider": self.auth_provider,
                "created_at": self.created_at.replace(tzinfo=timezone.utc).isoformat()}


class OtpCode(db.Model):
    __tablename__ = "otp_codes"
    id = db.Column(db.Integer, primary_key=True)
    target = db.Column(db.String(120), nullable=False, index=True)
    code = db.Column(db.String(6), nullable=False)
    purpose = db.Column(db.String(20), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    @staticmethod
    def generate(target, purpose, ttl_minutes=10):
        OtpCode.query.filter_by(target=target, purpose=purpose).delete()
        code = f"{secrets.randbelow(900000) + 100000}"
        db.session.add(OtpCode(
            target=target,
            code=code,
            purpose=purpose,
            expires_at=datetime.utcnow() + timedelta(minutes=ttl_minutes),
        ))
        db.session.commit()
        return code

    @staticmethod
    def verify(target, purpose, code):
        otp = OtpCode.query.filter_by(target=target, purpose=purpose, code=code).first()
        if not otp or otp.expires_at < datetime.utcnow():
            if otp:
                db.session.delete(otp)
                db.session.commit()
            return False
        db.session.delete(otp)
        db.session.commit()
        return True


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
