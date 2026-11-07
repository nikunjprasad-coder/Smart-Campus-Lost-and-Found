"""Item routes: list, search, report lost/found, update, delete, matches."""
from flask import Blueprint, request, jsonify, session
from models import (
    get_items, get_item_by_id, get_potential_matches, get_items_by_user,
    update_item_status, delete_item, get_all_categories, get_all_locations,
    get_claims_for_item,
)
from routes.auth import login_required
import models

items_bp = Blueprint('items', __name__)


@items_bp.route('/', methods=['GET'])
@items_bp.route('', methods=['GET'])
@login_required
def list_items():
    filters = {
        'type': request.args.get('type'),
        'status': request.args.get('status'),
        'category_id': request.args.get('category_id'),
        'location_id': request.args.get('location_id'),
        'search': request.args.get('search'),
    }
    filters = {k: v for k, v in filters.items() if v}
    items = get_items(filters)
    return jsonify({'items': items}), 200


@items_bp.route('/<int:item_id>', methods=['GET'])
@login_required
def get_item(item_id):
    item = get_item_by_id(item_id)
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    return jsonify({'item': item}), 200


@items_bp.route('/categories', methods=['GET'])
@login_required
def list_categories():
    categories = get_all_categories()
    return jsonify({'categories': categories}), 200


@items_bp.route('/locations', methods=['GET'])
@login_required
def list_locations():
    locations = get_all_locations()
    return jsonify({'locations': locations}), 200


@items_bp.route('/lost', methods=['POST'])
@login_required
def report_lost():
    data = request.get_json()
    user_id = session['user_id']

    required = ['title']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    conn = None
    try:
        from db import get_connection, release_connection
        conn = get_connection()
        cursor = conn.cursor()

        p_item_id = cursor.var(int)

        cursor.execute(
            """INSERT INTO ITEMS (type, title, description, category_id, location_id,
                                  reported_by, status, color, brand, image_url,
                                  contact_info, incident_date)
               VALUES ('lost', :title, :description, :category_id, :location_id,
                       :reported_by, 'active', :color, :brand, :image_url,
                       :contact_info, :incident_date)
               RETURNING item_id INTO :item_id_out""",
            {
                'title': data['title'],
                'description': data.get('description'),
                'category_id': data.get('category_id'),
                'location_id': data.get('location_id'),
                'reported_by': user_id,
                'color': data.get('color'),
                'brand': data.get('brand'),
                'image_url': data.get('image_url'),
                'contact_info': data.get('contact_info'),
                'incident_date': data.get('incident_date'),
                'item_id_out': p_item_id,
            }
        )

        item_id = p_item_id.getvalue()[0]

        # Insert into LOST_REPORTS
        p_report_id = cursor.var(int)
        cursor.execute(
            """INSERT INTO LOST_REPORTS (item_id, reporter_id, last_seen_date,
                                          last_seen_location, reward_amount, is_urgent, report_status)
               VALUES (:item_id, :reporter_id, :last_seen_date, :last_seen_location,
                       :reward_amount, :is_urgent, 'active')
               RETURNING report_id INTO :report_id_out""",
            {
                'item_id': item_id,
                'reporter_id': user_id,
                'last_seen_date': data.get('incident_date'),
                'last_seen_location': data.get('last_seen_location'),
                'reward_amount': data.get('reward_amount'),
                'is_urgent': data.get('is_urgent', 'N'),
                'report_id_out': p_report_id,
            }
        )

        conn.commit()
        return jsonify({'message': 'Lost item reported', 'item_id': item_id}), 201
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            from db import release_connection
            release_connection(conn)


