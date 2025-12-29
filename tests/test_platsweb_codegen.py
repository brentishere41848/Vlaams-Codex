from __future__ import annotations

from vlaamscodex.platsweb.compiler import build_platsweb


def test_codegen_contains_expected_outputs() -> None:
    src = """
pagina {
  blok id:"app" {
    kop tekst:"Hallo — {{ naam }}"
    invoer id:"naam" placeholder:"Uw naam"
    knop id:"btn" tekst:"OK"
  }
}
script {
  staat naam = ""
  functie onInput() { staat naam = lees("#naam") }
  bij input "#naam" -> onInput()
}
stijl { body { margin: 0; } }
""".strip()

    out = build_platsweb(src, dev=False)
    assert "<div id=\"plats-root\">" in out.index_html
    assert "setState" in out.app_js
    assert "Hallo — {{ naam }}" in out.app_js
    assert "EventSource" not in out.index_html
    assert "body { margin: 0; }" in out.app_css
