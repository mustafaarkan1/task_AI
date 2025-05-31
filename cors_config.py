from flask import Flask
from flask_cors import CORS

def configure_cors(app):
    """Configure CORS for the Flask application to allow frontend requests"""
    CORS(app, resources={r"/api/*": {"origins": "*"}})
