from app import create_app
from extensions import db
from models import User, Food

app = create_app()
with app.app_context():
    if not User.query.filter_by(email="admin@savorly.com").first():
        admin = User(name="Admin", email="admin@savorly.com", role="admin")
        admin.set_password("admin123")
        db.session.add(admin)

    sample_foods = [
        ("Jeera Rice", "Steamed rice tempered with cumin.", 120, "Mains"),
        ("Pepper Chicken", "Slow-cooked, dry-roasted with crushed pepper.", 220, "Mains"),
        ("Kachumber Salad", "Cucumber, tomato, onion and lime.", 60, "Salad"),
        ("House Chutneys", "Tomato gravy + coconut-ginger dip.", 40, "Sides"),
    ]
    for name, desc, price, cat in sample_foods:
        if not Food.query.filter_by(name=name).first():
            db.session.add(Food(name=name, description=desc, price=price, category=cat))

    db.session.commit()
    print("Seed complete. Admin login: admin@savorly.com / admin123")