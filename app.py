
from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS

from ai_service import generate_test_cases

import io
import json
import csv
from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak
)
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.enums import TA_CENTER


app = Flask(__name__)
CORS(app)


# =========================================================
# STORE LAST GENERATED REPORT
# =========================================================

latest_report = None
latest_feature_name = ""


# =========================================================
# HOME PAGE
# =========================================================

@app.route("/")
def home():
    return render_template("index.html")


# =========================================================
# GENERATE TEST CASES
# =========================================================

@app.route("/generate", methods=["POST"])
def generate():

    global latest_report
    global latest_feature_name

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "error": "No data received."
            }), 400

        feature_name = data.get("feature_name", "").strip()
        requirement = data.get("requirement", "").strip()

        # Validation
        if not feature_name:
            return jsonify({
                "success": False,
                "error": "Feature name is required."
            }), 400

        if not requirement:
            return jsonify({
                "success": False,
                "error": "Software requirement is required."
            }), 400

        # Call Gemini AI
        result = generate_test_cases(
            feature_name,
            requirement
        )

        # Store report for downloads
        latest_report = result
        latest_feature_name = feature_name

        return jsonify({
            "success": True,
            "data": result
        })

    except Exception as e:

        print("ERROR:", str(e))

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# =========================================================
# DOWNLOAD JSON
# =========================================================

@app.route("/download/json")
def download_json():

    if latest_report is None:
        return jsonify({
            "success": False,
            "error": "Generate a report first."
        }), 400

    buffer = io.BytesIO()

    data = {
        "feature_name": latest_feature_name,
        "analysis": latest_report
    }

    buffer.write(
        json.dumps(
            data,
            indent=4
        ).encode("utf-8")
    )

    buffer.seek(0)

    return send_file(
        buffer,
        mimetype="application/json",
        as_attachment=True,
        download_name="testmind_report.json"
    )


# =========================================================
# DOWNLOAD CSV
# =========================================================

@app.route("/download/csv")
def download_csv():

    if latest_report is None:
        return jsonify({
            "success": False,
            "error": "Generate a report first."
        }), 400

    buffer = io.StringIO()

    writer = csv.writer(buffer)

    # Header
    writer.writerow([
        "Test Case ID",
        "Category",
        "Title",
        "Preconditions",
        "Steps",
        "Expected Result",
        "Priority"
    ])

    # Test cases
    for test_case in latest_report.get("test_cases", []):

        steps = " | ".join(
            test_case.get("steps", [])
        )

        writer.writerow([
            test_case.get("id", ""),
            test_case.get("category", ""),
            test_case.get("title", ""),
            test_case.get("preconditions", ""),
            steps,
            test_case.get("expected_result", ""),
            test_case.get("priority", "")
        ])

    # Add summary section
    writer.writerow([])
    writer.writerow(["Requirement Summary"])
    writer.writerow([
        latest_report.get(
            "requirement_summary",
            ""
        )
    ])

    writer.writerow([])
    writer.writerow(["Risk Level"])
    writer.writerow([
        latest_report.get(
            "risk_level",
            ""
        )
    ])

    writer.writerow([])
    writer.writerow(["Edge Cases"])

    for item in latest_report.get("edge_cases", []):
        writer.writerow([item])

    writer.writerow([])
    writer.writerow(["Potential Risks"])

    for item in latest_report.get("potential_risks", []):
        writer.writerow([item])

    writer.writerow([])
    writer.writerow(["Clarification Questions"])

    for item in latest_report.get(
        "clarification_questions",
        []
    ):
        writer.writerow([item])

    csv_data = buffer.getvalue().encode("utf-8")

    return send_file(
        io.BytesIO(csv_data),
        mimetype="text/csv",
        as_attachment=True,
        download_name="testmind_test_cases.csv"
    )


# =========================================================
# DOWNLOAD PDF
# =========================================================

