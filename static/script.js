// =========================================================
// TESTMIND AI - FRONTEND SCRIPT
// =========================================================

const generateBtn = document.getElementById("generateBtn");
const featureNameInput = document.getElementById("featureName");
const requirementInput = document.getElementById("requirement");

const loading = document.getElementById("loading");
const resultsContainer = document.getElementById("resultsContainer");
const buttonText = document.getElementById("buttonText");


// =========================================================
// CHECK DOM
// =========================================================

console.log("✅ TestMind AI JavaScript loaded.");

if (!generateBtn) {
    console.error("❌ Generate button not found.");
}

if (!featureNameInput) {
    console.error("❌ Feature name input not found.");
}

if (!requirementInput) {
    console.error("❌ Requirement textarea not found.");
}


// =========================================================
// BUTTON EVENT
// =========================================================

if (generateBtn) {
    generateBtn.addEventListener("click", generateAnalysis);
}


// =========================================================
// GENERATE AI ANALYSIS
// =========================================================

async function generateAnalysis() {

    const featureName = featureNameInput.value.trim();
    const requirement = requirementInput.value.trim();


    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (!featureName) {

        alert("Please enter a Feature Name.");

        featureNameInput.focus();

        return;
    }


    if (!requirement) {

        alert("Please enter a Software Requirement.");

        requirementInput.focus();

        return;
    }


    // -----------------------------------------------------
    // SHOW LOADING
    // -----------------------------------------------------

    resultsContainer.innerHTML = "";

    resultsContainer.classList.add("hidden");

    loading.classList.remove("hidden");

    generateBtn.disabled = true;

    buttonText.textContent = "Analyzing with AI...";


    try {

        console.log("🚀 Sending request to Flask...");
        console.log("Feature:", featureName);
        console.log("Requirement:", requirement);


        // -------------------------------------------------
        // SEND REQUEST TO FLASK
        // -------------------------------------------------

        const response = await fetch("/generate", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                feature_name: featureName,

                requirement: requirement

            })

        });


        console.log("📡 Flask status:", response.status);


        // -------------------------------------------------
        // READ RESPONSE
        // -------------------------------------------------

        let result;

        try {

            result = await response.json();

        } catch (jsonError) {

            throw new Error(
                "Server returned an invalid response."
            );

        }


        console.log("🤖 Flask response:", result);


        // -------------------------------------------------
        // HANDLE SERVER ERROR
        // -------------------------------------------------

        if (!response.ok || !result.success) {

            throw new Error(
                result.error ||
                `Server error (${response.status})`
            );

        }


        // -------------------------------------------------
        // CHECK DATA
        // -------------------------------------------------

        if (!result.data) {

            throw new Error(
                "AI returned empty data."
            );

        }


        // -------------------------------------------------
        // HIDE LOADING
        // -----------------------------------------------------

        loading.classList.add("hidden");


        // -------------------------------------------------
        // DISPLAY RESULTS
        // -----------------------------------------------------

        displayResults(
            result.data,
            featureName
        );


    } catch (error) {

        console.error(
            "❌ TestMind AI Error:",
            error
        );


        loading.classList.add("hidden");

        resultsContainer.classList.remove("hidden");


        resultsContainer.innerHTML = `

            <div class="error-card">

                <h3>
                    ⚠️ Analysis Failed
                </h3>

                <p>
                    ${escapeHTML(error.message)}
                </p>

                <p class="error-help">

                    Please check your Gemini API key,
                    internet connection,
                    model name,
                    API quota,
                    or Flask server.

                </p>

            </div>

        `;

    } finally {

        generateBtn.disabled = false;

        buttonText.textContent =
            "✨ Analyze Requirement";

    }

}


// =========================================================
// DISPLAY AI RESULTS
// =========================================================

