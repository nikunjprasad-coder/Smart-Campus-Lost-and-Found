"""Admin routes: dashboard stats, manage claims, manage items."""
from flask import Blueprint, request, jsonify, session
from models import get_dashboard_stats, get_all_claims, review_claim, update_item_status, delete_item
from routes.auth import admin_required

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/stats', methods=['GET'])
@admin_required
def stats():
    data = get_dashboard_stats()
    return jsonify({'stats': data}), 200


@admin_bp.route('/claims', methods=['GET'])
@admin_required
def list_all_claims():
    status_filter = request.args.get('status', 'all')
    claims = get_all_claims(status_filter)
    return jsonify({'claims': claims}), 200


@admin_bp.route('/claims/<int:claim_id>/review', methods=['PUT'])
@admin_required
def review_claim_route(claim_id):
    data = request.get_json()
    admin_id = session['user_id']
    new_status = data.get('status')
    handover_notes = data.get('handover_notes')

    if new_status not in ('approved', 'rejected'):
        return jsonify({'error': 'Status must be approved or rejected'}), 400

    try:
        review_claim(claim_id, admin_id, new_status, handover_notes)
        return jsonify({'message': f'Claim {new_status}'}), 200
    except PermissionError as e:
        return jsonify({'error': str(e)}), 403
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/items/<int:item_id>/status', methods=['PUT'])
@admin_required
def update_item_status_route(item_id):
    data = request.get_json()
    status = data.get('status')

    valid_statuses = ('active', 'matched', 'claimed', 'resolved', 'expired')
    if status not in valid_statuses:
        return jsonify({'error': f'Status must be one of: {", ".join(valid_statuses)}'}), 400

    rows = update_item_status(item_id, status)
    if rows == 0:
        return jsonify({'error': 'Item not found'}), 404
    return jsonify({'message': 'Item status updated'}), 200


@admin_bp.route('/items/<int:item_id>', methods=['DELETE'])
@admin_required
def delete_item_route(item_id):
    rows = delete_item(item_id)
    if rows == 0:
        return jsonify({'error': 'Item not found'}), 404
    return jsonify({'message': 'Item deleted'}), 200
