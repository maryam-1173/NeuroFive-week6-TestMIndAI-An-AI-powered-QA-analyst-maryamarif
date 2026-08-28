from ai_service import generate_test_cases
import json


feature_name = "User Login"

requirement = """
Users should be able to log into the system using their registered
email and password.

The system should reject invalid credentials.

After five consecutive failed login attempts, the account should be
temporarily locked.

Users should be able to reset their password using their registered email.
"""


try:
    result = generate_test_cases(feature_name, requirement)

    print("SUCCESS!")
    print(json.dumps(result, indent=4))

except Exception as e:
    print("ERROR:")
    print(e)