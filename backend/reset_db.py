from app import app, db
from models import User
import bcrypt

if __name__ == "__main__":
    with app.app_context():
        # Using SQLAlchemy to reflect and drop all tables to ensure clean slate for schema change
        print("Dropping all tables...")
        db.drop_all()
        print("Creating all tables with new schema...")
        db.create_all()
        
        # Create default admin user
        username = "admin"
        password = "password123"
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        admin = User(username=username, password_hash=hashed_password)
        db.session.add(admin)
        db.session.commit()
        
        print(f"Database reset. Created default user: {username} / {password}")
