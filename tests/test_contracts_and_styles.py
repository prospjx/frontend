import re


def test_config_js_exports_all_backend_service_urls(frontend_dir):
    """
    Verify config.js properly specifies endpoints for all four backend microservices:
    Course API, Student API, Scheduler API, and AI Assistant API.
    """
    content = (frontend_dir / "config.js").read_text(encoding="utf-8")

    expected_keys = [
        "COURSE_API_URL",
        "STUDENT_API_URL",
        "SCHEDULER_API_URL",
        "AI_ASSISTANT_API_URL",
        "DEFAULT_STUDENT_ID",
    ]
    for key in expected_keys:
        assert f"{key}:" in content, f"config.js is missing configuration key: {key}"


def test_api_js_contract_endpoints(frontend_dir):
    """
    Verify api.js calls the expected endpoint paths corresponding to the backend microservice contracts:
    - /courses
    - /students/${studentId}
    - /scheduler/generate
    - /analyze/extract-schedule
    - /analyze/full-schedule
    """
    content = (frontend_dir / "api.js").read_text(encoding="utf-8")

    expected_routes = [
        "/courses",
        "/students/",
        "/scheduler/generate",
        "/analyze/extract-schedule",
        "/analyze/full-schedule",
    ]
    for route in expected_routes:
        assert route in content, f"Expected route {route} not found in api.js"


def test_styles_css_variables_and_classes(frontend_dir):
    """
    Verify styles.css defines standard theme tokens and critical UI classes.
    """
    content = (frontend_dir / "styles.css").read_text(encoding="utf-8")

    expected_tokens = [
        "--bg-color",
        "--panel-bg",
        "--panel-border",
        "--text-primary",
        "--accent-color",
    ]
    for token in expected_tokens:
        assert token in content, f"Missing CSS custom property {token}"

    expected_classes = [
        ".glass-panel",
        ".app-container",
        ".sidebar",
        ".main-content",
        ".calendar-grid",
        ".course-card",
        ".activity-legend",
    ]
    for cls in expected_classes:
        assert cls in content, f"Missing CSS class definition {cls}"
