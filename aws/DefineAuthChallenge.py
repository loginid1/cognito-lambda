class NotFound(Exception):
    """
    Raises not found error
    """
    def __init__(self, message: str) -> None:
        self.message = message

    def __str__(self) -> str:
        if not self.message:
            return "Not found"
        return self.message

def lambda_handler(event: dict, _: dict) -> dict:
    print(event)

    request, response = event["request"], event["response"]

    # start FIDO2 challenge
    if request.get("userNotFound"):
        response["issueToken"] = False
        response["failAuthentication"] = True
        raise NotFound("User not found")

    session = request.get("session", [])

    if not len(session):
        response["issueTokens"] = False
        response["failAuthentication"] = False
        response["challengeName"] = "CUSTOM_CHALLENGE"

    if len(session):
        session_obj = session[-1]
        challenge_name = session_obj["challengeName"]
        challenge_result = session_obj["challengeResult"]

        # check if FIDO2 challenge succeeded
        if challenge_name == "CUSTOM_CHALLENGE" and challenge_result:
            response["issueTokens"] = True
            response["failAuthentication"] = False

    print(event)
    return event
