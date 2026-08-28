
import os
import json

from dotenv import load_dotenv
from google import genai
from google.genai import types

from prompts import TESTMIND_PROMPT
from schema import TESTMIND_SCHEMA


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:

    raise ValueError(
        "GEMINI_API_KEY not found. "
        "Please add GEMINI_API_KEY to your .env file."
    )


# =========================================================
# GEMINI CLIENT
# =========================================================

client = genai.Client(
    api_key=api_key
)


# =========================================================
# GENERATE TEST CASES
# =========================================================

def generate_test_cases(
    feature_name,
    requirement
):

    prompt = f"""
You are an expert Software QA Engineer.

Analyze the following software requirement.

Feature Name:
{feature_name}

Software Requirement:
{requirement}

Generate a professional QA analysis.

Your response must include:

1. Requirement summary
2. Overall risk level
3. Functional test cases
4. Negative test cases
5. Edge cases
6. Potential risks
7. Clarification questions

Generate practical test cases that a real QA engineer
could execute.

Each test case must contain:

- Test Case ID
- Category
- Title
- Preconditions
- Step-by-step actions
- Expected result
- Priority
"""


    try:

        response = client.models.generate_content(

            model="gemini-3.6-flash",

            contents=prompt,

            config=types.GenerateContentConfig(

                system_instruction=TESTMIND_PROMPT,

                response_mime_type="application/json",

                response_schema=TESTMIND_SCHEMA,

                temperature=0.3,

                max_output_tokens=8000
            )
        )


        # -------------------------------------------------
        # GET RESPONSE TEXT
        # -------------------------------------------------

        response_text = response.text

        if not response_text:

            raise ValueError(
                "Gemini returned an empty response."
            )


        # -------------------------------------------------
        # CONVERT JSON
        # -------------------------------------------------

        try:

            result = json.loads(
                response_text
            )

        except json.JSONDecodeError as json_error:

            raise ValueError(
                f"Gemini returned invalid JSON: "
                f"{json_error}"
            )


        return result


    except Exception as e:

        print(
            "Gemini API Error:",
            str(e)
        )

        raise

