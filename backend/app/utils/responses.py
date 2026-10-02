from flask import jsonify


def success_response(data=None, message="OK", status=200):
    payload = {"success": True, "message": message}
    if data is not None:
        payload["data"] = data
    return jsonify(payload), status


def error_response(message="Something went wrong", status=400, data=None):
    payload = {"success": False, "message": message}
    if data is not None:
        payload["data"] = data
    return jsonify(payload), status
