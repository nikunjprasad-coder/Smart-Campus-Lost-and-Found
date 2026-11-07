"""Configuration for the Flask application."""
import os


class Config:
    # Oracle Database connection
    ORACLE_USER = os.environ.get('ORACLE_USER', 'campus_user')
    ORACLE_PASSWORD = os.environ.get('ORACLE_PASSWORD', 'your_password')
    ORACLE_DSN = os.environ.get('ORACLE_DSN', 'localhost:1521/XEPDB1')

    # Flask
    SECRET_KEY = os.environ.get('SECRET_KEY', 'change-this-in-production')

    # Session
    SESSION_TYPE = 'filesystem'
