def test_health_endpoint(client):
    """Test the /health endpoint returns 200 OK and service metadata."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "frontend"


def test_root_serves_index_html(client):
    """Test the root URL / returns 200 and serves HTML with the application title."""
    response = client.get("/")
    assert response.status_code == 200
    assert "text/html" in response.headers.get("content-type", "")
    assert "<title>Smart Course & Life Scheduler</title>" in response.text


def test_static_asset_styles_css(client):
    """Test that styles.css is served with 200 and contains root theme variables."""
    response = client.get("/styles.css")
    assert response.status_code == 200
    assert ":root" in response.text
    assert "--bg-color" in response.text


def test_static_asset_config_js(client):
    """Test that config.js is served with 200 and defines microservice endpoints."""
    response = client.get("/config.js")
    assert response.status_code == 200
    assert "CONFIG" in response.text
    assert "DEFAULT_STUDENT_ID" in response.text


def test_static_asset_app_js(client):
    """Test that app.js is served with 200."""
    response = client.get("/app.js")
    assert response.status_code == 200
    assert "DOMContentLoaded" in response.text


def test_static_asset_api_js(client):
    """Test that api.js is served with 200 and contains API call functions."""
    response = client.get("/api.js")
    assert response.status_code == 200
    assert "fetchCourses" in response.text
    assert "generateSchedule" in response.text


def test_static_asset_ui_js(client):
    """Test that ui.js is served with 200 and contains calendar rendering logic."""
    response = client.get("/ui.js")
    assert response.status_code == 200
    assert "renderCalendar" in response.text