function displayResults(data, featureName) {

    resultsContainer.classList.remove("hidden");


    // -----------------------------------------------------
    // SAFE DATA
    // -----------------------------------------------------

    const risk =
        data.risk_level || "Medium";


    const riskClass =
        risk.toLowerCase();


    const testCases =
        Array.isArray(data.test_cases)
            ? data.test_cases
            : [];


    const edgeCases =
        Array.isArray(data.edge_cases)
            ? data.edge_cases
            : [];


    const risks =
        Array.isArray(data.potential_risks)
            ? data.potential_risks
            : [];


    const questions =
        Array.isArray(data.clarification_questions)
            ? data.clarification_questions
            : [];


    // -----------------------------------------------------
    // BUILD RESULTS
    // -----------------------------------------------------

    resultsContainer.innerHTML = `

        <!-- =================================================
             RESULTS HEADER
        ================================================== -->

        <div class="results-header">

            <div>

                <p class="small-label">
                    AI QA ANALYSIS
                </p>

                <h2>
                    ${escapeHTML(featureName)}
                </h2>

                <p>

                    ${escapeHTML(
                        data.requirement_summary ||
                        "No summary available."
                    )}

                </p>

            </div>

        </div>


        <!-- =================================================
             STATISTICS
        ================================================== -->

        <div class="stats-grid">


            <!-- RISK -->

            <div class="stat-card">

                <span>
                    Risk Level
                </span>

                <h3 class="risk-${escapeHTML(riskClass)}">

                    ${escapeHTML(risk)}

                </h3>

            </div>


            <!-- TEST CASES -->

            <div class="stat-card">

                <span>
                    Test Cases
                </span>

                <h3>
                    ${testCases.length}
                </h3>

            </div>


            <!-- EDGE CASES -->

            <div class="stat-card">

                <span>
                    Edge Cases
                </span>

                <h3>
                    ${edgeCases.length}
                </h3>

            </div>


            <!-- RISKS -->

            <div class="stat-card">

                <span>
                    Potential Risks
                </span>

                <h3>
                    ${risks.length}
                </h3>

            </div>


        </div>


        <!-- =================================================
             TEST CASES
        ================================================== -->

        <div class="result-block">


            <div class="section-title">

                <div>

                    <p class="small-label">
                        TEST DESIGN
                    </p>

                    <h2>
                        🧪 Generated Test Cases
                    </h2>

                </div>


                <span class="count-badge">

                    ${testCases.length} Cases

                </span>

            </div>


            <div class="test-cases-list">

                ${
                    testCases.length > 0

                    ?

                    testCases
                        .map(renderTestCase)
                        .join("")

                    :

                    `
                    <p class="empty-message">
                        No test cases were generated.
                    </p>
                    `
                }

            </div>


        </div>


        <!-- =================================================
             EDGE CASES + RISKS
        ================================================== -->

        <div class="two-column-grid">


            <!-- EDGE CASES -->

            <div class="result-block compact-block">

                <h2>
                    ⚠️ Edge Cases
                </h2>

                ${createList(
                    edgeCases,
                    "No edge cases identified."
                )}

            </div>


            <!-- RISKS -->

            <div class="result-block compact-block">

                <h2>
                    🚨 Potential Risks
                </h2>

                ${createList(
                    risks,
                    "No major risks identified."
                )}

            </div>


        </div>


        <!-- =================================================
             CLARIFICATION QUESTIONS
        ================================================== -->

        <div class="result-block">

            <h2>
                ❓ Clarification Questions
            </h2>

            ${createList(
                questions,
                "No clarification questions identified."
            )}

        </div>


        <!-- =================================================
             DOWNLOAD REPORT
        ================================================== -->

        <div class="result-block download-section">

            <p class="small-label">
                REPORT EXPORT
            </p>

            <h2>
                📥 Export QA Analysis
            </h2>

            <p class="description">

                Download your generated QA analysis
                in your preferred format.

            </p>


            <div class="download-buttons">


                <button
                    type="button"
                    class="download-btn json-btn"
                    onclick="downloadReport('json')"
                >

                    📄

                    Download JSON

                </button>


                <button
                    type="button"
                    class="download-btn csv-btn"
                    onclick="downloadReport('csv')"
                >

                    📊

                    Download CSV

                </button>


                <button
                    type="button"
                    class="download-btn pdf-btn"
                    onclick="downloadReport('pdf')"
                >

                    📑

                    Download PDF

                </button>


            </div>


        </div>

    `;


    // -----------------------------------------------------
    // SAVE RESULT FOR DOWNLOAD
    // -----------------------------------------------------

    window.currentTestMindResult = data;

    window.currentTestMindFeature =
        featureName;


    // -----------------------------------------------------
    // SCROLL TO RESULTS
    // -----------------------------------------------------

    resultsContainer.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

}


