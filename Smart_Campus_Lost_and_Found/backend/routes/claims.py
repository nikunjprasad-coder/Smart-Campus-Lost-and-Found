"""Claim routes: submit, list, withdraw."""
from flask import Blueprint, request, jsonify, session
from models import create_claim, get_claims_by_user, withdraw_claim
from routes.auth import login_required

claims_bp = Blueprint('claims', __name__)


@claims_bp.route('/', methods=['GET'])
@claims_bp.route('', methods=['GET'])
@login_required
def list_claims():
    user_id = session['user_id']
    claims = get_claims_by_user(user_id)
    return jsonify({'claims': claims}), 200


@claims_bp.route('/', methods=['POST'])
@claims_bp.route('', methods=['POST'])
@login_required
def submit_claim():
    data = request.get_json()
    user_id = session['user_id']

    item_id = data.get('item_id')
    message = data.get('message')
    verification = data.get('verification_answer')

    if not item_id or not message:
        return jsonify({'error': 'item_id and message are required'}), 400

    try:
        claim_id = create_claim(item_id, user_id, message, verification)
        return jsonify({'message': 'Claim submitted', 'claim_id': claim_id}), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@claims_bp.route('/<int:claim_id>/withdraw', methods=['PUT'])
@login_required
def withdraw(claim_id):
    user_id = session['user_id']
    rows = withdraw_claim(claim_id, user_id)
    if rows == 0:
        return jsonify({'error': 'Claim not found or not authorized'}), 404
    return jsonify({'message': 'Claim withdrawn'}), 200
