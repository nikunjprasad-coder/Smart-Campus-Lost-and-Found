"""Authentication routes: register, login, current user."""
from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from models import get_user_by_email, get_user_by_id, create_user
import functools

auth_bp = Blueprint('auth', __name__)


def login_required(f):
    """Decorator: requires authenticated user."""
    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return wrapper


def admin_required(f):
    """Decorator: requires admin role."""
    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        user = get_user_by_id(session['user_id'])
        if not user or user['role'] != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return wrapper


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    full_name = data.get('full_name', '').strip()
    student_id = data.get('student_id', '').strip() or None
    phone = data.get('phone', '').strip() or None

    if not email or not password or not full_name:
        return jsonify({'error': 'Email, password, and full name are required'}), 400
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    existing = get_user_by_email(email)
    if existing:
        return jsonify({'error': 'Email already registered'}), 409

    password_hash = generate_password_hash(password)
    user_id = create_user(email, password_hash, full_name, student_id, phone)

    session['user_id'] = user_id
    user = get_user_by_id(user_id)
    return jsonify({
        'message': 'Account created successfully',
        'user': {
            'user_id': user['user_id'],
            'email': user['email'],
            'full_name': user['full_name'],
            'role': user['role'],
        }
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = get_user_by_email(email)
    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'Invalid email or password'}), 401

    session['user_id'] = user['user_id']
    return jsonify({
        'message': 'Login successful',
        'user': {
            'user_id': user['user_id'],
            'email': user['email'],
            'full_name': user['full_name'],
            'student_id': user.get('student_id'),
            'phone': user.get('phone'),
            'role': user['role'],
        }
    }), 200


@auth_bp.route('/me', methods=['GET'])
@login_required
def me():
    user = get_user_by_id(session['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user}), 200


@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully'}), 200
