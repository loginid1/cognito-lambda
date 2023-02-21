from flask import Response, json, request


def json_response(payload, status_code: int) -> Response:
    return Response(
        mimetype="application/json",
        response=json.dumps(payload),
        status=status_code
)


def default_json(*args):
    json = request.get_json()
    return (json.get(claim, "") for claim in args)
