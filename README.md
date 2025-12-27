# Repository: Vlaamse Codex / Platskript

VlaamsCodex is nen (parodie-)toolchain veur **Platskript** (`.plats`). Ge schryft in Plats, en VlaamsCodex zet dat om naar Python en voert het uit.

De grote truc (“magic mode”): na installatie werkt dit:

```bash
python examples/hello.plats
```

## Installatie

### Optie A: pipx (aanbevolen veur eindgebruikers)

```bash
python -m pip install --user pipx
python -m pipx ensurepath
pipx install vlaamscodex
```

### Optie B: virtualenv + pip

```bash
python -m venv .venv
. .venv/bin/activate
python -m pip install -U pip
python -m pip install vlaamscodex
```

### Optie C: van broncode (developer / editable)

```bash
python -m venv .venv
. .venv/bin/activate
python -m pip install -U pip
python -m pip install -e .
```

## Gebruik

### 1) CLI (altijd betrouwbaar)

Runnen:

```bash
plats run pad/naar/script.plats
```

Python tonen die gegenereerd wordt:

```bash
plats show-python pad/naar/script.plats
```

Naar een `.py` bestand compileren:

```bash
plats build pad/naar/script.plats --out script.py
```

### 2) “Magic mode”: `python script.plats`

Elk `.plats` bestand begint met een Python encoding regel:

```text
# coding: vlaamsplats
```

Daarna kunt ge gewoon doen:

```bash
python pad/naar/script.plats
```

Snel testen met de example:

```bash
plats run examples/hello.plats
python examples/hello.plats
```

Verwachte output:

```text
gdag aan weeireld
```

## Voorbeeld: `hello.plats`

```text
# coding: vlaamsplats
plan doe
  zet naam op tekst weeireld amen

  maak funksie groet met wie doe
    klap tekst gdag plakt spatie plakt tekst aan plakt spatie plakt da wie amen
  gedaan

  roep groet met da naam amen
gedaan
```

## Hoe werkt het (stap voor stap)

1. Python ziet `# coding: vlaamsplats` (PEP 263) en vraagt die codec op om de file te decoden.
2. Bij normale startup draait Python z’n `site` module en verwerkt alle `.pth` files in site-packages.
3. VlaamsCodex installeert `vlaamscodex_autoload.pth` in site-packages met exact dit:
   `import vlaamscodex.codec as _vc; _vc.register()`
4. Die `register()` registreert de codec `vlaamsplats`.
5. De codec decodeert de bytes (UTF-8), knipt de coding-regel weg, transpileert Plats → Python source, en geeft die Python source terug aan de interpreter.
6. Python voert de gegenereerde Python code uit alsof het altijd al Python was.

## Taal (v0.1) in ’t kort

Statements eindigen op `amen`. Programma’s zijn `plan doe ... gedaan`.

- `zet <var> op <expr> amen`
- `klap <expr> amen`
- `maak funksie <naam> met <params...> doe ... gedaan`
- `roep <naam> met <args...> amen`
- `geeftterug <expr> amen`

Expressions:
- `tekst <woorden...>` (words met spaties)
- `getal <digits>`
- `da <naam>`
- `spatie`
- `plakt` (string concat, Python `+`)

## Limitaties / troubleshooting

- `python -S` zet `site` uit → `.pth` hooks draaien niet → magic mode kan breken.
- `python -I` (isolated) kan ook site/user-site beperken → magic mode kan breken.
- Fallback: `plats run script.plats` werkt altijd.

Als ge krijgt: `SyntaxError: encoding problem: vlaamsplats`:
- check dat `vlaamscodex` echt geïnstalleerd is in dézelfde venv/omgeving,
- en dat ge niet met `-S` of `-I` runt.

## Repository structuur

- `src/vlaamscodex/` — compiler, codec, CLI
- `data/vlaamscodex_autoload.pth` — startup hook (registreert codec)
- `examples/` — voorbeeld `.plats` files
- `tests/` — pytest tests (incl. subprocess test voor magic mode)
- `docs/` — extra uitleg en specs

