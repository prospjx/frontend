import re
from html.parser import HTMLParser


class SimpleDOMParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.element_ids = set()
        self.classes = set()
        self.scripts = []
        self.stylesheets = []
        self.inputs = []

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        if "id" in attr_dict:
            self.element_ids.add(attr_dict["id"])
        if "class" in attr_dict:
            for cls in attr_dict["class"].split():
                self.classes.add(cls)
        if tag == "script" and "src" in attr_dict:
            self.scripts.append(attr_dict["src"].split("?")[0])
        if (
            tag == "link"
            and attr_dict.get("rel") == "stylesheet"
            and "href" in attr_dict
        ):
            self.stylesheets.append(attr_dict["href"].split("?")[0])
        if tag == "input":
            self.inputs.append(attr_dict)


def test_index_html_exists(frontend_dir):
    """Verify that index.html exists and is not empty."""
    index_file = frontend_dir / "index.html"
    assert index_file.is_file()
    assert index_file.stat().st_size > 0


def test_index_html_includes_required_scripts(frontend_dir):
    """Verify that index.html includes all required JS modules in proper order."""
    content = (frontend_dir / "index.html").read_text(encoding="utf-8")
    parser = SimpleDOMParser()
    parser.feed(content)

    assert "config.js" in parser.scripts
    assert "api.js" in parser.scripts
    assert "ui.js" in parser.scripts
    assert "app.js" in parser.scripts

    # Ensure config.js is loaded before api.js and app.js
    assert parser.scripts.index("config.js") < parser.scripts.index("api.js")
    assert parser.scripts.index("api.js") < parser.scripts.index("app.js")


def test_index_html_includes_stylesheet(frontend_dir):
    """Verify that index.html references styles.css."""
    content = (frontend_dir / "index.html").read_text(encoding="utf-8")
    parser = SimpleDOMParser()
    parser.feed(content)
    assert "styles.css" in parser.stylesheets


def test_index_html_contains_all_app_js_dom_ids(frontend_dir):
    """
    Verify that every document.getElementById('...') reference in app.js
    corresponds to an actual element ID defined in index.html.
    This prevents runtime null pointer crashes in the frontend.
    """
    html_content = (frontend_dir / "index.html").read_text(encoding="utf-8")
    app_content = (frontend_dir / "app.js").read_text(encoding="utf-8")

    parser = SimpleDOMParser()
    parser.feed(html_content)

    # Regex matches: document.getElementById('some-id') or document.getElementById("some-id")
    id_pattern = re.compile(r"document\.getElementById\(['\"]([a-zA-Z0-9\-_]+)['\"]\)")
    referenced_ids = set(id_pattern.findall(app_content))

    assert len(referenced_ids) > 0

    missing_ids = referenced_ids - parser.element_ids
    assert (
        not missing_ids
    ), f"Elements referenced in app.js missing from index.html: {missing_ids}"


def test_preference_form_inputs_present(frontend_dir):
    """Verify that student life preference form controls are properly present."""
    html_content = (frontend_dir / "index.html").read_text(encoding="utf-8")
    parser = SimpleDOMParser()
    parser.feed(html_content)

    expected_form_elements = {
        "pref-modal",
        "pref-form",
        "pref-name",
        "pref-wake-time",
        "pref-sleep-time",
        "pref-transit-mins",
        "pref-study-hours",
        "pref-gym-time",
        "pref-gym-duration",
        "pref-max-credits",
        "pref-difficulty",
    }
    for el_id in expected_form_elements:
        assert (
            el_id in parser.element_ids
        ), f"Expected form control #{el_id} in index.html"


def test_auth_form_inputs_present(frontend_dir):
    """Verify that login overlay and form elements exist."""
    html_content = (frontend_dir / "index.html").read_text(encoding="utf-8")
    parser = SimpleDOMParser()
    parser.feed(html_content)

    assert "login-overlay" in parser.element_ids
    assert "login-form" in parser.element_ids
    assert "username" in parser.element_ids
    assert "password" in parser.element_ids
    assert "login-error" in parser.element_ids
