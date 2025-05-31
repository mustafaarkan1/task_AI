from flask import Blueprint, request, jsonify
import jwt
from datetime import datetime
from functools import wraps

from src.main import app, db
from src.models.task import Task
from src.models.user import User

tasks_bp = Blueprint('tasks', __name__)

# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            token = token.split(' ')[1]  # Remove 'Bearer ' prefix
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.filter_by(id=data['user_id']).first()
            
            if not current_user:
                return jsonify({'message': 'User not found'}), 404
                
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except (jwt.InvalidTokenError, Exception) as e:
            return jsonify({'message': f'Invalid token: {str(e)}'}), 401
            
        return f(current_user, *args, **kwargs)
    
    return decorated

# Get all tasks for the authenticated user
@tasks_bp.route('/', methods=['GET'])
@token_required
def get_all_tasks(current_user):
    tasks = Task.query.filter_by(user_id=current_user.id).all()
    return jsonify([task.to_dict() for task in tasks]), 200

# Get a specific task
@tasks_bp.route('/<int:task_id>', methods=['GET'])
@token_required
def get_task(current_user, task_id):
    task = Task.query.filter_by(id=task_id, user_id=current_user.id).first()
    
    if not task:
        return jsonify({'message': 'Task not found'}), 404
        
    return jsonify(task.to_dict()), 200

# Create a new task
@tasks_bp.route('/', methods=['POST'])
@token_required
def create_task(current_user):
    data = request.get_json()
    
    # Validate required fields
    if 'title' not in data:
        return jsonify({'message': 'Title is required'}), 400
        
    # Validate title length
    if len(data['title']) < 3 or len(data['title']) > 100:
        return jsonify({'message': 'Title must be between 3 and 100 characters'}), 400
        
    # Validate priority if provided
    if 'priority' in data and data['priority'] not in ['high', 'medium', 'low']:
        return jsonify({'message': 'Priority must be high, medium, or low'}), 400
        
    # Create new task
    new_task = Task(
        user_id=current_user.id,
        title=data['title'],
        description=data.get('description'),
        priority=data.get('priority', 'medium'),
        due_date=datetime.fromisoformat(data['due_date']) if 'due_date' in data and data['due_date'] else None,
        category=data.get('category', 'personal'),
        is_completed=data.get('is_completed', False)
    )
    
    try:
        db.session.add(new_task)
        db.session.commit()
        return jsonify(new_task.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error creating task: {str(e)}'}), 500

# Update a task
@tasks_bp.route('/<int:task_id>', methods=['PUT'])
@token_required
def update_task(current_user, task_id):
    task = Task.query.filter_by(id=task_id, user_id=current_user.id).first()
    
    if not task:
        return jsonify({'message': 'Task not found'}), 404
        
    data = request.get_json()
    
    # Update fields if provided
    if 'title' in data:
        if len(data['title']) < 3 or len(data['title']) > 100:
            return jsonify({'message': 'Title must be between 3 and 100 characters'}), 400
        task.title = data['title']
        
    if 'description' in data:
        task.description = data['description']
        
    if 'priority' in data:
        if data['priority'] not in ['high', 'medium', 'low']:
            return jsonify({'message': 'Priority must be high, medium, or low'}), 400
        task.priority = data['priority']
        
    if 'due_date' in data:
        task.due_date = datetime.fromisoformat(data['due_date']) if data['due_date'] else None
        
    if 'category' in data:
        task.category = data['category']
        
    if 'is_completed' in data:
        task.is_completed = data['is_completed']
    
    try:
        db.session.commit()
        return jsonify(task.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error updating task: {str(e)}'}), 500

# Delete a task
@tasks_bp.route('/<int:task_id>', methods=['DELETE'])
@token_required
def delete_task(current_user, task_id):
    task = Task.query.filter_by(id=task_id, user_id=current_user.id).first()
    
    if not task:
        return jsonify({'message': 'Task not found'}), 404
        
    try:
        db.session.delete(task)
        db.session.commit()
        return jsonify({'message': 'Task deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error deleting task: {str(e)}'}), 500
