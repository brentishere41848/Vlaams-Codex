# 04 — Platskript starter language spec (v0.1)

This spec is intentionally small. It is enough to build a reliable parser/transpiler and let an AI model generate deterministic output.

## File format

- UTF-8 text.
- Optional first line (recommended when using `python script.plats`):

```text
# coding: vlaamsplats
```

## Whitespace

- Lines may be indented for readability, but indentation is not semantic.
- Blocks are delimited by keywords (not indentation):
  - block start: `doe`
  - block end: `gedaan`

## Statement terminator

Every statement must end with the token:

- `amen`

This replaces the role of `;` in many languages and avoids ambiguity.

## Program

A program is:

```
plan doe
  <statements>
gedaan
```

## Core statements

### Print

```
klap <expr> amen
```

Semantics: print the expression.

### Assignment

```
zet <identifier> op <expr> amen
```

Example:

```
zet naam op tekst weeireld amen
```

### Function definition

```
maak funksie <name> met <param1> en <param2> ... doe
  <statements>
gedaan
```

### Function call

```
roep <name> met <expr1> en <expr2> ... amen
```

### Return

```
geeftterug <expr> amen
```

## Expressions (minimal)

This v0.1 spec supports a simple expression language:

### Literals

- String literal:
  - `tekst <words...>`
  - The literal ends at the next operator or statement boundary (toy implementations often treat it as “to end of line”).
- Number literal:
  - `getal <digits>`

### Variables

- `da <identifier>` resolves a variable.

### Operators

- `plakt` — string concatenation
- Future operators (optional): `derbij`, `deraf`, `keer`, `gedeeld`, comparisons, boolean ops

### Special token

- `spatie` — expands to a literal space `" "` (useful to avoid quoting rules)

## Example

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

## Notes for a production version

If you want this to scale beyond a parody demo, define:

- Proper quoting/escaping for strings (e.g., `tekst begin ... tekst einde` or triple-token quoting)
- Lists and maps with explicit delimiters (still in words)
- If/else and loops as structured statements
- Modules/imports
- A standard library (basic IO, file ops, time, etc.)
