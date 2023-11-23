def lambda_handler(event: dict, _: dict) -> dict:
    print(event)

    request, response = event["request"], event["response"]

    # check if user is not found
    if request.get("userNotFound"):
        response["issueToken"] = False
        response["failAuthentication"] = True
        raise Exception("User not found")

    session = request.get("session", [])

    # custom challenge
    if not len(session):
        response["issueTokens"] = False
        response["failAuthentication"] = False
        response["challengeName"] = "CUSTOM_CHALLENGE"

    # if sessions exist
    if len(session):
        # metadata will be used to determine the type of authentication
        client_metadata = request.get("clientMetadata")
        if not client_metadata:
            raise Exception("Client metadata not found")

        authentication_type = client_metadata.get("authentication_type")
        session_obj = session[-1]
        challenge_metadata = session_obj.get("challengeMetadata")

        challenge_name = session_obj["challengeName"]
        challenge_result = session_obj["challengeResult"]

        # will be used as the first round of authentication to get provided authentication type
        if challenge_metadata == "AUTH_PARAMS":
            # renew challenge
            response["issueTokens"] = False
            response["failAuthentication"] = False
            response["challengeName"] = "CUSTOM_CHALLENGE"

        valid_types = ["FIDO2_CREATE", "FIDO2_GET", "FIDO2_ADD"]

        if valid_types.count(authentication_type):
            challenge_name = session_obj["challengeName"]
            challenge_result = session_obj["challengeResult"]

            # check if FIDO2 challenge succeeded
            if challenge_name == "CUSTOM_CHALLENGE" and challenge_result:
                response["issueTokens"] = True
                response["failAuthentication"] = False

        return event

    print(event)
    return event