@items_bp.route('/found', methods=['POST'])
@login_required
def report_found():
    data = request.get_json()
    user_id = session['user_id']

    required = ['title']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    conn = None
    try:
        from db import get_connection, release_connection
        conn = get_connection()
        cursor = conn.cursor()

        p_item_id = cursor.var(int)

        cursor.execute(
            """INSERT INTO ITEMS (type, title, description, category_id, location_id,
                                  reported_by, status, color, brand, image_url,
                                  contact_info, incident_date)
               VALUES ('found', :title, :description, :category_id, :location_id,
                       :reported_by, 'active', :color, :brand, :image_url,
                       :contact_info, :incident_date)
               RETURNING item_id INTO :item_id_out""",
            {
                'title': data['title'],
                'description': data.get('description'),
                'category_id': data.get('category_id'),
                'location_id': data.get('location_id'),
                'reported_by': user_id,
                'color': data.get('color'),
                'brand': data.get('brand'),
                'image_url': data.get('image_url'),
                'contact_info': data.get('contact_info'),
                'incident_date': data.get('incident_date'),
                'item_id_out': p_item_id,
            }
        )

        item_id = p_item_id.getvalue()[0]

        # Insert into FOUND_REPORTS
        p_report_id = cursor.var(int)
        cursor.execute(
            """INSERT INTO FOUND_REPORTS (item_id, finder_id, found_date, found_location,
                                           storage_location, is_handed_to_admin, report_status)
               VALUES (:item_id, :finder_id, :found_date, :found_location,
                       :storage_location, :is_handed_to_admin, 'active')
               RETURNING report_id INTO :report_id_out""",
            {
                'item_id': item_id,
                'finder_id': user_id,
                'found_date': data.get('incident_date'),
                'found_location': data.get('found_location'),
                'storage_location': data.get('storage_location'),
                'is_handed_to_admin': data.get('is_handed_to_admin', 'N'),
                'report_id_out': p_report_id,
            }
        )

        conn.commit()
        return jsonify({'message': 'Found item reported', 'item_id': item_id}), 201
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            from db import release_connection
            release_connection(conn)


@items_bp.route('/<int:item_id>/matches', methods=['GET'])
@login_required
def get_matches(item_id):
    item = get_item_by_id(item_id)
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    if item['type'] != 'lost':
        return jsonify({'error': 'Matches are only available for lost items'}), 400
    matches = get_potential_matches(item_id)
    return jsonify({'matches': matches}), 200


@items_bp.route('/<int:item_id>/claims', methods=['GET'])
@login_required
def get_item_claims(item_id):
    user_id = session['user_id']
    item = get_item_by_id(item_id)
    if not item:
        return jsonify({'error': 'Item not found'}), 404

    # Only the item owner or admin can see claims
    from models import get_user_by_id
    user = get_user_by_id(user_id)
    if item['reported_by'] != user_id and user['role'] != 'admin':
        return jsonify({'error': 'Not authorized'}), 403

    claims = get_claims_for_item(item_id)
    return jsonify({'claims': claims}), 200


@items_bp.route('/<int:item_id>', methods=['PUT'])
@login_required
def update_item(item_id):
    data = request.get_json()
    user_id = session['user_id']

    item = get_item_by_id(item_id)
    if not item:
        return jsonify({'error': 'Item not found'}), 404

    from models import get_user_by_id
    user = get_user_by_id(user_id)
    if item['reported_by'] != user_id and user['role'] != 'admin':
        return jsonify({'error': 'Not authorized'}), 403

    if data.get('status'):
        update_item_status(item_id, data['status'])
    return jsonify({'message': 'Item updated'}), 200


@items_bp.route('/<int:item_id>', methods=['DELETE'])
@login_required
def remove_item(item_id):
    user_id = session['user_id']

    item = get_item_by_id(item_id)
    if not item:
        return jsonify({'error': 'Item not found'}), 404

    from models import get_user_by_id
    user = get_user_by_id(user_id)
    if item['reported_by'] != user_id and user['role'] != 'admin':
        return jsonify({'error': 'Not authorized'}), 403

    delete_item(item_id)
    return jsonify({'message': 'Item deleted'}), 200


@items_bp.route('/my-items', methods=['GET'])
@login_required
def my_items():
    user_id = session['user_id']
    items = get_items_by_user(user_id)
    return jsonify({'items': items}), 200
