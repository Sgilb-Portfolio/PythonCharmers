import boto3
import jwt
import requests
from django.conf import settings
from botocore.exceptions import BotoCoreError, ClientError

# Initialize Cognito Client
client = boto3.client("cognito-idp", region_name=settings.AWS_COGNITO_REGION)


def sign_up(username, password, email):
    """Registers a new user in AWS Cognito"""
    try:
        response = client.sign_up(
            ClientId=settings.AWS_COGNITO_CLIENT_ID,
            Username=username,
            Password=password,
            UserAttributes=[{"Name": "email", "Value": email}],
        )
        return response
    except ClientError as e:
        return {"error": str(e)}


def confirm_sign_up(username, confirmation_code):
    """Confirms a user's sign-up with the confirmation code"""
    try:
        response = client.confirm_sign_up(
            ClientId=settings.AWS_COGNITO_CLIENT_ID,
            Username=username,
            ConfirmationCode=confirmation_code,
        )
        return response
    except ClientError as e:
        return {"error": str(e)}


def sign_in(username, password, otp=None):
    """Authenticates a user with Cognito and returns tokens"""
    try:
        response = client.initiate_auth(
            ClientId=settings.AWS_COGNITO_CLIENT_ID,
            AuthFlow="USER_PASSWORD_AUTH",
            AuthParameters={"USERNAME": username, "PASSWORD": password},
        )
        if "ChallengeName" in response:
            if response["ChallengeName"] == "EMAIL_OTP":
                if otp:
                    return client.respond_to_auth_challenge(
                        ClientId=settings.AWS_COGNITO_CLIENT_ID,
                        ChallengeName="EMAIL_OTP",
                        Session=response["Session"],
                        ChallengeResponses={
                            "USERNAME": username,
                            "ANSWER": otp,
                        },
                    )
                else:
                    return {
                        "challenge": "EMAIL_OTP",
                        "session": response["Session"],
                        "message": "Please enter the OTP sent to your email."
                    }
        if "AuthenticationResult" in response:
            return response["AuthenticationResult"]
        else:
            return {"error": "Unexpected response from Cognito"}
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == "NotAuthorizedException":
            return {"error": "Invalid username or password"}
        elif error_code == "UserNotFoundException":
            return {"error": "User not found"}
        else:
            return {"error": f"An error occurred: {e}"}


def verify_token(id_token):
    """Validates the JWT token from Cognito"""
    try:
        # Fetch Cognito public keys
        jwks_url = f"{settings.AWS_COGNITO_ISSUER}/.well-known/jwks.json"
        jwks = requests.get(jwks_url).json()

        # Decode JWT without verification to get header
        header = jwt.get_unverified_header(id_token)
        key = next(k for k in jwks["keys"] if k["kid"] == header["kid"])

        # Verify JWT
        decoded_token = jwt.decode(
            id_token,
            key=jwt.algorithms.RSAAlgorithm.from_jwk(key),
            algorithms=["RS256"],
            audience=settings.AWS_COGNITO_CLIENT_ID,
            issuer=settings.AWS_COGNITO_ISSUER,
        )
        return decoded_token  # If decoding is successful, return user info
    except (jwt.ExpiredSignatureError, jwt.DecodeError, StopIteration) as e:
        return {"error": str(e)}
    

def reset_password(username, new_password, verification_code):
    """Resets password on Cognito"""
    try:
        response = client.confirm_forgot_password(
            ClientId=settings.AWS_COGNITO_CLIENT_ID,
            Username=username,
            ConfirmationCode=verification_code,
            Password=new_password
        )
        return {"success": "Password reset successfully"}
    except ClientError as e:
        return {"error": str(e)}
    

def forgot_password(username):
    """Initiates a password reset for a user in AWS Cognito"""
    try:
        response = client.forgot_password(
            ClientId=settings.AWS_COGNITO_CLIENT_ID,
            Username=username
        )
        return {"success": "Password reset code sent"}
    except ClientError as e:
        return {"error": str(e)}
    
def verify_mfa_code(username, mfa_code, session):
    """Verifies the MFA code with Cognito and returns authentication tokens"""
    try:
        response = client.respond_to_auth_challenge(
            ClientId=settings.AWS_COGNITO_CLIENT_ID,
            ChallengeName="EMAIL_OTP",
            ChallengeResponses={
                "USERNAME": username,
                "EMAIL_OTP_CODE": mfa_code,
            },
            Session=session,
        )
        if "AuthenticationResult" in response:
            return response["AuthenticationResult"]
        return {"error": "Unexpected response from Cognito"}
    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        if error_code == "NotAuthorizedException":
            return {"error": "Invalid OTP"}
        elif error_code == "ExpiredCodeException":
            return {"error": "OTP expired. Request a new one."}
        elif error_code == "CodeMismatchException":
            return {"error": "Incorrect OTP. Try again."}
        else:
            return {"error": f"An error occurred: {e}"}