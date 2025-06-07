from flask import Blueprint, request, jsonify
from sqlalchemy import text
from datetime import date
from db import engine

driver_bp = Blueprint('driver_api', __name__)

@driver_bp.route("/api/driver_login", methods=["POST"])
def driver_login():
    try:
        data = request.get_json()
        cccd = data.get("cccd")
        license_plate = data.get("license_plate")
        today = date.today()

        if not cccd or not license_plate:
            return jsonify({ "success": False, "message": "Thiếu CCCD hoặc biển số xe." }), 400

        with engine.connect() as conn:
            # JOIN các bảng để lấy đủ tên tài xế, tên tuyến
            query = text("""
                SELECT d.full_name, da.license_plate, b.route_id, br.route_name
                FROM drivers d
                JOIN driver_assignments da ON da.driver_cccd = d.driver_cccd
                    AND da.assigned_date = :today
                    AND da.license_plate = :license_plate
                JOIN buses b ON b.license_plate = da.license_plate
                JOIN bus_routes br ON br.id = b.route_id
                WHERE d.driver_cccd = :cccd
            """)
            result = conn.execute(query, {"cccd": cccd, "license_plate": license_plate, "today": today}).fetchone()

        if result:
            return jsonify({
                "success": True,
                "driver_name": result.full_name,
                "license_plate": result.license_plate,
                "route_id": result.route_id,
                "route_name": result.route_name
            }), 200
        else:
            return jsonify({ "success": False, "message": "❌ Sai biển hoặc CCCD hoặc chưa được phân công." }), 401

    except Exception as e:
        return jsonify({ "success": False, "message": str(e) }), 500


@driver_bp.route("/api/driver_info/<cccd>")
def driver_info(cccd):
    today = date.today()
    query = text("""
        SELECT d.full_name, da.license_plate, br.route_name
        FROM drivers d
        JOIN driver_assignments da ON da.driver_cccd = d.driver_cccd AND da.assigned_date = :today
        JOIN buses b ON b.license_plate = da.license_plate
        JOIN bus_routes br ON br.id = b.route_id
        WHERE d.driver_cccd = :cccd
    """)
    with engine.connect() as conn:
        result = conn.execute(query, {"cccd": cccd, "today": today}).fetchone()
        if result:
            return jsonify({
                "full_name": result.full_name,
                "license_plate": result.license_plate,
                "route_name": result.route_name
            })
        else:
            return jsonify({ "error": "Không tìm thấy tài xế hôm nay." }), 404