// =========================================================
// RENDER TEST CASE
// =========================================================

function renderTestCase(testCase, index) {


    const id =
        testCase.id ||
        `TC-${String(index + 1).padStart(3, "0")}`;


    const category =
        testCase.category ||
        "Functional";


    const priority =
        testCase.priority ||
        "Medium";


    const steps =
        Array.isArray(testCase.steps)
            ? testCase.steps
            : [];


    const priorityClass =
        priority
            .toLowerCase()
            .replace(/\s+/g, "-");


    return `

        <div class="test-case-card">


            <!-- TEST CASE HEADER -->

            <div class="test-case-top">


                <div>

                    <span class="case-id">

                        ${escapeHTML(id)}

                    </span>


                    <h3>

                        ${escapeHTML(
                            testCase.title ||
                            "Untitled Test Case"
                        )}

                    </h3>

                </div>


                <!-- BADGES -->

                <div class="badges">


                    <span class="badge category-badge">

                        ${escapeHTML(category)}

                    </span>


                    <span
                        class="badge priority-${escapeHTML(priorityClass)}"
                    >

                        ${escapeHTML(priority)}

                        Priority

                    </span>


                </div>


            </div>


            <!-- TEST CASE DETAILS -->

            <div class="test-case-details">


                <!-- PRECONDITIONS -->

                <div class="detail-section">

                    <h4>
                        Preconditions
                    </h4>

                    <p>

                        ${escapeHTML(
                            testCase.preconditions ||
                            "Not specified."
                        )}

                    </p>

                </div>


                <!-- STEPS -->

                <div class="detail-section">

                    <h4>
                        Steps
                    </h4>


                    ${
                        steps.length > 0

                        ?

                        `
                        <ol>

                            ${steps
                                .map(
                                    step => `

                                    <li>

                                        ${escapeHTML(step)}

                                    </li>

                                `
                                )
                                .join("")
                            }

                        </ol>
                        `

                        :

                        `
                        <p>
                            No steps specified.
                        </p>
                        `
                    }


                </div>


                <!-- EXPECTED RESULT -->

                <div class="detail-section expected-result">

                    <h4>
                        Expected Result
                    </h4>

                    <p>

                        ${escapeHTML(
                            testCase.expected_result ||
                            "Not specified."
                        )}

                    </p>

                </div>


            </div>


        </div>

    `;

}


// =========================================================
// CREATE AI LIST
// =========================================================

function createList(items, emptyMessage) {


    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {

        return `

            <p class="empty-message">

                ${escapeHTML(
                    emptyMessage
                )}

            </p>

        `;

    }


    return `

        <ul class="ai-list">

            ${items
                .map(
                    item => `

                    <li>

                        ${escapeHTML(item)}

                    </li>

                `
                )
                .join("")
            }

        </ul>

    `;

}


// =========================================================
// DOWNLOAD REPORT
// =========================================================

function downloadReport(format) {


    console.log(
        "📥 Download requested:",
        format
    );


    // Make sure AI result exists

    if (
        !window.currentTestMindResult
    ) {

        alert(
            "Please generate an AI analysis first."
        );

        return;

    }


    // -----------------------------------------------------
    // DOWNLOAD JSON
    // -----------------------------------------------------

    if (format === "json") {

        downloadJSON();

        return;

    }


    // -----------------------------------------------------
    // DOWNLOAD CSV
    // -----------------------------------------------------

    if (format === "csv") {

        downloadCSV();

        return;

    }


    // -----------------------------------------------------
    // DOWNLOAD PDF
    // -----------------------------------------------------

    if (format === "pdf") {

        downloadPDF();

        return;

    }


    alert(
        "Unsupported download format."
    );

}


// =========================================================
// DOWNLOAD JSON
// =========================================================