@app.route("/download/pdf")
def download_pdf():

    if latest_report is None:
        return jsonify({
            "success": False,
            "error": "Generate a report first."
        }), 400

    buffer = io.BytesIO()

    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    title_style = styles["Title"]
    title_style.alignment = TA_CENTER

    heading_style = styles["Heading2"]
    normal_style = styles["BodyText"]

    story = []

    # -----------------------------------------------------
    # TITLE
    # -----------------------------------------------------

    story.append(
        Paragraph(
            "TestMind AI - QA Analysis Report",
            title_style
        )
    )

    story.append(Spacer(1, 15))

    story.append(
        Paragraph(
            f"<b>Feature:</b> {latest_feature_name}",
            normal_style
        )
    )

    story.append(Spacer(1, 10))

    # -----------------------------------------------------
    # SUMMARY
    # -----------------------------------------------------

    story.append(
        Paragraph(
            "Requirement Summary",
            heading_style
        )
    )

    story.append(
        Paragraph(
            latest_report.get(
                "requirement_summary",
                "N/A"
            ),
            normal_style
        )
    )

    story.append(Spacer(1, 15))

    # -----------------------------------------------------
    # RISK
    # -----------------------------------------------------

    story.append(
        Paragraph(
            f"<b>Risk Level:</b> "
            f"{latest_report.get('risk_level', 'N/A')}",
            normal_style
        )
    )

    story.append(Spacer(1, 20))

    # -----------------------------------------------------
    # TEST CASES
    # -----------------------------------------------------

    story.append(
        Paragraph(
            "Generated Test Cases",
            heading_style
        )
    )

    story.append(Spacer(1, 10))

    for test_case in latest_report.get(
        "test_cases",
        []
    ):

        story.append(
            Paragraph(
                f"<b>{test_case.get('id', '')} - "
                f"{test_case.get('title', '')}</b>",
                normal_style
            )
        )

        story.append(
            Paragraph(
                f"<b>Category:</b> "
                f"{test_case.get('category', '')}",
                normal_style
            )
        )

        story.append(
            Paragraph(
                f"<b>Priority:</b> "
                f"{test_case.get('priority', '')}",
                normal_style
            )
        )

        story.append(
            Paragraph(
                f"<b>Preconditions:</b> "
                f"{test_case.get('preconditions', '')}",
                normal_style
            )
        )

        story.append(
            Paragraph(
                "<b>Steps:</b>",
                normal_style
            )
        )

        for index, step in enumerate(
            test_case.get("steps", []),
            start=1
        ):

            story.append(
                Paragraph(
                    f"{index}. {step}",
                    normal_style
                )
            )

        story.append(
            Paragraph(
                f"<b>Expected Result:</b> "
                f"{test_case.get('expected_result', '')}",
                normal_style
            )
        )

        story.append(Spacer(1, 15))

    # -----------------------------------------------------
    # EDGE CASES
    # -----------------------------------------------------

    story.append(
        Paragraph(
            "Edge Cases",
            heading_style
        )
    )

    for item in latest_report.get(
        "edge_cases",
        []
    ):

        story.append(
            Paragraph(
                f"• {item}",
                normal_style
            )
        )

    story.append(Spacer(1, 15))

    # -----------------------------------------------------
    # RISKS
    # -----------------------------------------------------

    story.append(
        Paragraph(
            "Potential Risks",
            heading_style
        )
    )

    for item in latest_report.get(
        "potential_risks",
        []
    ):

        story.append(
            Paragraph(
                f"• {item}",
                normal_style
            )
        )

    story.append(Spacer(1, 15))

    # -----------------------------------------------------
    # QUESTIONS
    # -----------------------------------------------------

    story.append(
        Paragraph(
            "Clarification Questions",
            heading_style
        )
    )

    for item in latest_report.get(
        "clarification_questions",
        []
    ):

        story.append(
            Paragraph(
                f"• {item}",
                normal_style
            )
        )

    # Build PDF
    document.build(story)

    buffer.seek(0)

    return send_file(
        buffer,
        mimetype="application/pdf",
        as_attachment=True,
        download_name="testmind_qa_report.pdf"
    )


# =========================================================
# RUN SERVER
# =========================================================

if __name__ == "__main__":

    app.run(
        debug=True,
        host="127.0.0.1",
        port=5000
    )

