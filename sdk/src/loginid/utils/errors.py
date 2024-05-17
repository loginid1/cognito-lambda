class LoginIDError(Exception):
    def __init__(self, status, code, message):
        self.status = status
        self.code = code
        self.message = message

    def __str__(self):
        return f'''status: {self.status}
        code: {self.code}
        message: {self.message}
        '''

    def __eq__(self, other):
        return self.status == other.status and \
               self.code == other.code and \
               self.message == other.message

    @staticmethod
    def from_dict(status: int, error_dict: dict):
        # check to see if msg exists if not check if message exists if not default to unknown_error
        message = error_dict.get('msg', error_dict.get('message', 'unknown error'))
        return LoginIDError(status,
                            error_dict.get('error_code', 'unknown_error'),
                            message,
        )