function downloadJSON() {


    const data =
        window.currentTestMindResult;


    const featureName =
        window.currentTestMindFeature ||
        "TestMind AI";


    const exportData = {

        feature_name:
            featureName,

        generated_at:
            new Date().toISOString(),

        analysis:
            data

    };


    const json =
        JSON.stringify(
            exportData,
            null,
            4
        );


    const blob =
        new Blob(
            [json],
            {
                type: "application/json"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;


    link.download =
        createFileName(featureName) +
        "_TestMind_Report.json";


    document.body.appendChild(link);


    link.click();


    document.body.removeChild(link);


    URL.revokeObjectURL(url);

}


// =========================================================
// DOWNLOAD CSV
// =========================================================

function downloadCSV() {


    const data =
        window.currentTestMindResult;


    const featureName =
        window.currentTestMindFeature ||
        "TestMind AI";


    const testCases =
        Array.isArray(data.test_cases)
            ? data.test_cases
            : [];


    if (testCases.length === 0) {

        alert(
            "No test cases available for CSV export."
        );

        return;

    }


    const rows = [];


    // CSV HEADER

    rows.push([

        "Test Case ID",

        "Category",

        "Title",

        "Priority",

        "Preconditions",

        "Steps",

        "Expected Result"

    ]);


    // CSV DATA

    testCases.forEach(testCase => {


        const steps =
            Array.isArray(testCase.steps)
                ? testCase.steps.join(" | ")
                : "";


        rows.push([

            testCase.id || "",

            testCase.category || "",

            testCase.title || "",

            testCase.priority || "",

            testCase.preconditions || "",

            steps,

            testCase.expected_result || ""

        ]);

    });


    const csv =
        rows
            .map(
                row =>
                    row
                        .map(csvEscape)
                        .join(",")
            )
            .join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type: "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;


    link.download =
        createFileName(featureName) +
        "_TestMind_Report.csv";


    document.body.appendChild(link);


    link.click();


    document.body.removeChild(link);


    URL.revokeObjectURL(url);

}


// =========================================================
// DOWNLOAD PDF
// =========================================================

function downloadPDF() {


    /*
        PDF is generated by Flask + ReportLab.

        The complete AI result is sent to the backend.
    */


    const data =
        window.currentTestMindResult;


    const featureName =
        window.currentTestMindFeature ||
        "TestMind AI";


    fetch("/download/pdf", {

        method: "POST",

        headers: {

            "Content-Type":
                "application/json"

        },

        body: JSON.stringify({

            feature_name:
                featureName,

            data:
                data

        })

    })

    .then(async response => {


        if (!response.ok) {

            let errorMessage =
                "PDF generation failed.";

            try {

                const error =
                    await response.json();

                errorMessage =
                    error.error ||
                    errorMessage;

            } catch (e) {
                // Ignore JSON parsing error
            }

            throw new Error(
                errorMessage
            );

        }


        return response.blob();

    })

    .then(blob => {


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href = url;


        link.download =
            createFileName(featureName) +
            "_TestMind_Report.pdf";


        document.body.appendChild(link);


        link.click();


        document.body.removeChild(link);


        URL.revokeObjectURL(url);


        console.log(
            "✅ PDF downloaded."
        );

    })

    .catch(error => {

        console.error(
            "❌ PDF Error:",
            error
        );


        alert(
            "PDF download failed: " +
            error.message
        );

    });

}


// =========================================================
// CSV ESCAPE
// =========================================================

function csvEscape(value) {


    if (
        value === null ||
        value === undefined
    ) {

        return '""';

    }


    return `"${String(value)
        .replace(/"/g, '""')}"`;

}


// =========================================================
// CREATE SAFE FILE NAME
// =========================================================

function createFileName(name) {


    return String(name)

        .trim()

        .replace(
            /[^a-zA-Z0-9-_]/g,
            "_"
        )

        .replace(
            /_+/g,
            "_"
        )

        .substring(
            0,
            80
        );

}


// =========================================================
// HTML ESCAPE
// =========================================================

function escapeHTML(value) {


    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =========================================================
// ENTER KEY SUPPORT
// =========================================================

featureNameInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            generateAnalysis();

        }

    }
);


// =========================================================
// CTRL + ENTER SUPPORT
// =========================================================

requirementInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.ctrlKey &&
            event.key === "Enter"
        ) {

            event.preventDefault();

            generateAnalysis();

        }

    }
);