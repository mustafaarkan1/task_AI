# Task Manager App - Database Schema Design

This document outlines the database schema for the Task Manager application, detailing the structure of collections/tables, fields, relationships, and data types.

## Database Overview

The application will use a relational database structure (SQLAlchemy with MySQL) as per the Flask template setup. The schema consists of two primary entities:

1. Users - Storing user account information
2. Tasks - Storing task details with references to users

## Schema Details

### Users Table

| Field Name | Data Type | Constraints | Description |
|------------|-----------|------------|-------------|
| id | Integer | Primary Key, Auto Increment | Unique identifier for each user |
| username | String(50) | Not Null, Unique | User's chosen username |
| email | String(100) | Not Null, Unique | User's email address for login |
| password | String(255) | Not Null | Hashed password (never stored in plain text) |
| created_at | DateTime | Not Null, Default=Current Timestamp | Account creation timestamp |
| last_login | DateTime | Nullable | Timestamp of last successful login |

### Tasks Table

| Field Name | Data Type | Constraints | Description |
|------------|-----------|------------|-------------|
| id | Integer | Primary Key, Auto Increment | Unique identifier for each task |
| user_id | Integer | Foreign Key (users.id), Not Null | Reference to the task owner |
| title | String(100) | Not Null | Task title/name |
| description | Text | Nullable | Detailed description of the task |
| priority | Enum('high', 'medium', 'low') | Not Null, Default='medium' | Task priority level |
| due_date | DateTime | Nullable | Task deadline date and time |
| is_completed | Boolean | Not Null, Default=False | Task completion status |
| category | String(50) | Not Null, Default='personal' | Task category (e.g., personal, work, study) |
| created_at | DateTime | Not Null, Default=Current Timestamp | Task creation timestamp |
| updated_at | DateTime | Not Null, Default=Current Timestamp, On Update=Current Timestamp | Last modification timestamp |

## Relationships

- One-to-Many relationship between Users and Tasks:
  - A user can have multiple tasks
  - Each task belongs to exactly one user

## Indexes

For optimal query performance, the following indexes will be created:

1. Users Table:
   - Primary Index: `id`
   - Unique Index: `email`
   - Unique Index: `username`

2. Tasks Table:
   - Primary Index: `id`
   - Index: `user_id` (for faster joins and lookups)
   - Index: `due_date` (for date-based queries and sorting)
   - Index: `category` (for category-based filtering)
   - Index: `is_completed` (for status-based filtering)

## SQLAlchemy Models Implementation

The database schema will be implemented using SQLAlchemy ORM models in the Flask application:

```python
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Enum

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    # Relationship with tasks
    tasks = db.relationship('Task', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.username}>'


class Task(db.Model):
    __tablename__ = 'tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    priority = db.Column(Enum('high', 'medium', 'low', name='priority_types'), 
                         nullable=False, default='medium')
    due_date = db.Column(db.DateTime, nullable=True)
    is_completed = db.Column(db.Boolean, nullable=False, default=False)
    category = db.Column(db.String(50), nullable=False, default='personal')
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, 
                          onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Task {self.title}>'
```

## Data Validation Rules

The following validation rules will be enforced at the application level:

1. User email must be in valid email format
2. Password must be at least 8 characters long with a mix of letters, numbers, and special characters
3. Task title must be between 3 and 100 characters
4. Due date, if provided, must be a future date
5. Priority must be one of the predefined values: high, medium, low
6. Category must be one of the predefined values or a custom category created by the user

## Migration Strategy

For database migrations and schema updates, we will use Flask-Migrate (Alembic) to handle version control of the database schema, allowing for smooth updates without data loss.
