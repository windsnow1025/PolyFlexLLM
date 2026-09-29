from enum import Enum


class EmailVerificationReqDtoPurpose(str, Enum):
    EMAIL_CHANGE = "email-change"
    SIGN_UP = "sign-up"

    def __str__(self) -> str:
        return str(self.value)
