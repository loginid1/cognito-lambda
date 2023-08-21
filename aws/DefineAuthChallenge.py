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
        client_metadata = request.get("clientMetadata", {})
        if not client_metadata:
            raise NotFound("Client metadata not found")

        authentication_type = client_metadata.get("authentication_type")
        session_obj = session[-1]
        challenge_metadata = session_obj.get("challengeMetadata")

        if challenge_metadata == "AUTH_PARAMS":
            # renew challenge
            response["issueTokens"] = False
            response["failAuthentication"] = False
            response["challengeName"] = "CUSTOM_CHALLENGE"
            return event

        if authentication_type == "FIDO2":
            challenge_name = session_obj["challengeName"]
            challenge_result = session_obj["challengeResult"]

            # check if FIDO2 challenge succeeded
            if challenge_name == "CUSTOM_CHALLENGE" and challenge_result:
                response["issueTokens"] = True
                response["failAuthentication"] = False

            return event

        elif authentication_type == "PHONE_OTP":
            print("length of session is: ", len(session))

            # else if session length is less than 3 contine
            # it is 4 because the first session starts CUSTOM_CHALLENGE selection
            if len(session) <= 4:
                challenge_name = session_obj["challengeName"]
                challenge_result = session_obj["challengeResult"]

                # check if PHONE_OTP challenge succeeded
                if challenge_name == "CUSTOM_CHALLENGE" and challenge_result:
                    response["issueTokens"] = True
                    response["failAuthentication"] = False
                else: 
                    response["issueTokens"] = False
                    response["failAuthentication"] = False
                    response["challengeName"] = "CUSTOM_CHALLENGE"

                return event

            # else if session length is greater than or equal to 4 fail auth
            elif len(session) > 4:
                response["issueTokens"] = False
                response["failAuthentication"] = True

                return event

        elif authentication_type == "MAGIC_LINK":
            challenge_name = session_obj["challengeName"]
            challenge_result = session_obj["challengeResult"]

            # check if MAGIC_LINK challenge succeeded
            if challenge_name == "CUSTOM_CHALLENGE" and challenge_result:
                response["issueTokens"] = True
                response["failAuthentication"] = False

            return event

        else:
            raise NotFound("Authentication type not found")

    print(event)
    return event
