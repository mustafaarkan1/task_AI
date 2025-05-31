from flask import Blueprint, request, jsonify
import jwt
from datetime import datetime, timedelta
from functools import wraps

from src.main import app, db
from src.models.notification import Notification
from src.models.user import User
from src.models.task import Task

notifications_bp = Blueprint('notifications', __name__)

# Authentication decorator (same as in tasks.py)
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

# Get all notifications for the authenticated user
@notifications_bp.route('/', methods=['GET'])
@token_required
def get_all_notifications(current_user):
    notifications = Notification.query.filter_by(user_id=current_user.id).order_by(Notification.created_at.desc()).all()
    return jsonify([notification.to_dict() for notification in notifications]), 200

# Mark notification as read
@notifications_bp.route('/<int:notification_id>/read', methods=['PUT'])
@token_required
def mark_notification_read(current_user, notification_id):
    notification = Notification.query.filter_by(id=notification_id, user_id=current_user.id).first()
    
    if not notification:
        return jsonify({'message': 'Notification not found'}), 404
        
    notification.is_read = True
    
    try:
        db.session.commit()
        return jsonify(notification.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error updating notification: {str(e)}'}), 500

# Mark all notifications as read
@notifications_bp.route('/read-all', methods=['PUT'])
@token_required
def mark_all_notifications_read(current_user):
    try:
        Notification.query.filter_by(user_id=current_user.id, is_read=False).update({'is_read': True})
        db.session.commit()
        return jsonify({'message': 'All notifications marked as read'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error updating notifications: {str(e)}'}), 500

# Delete a notification
@notifications_bp.route('/<int:notification_id>', methods=['DELETE'])
@token_required
def delete_notification(current_user, notification_id):
    notification = Notification.query.filter_by(id=notification_id, user_id=current_user.id).first()
    
    if not notification:
        return jsonify({'message': 'Notification not found'}), 404
        
    try:
        db.session.delete(notification)
        db.session.commit()
        return jsonify({'message': 'Notification deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error deleting notification: {str(e)}'}), 500

# Create notification for due tasks (would be called by a scheduler in production)
@notifications_bp.route('/check-due-tasks', methods=['POST'])
@token_required
def check_due_tasks(current_user):
    # Find tasks due within the next 24 hours that don't have notifications yet
    now = datetime.utcnow()
    tomorrow = now + timedelta(days=1)
    
    due_tasks = Task.query.filter(
        Task.user_id == current_user.id,
        Task.is_completed == False,
        Task.due_date.between(now, tomorrow)
    ).all()
    
    notifications_created = 0
    
    for task in due_tasks:
        # Check if notification already exists for this task
        existing_notification = Notification.query.filter_by(
            user_id=current_user.id,
            task_id=task.id,
            is_read=False
        ).first()
        
        if not existing_notification:
            # Create new notification
            hours_remaining = int((task.due_date - now).total_seconds() / 3600)
            
            new_notification = Notification(
                user_id=current_user.id,
                task_id=task.id,
                title=f"تذكير: مهمة قادمة",
                message=f"المهمة '{task.title}' مستحقة خلال {hours_remaining} ساعة."
            )
            
            db.session.add(new_notification)
            notifications_created += 1
    
    try:
        db.session.commit()
        return jsonify({
            'message': f'Created {notifications_created} new notifications',
            'count': notifications_created
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error creating notifications: {str(e)}'}), 500
