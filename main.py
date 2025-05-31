from datetime import datetime, timedelta
from flask import Flask, request, jsonify
import jwt
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))  # DON'T CHANGE THIS !!!

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-for-jwt'  # In production, use environment variable

# Enable database with SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{os.getenv('DB_USERNAME', 'root')}:{os.getenv('DB_PASSWORD', 'password')}@{os.getenv('DB_HOST', 'localhost')}:{os.getenv('DB_PORT', '3306')}/{os.getenv('DB_NAME', 'mydb')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configure CORS
from src.routes.cors_config import configure_cors
configure_cofrom src.main import app, db

# Import models after db initialization to avoid circular imports
from src.models.user import User
from src.models.task import Task
from src.models.notification import Notification

# Import routes
from src.routes.auth import auth_bp
from src.routes.tasks import tasks_bp
from src.routes.notifications import notifications_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(tasks_bp, url_prefix='/api/tasks')
app.register_blueprint(notifications_bp, url_prefix='/api/notifications')

@app.route('/')
def index():
    return jsonify({"message": "Task Manager API is running"}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create database tables
    app.run(host='0.0.0.0', port=5000, debug=True)
