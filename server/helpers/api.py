from flask import Response, json

def json_response(payload, status_code: int) -> Response:
    return Response(
        mimetype="application/json",
        response=json.dumps(payload),
        status=status_code
    )
