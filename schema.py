
TESTMIND_SCHEMA = {

    "type": "object",

    "properties": {

        "requirement_summary": {
            "type": "string"
        },

        "risk_level": {
            "type": "string",
            "enum": [
                "Low",
                "Medium",
                "High",
                "Critical"
            ]
        },

        "test_cases": {

            "type": "array",

            "items": {

                "type": "object",

                "properties": {

                    "id": {
                        "type": "string"
                    },

                    "category": {

                        "type": "string",

                        "enum": [
                            "Functional",
                            "Negative",
                            "Edge Case"
                        ]
                    },

                    "title": {
                        "type": "string"
                    },

                    "preconditions": {
                        "type": "string"
                    },

                    "steps": {

                        "type": "array",

                        "items": {
                            "type": "string"
                        }
                    },

                    "expected_result": {
                        "type": "string"
                    },

                    "priority": {

                        "type": "string",

                        "enum": [
                            "Low",
                            "Medium",
                            "High",
                            "Critical"
                        ]
                    }
                },

                "required": [
                    "id",
                    "category",
                    "title",
                    "preconditions",
                    "steps",
                    "expected_result",
                    "priority"
                ]
            }
        },

        "edge_cases": {

            "type": "array",

            "items": {
                "type": "string"
            }
        },

        "potential_risks": {

            "type": "array",

            "items": {
                "type": "string"
            }
        },

        "clarification_questions": {

            "type": "array",

            "items": {
                "type": "string"
            }
        }
    },

    "required": [
        "requirement_summary",
        "risk_level",
        "test_cases",
        "edge_cases",
        "potential_risks",
        "clarification_questions"
    ]
}

