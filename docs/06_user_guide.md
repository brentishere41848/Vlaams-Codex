# VlaamsCodex / Platskript — User Guide

VlaamsCodex is a parody "dialect language" toolchain for **Platskript** (`.plats`). It transpiles Platskript to Python and can run programs either explicitly via a CLI or implicitly via Python's source encoding mechanism ("magic mode").

**NEW in v0.2.0**: Full Multi-Vlaams dialect support with 80+ command aliases from all Flemish regions!

## Installation

### Recommended: pip

```bash
pip install vlaamscodex
```

### Alternative: pipx (isolated)

```bash
pipx install vlaamscodex
```

### From source (development)

```bash
git clone https://github.com/brentishere41848/Vlaams-Codex.git
cd Vlaams-Codex
pip install -e ".[dev]"
```

---

## Quick Start

```bash
# Run your first program
plats run examples/hello.plats

# Or use magic mode
python examples/hello.plats

# Start the interactive REPL
plats repl

# Browse examples
plats examples --run hello
```

---

## CLI Commands

### Running Programs

```bash
plats run script.plats      # Run a Platskript file
plats loop script.plats     # Flemish alias
```

**Multi-Vlaams aliases:**
| Dialect | Command |
|---------|---------|
| West-Vlaams | `voertuut` |
| Antwerps | `doet` |
| Limburgs | `gaon` |
| Brussels | `doeda` |

### Interactive REPL

```bash
plats repl                  # Start interactive session
```

**Multi-Vlaams aliases:**
| Dialect | Command | Meaning |
|---------|---------|---------|
| West-Vlaams | `proboir` | proberen |
| Antwerps | `smos` | praten/uitproberen |
| Limburgs | `efkes` | eventjes |
| Brussels | `praot` | praten |

### Browse Examples

```bash
plats examples              # List all examples
plats examples --show hello # View code
plats examples --run hello  # Run example
plats examples --save hello # Save to file
```

**Multi-Vlaams aliases:**
| Dialect | Command | Meaning |
|---------|---------|---------|
| West-Vlaams | `tuuntnekeer` | toon eens |
| Antwerps | `toondada` | toon da da |
| Limburgs | `loatskiejn` | laat 's kijken |
| Genks | `jaowkiek` | jaow, kijk |

### Syntax Checker

```bash
plats check script.plats    # Validate syntax
```

Error messages come in your dialect:
```
Manneke, gij zijt 'amen' vergeten op lijn 5!  (Antwerps)
Jansen, ge zijt 'amen' vergeten op lijn 5!    (West-Vlaams)
```

**Multi-Vlaams aliases:**
| Dialect | Command | Meaning |
|---------|---------|---------|
| West-Vlaams | `zijdezekers` | zijt ge zeker? |
| Antwerps | `istdagoe` | is da goe? |
| Limburgs | `kloptda` | klopt da? |

### Create a New Project

```bash
plats init myproject        # Create project structure
```

Creates:
```
myproject/
├── hallo.plats             # Sample program
└── LEESMIJ.md              # Quick start guide
```

**Multi-Vlaams aliases:**
| Dialect | Command | Meaning |
|---------|---------|---------|
| West-Vlaams | `allehop` | hier gaan we! |
| Antwerps | `awel` | kom, we beginnen |
| Limburgs | `allei` | vooruit dan |

### Flemish Fortune (Easter Egg!)

```bash
plats fortune               # Random Flemish proverb
```

**Multi-Vlaams aliases:**
| Dialect | Command | Meaning |
|---------|---------|---------|
| West-Vlaams | `zegt` | zen moeder zegt... |
| Antwerps | `watteda` | wat is da? |
| Limburgs | `wiste` | wist ge dat? |

### Build & Show Python

```bash
plats build script.plats --out output.py    # Compile to Python
plats show-python script.plats              # Display generated Python
```

### Help

```bash
plats help                  # English help
plats haalp                 # Flemish help
```

---

## Magic Mode

Platskript files with the encoding header can run directly with Python:

```text
# coding: vlaamsplats
plan doe
  klap tekst hallo amen
gedaan
```

```bash
python script.plats  # Works after installing VlaamsCodex!
```

### How it works

1. Python reads the first line and detects `# coding: vlaamsplats` (PEP 263).
2. At startup, Python's `site` module processes `.pth` files.
3. The installed `vlaamscodex_autoload.pth` registers the `vlaamsplats` codec.
4. The codec transpiles Platskript to Python, which Python then executes.

---

## Language (v0.1)

Programs are blocks: `plan doe ... gedaan`. Statements end with `amen`.

### Statements

| Syntax | Description |
|--------|-------------|
| `zet <var> op <expr> amen` | Variable assignment |
| `klap <expr> amen` | Print expression |
| `maak funksie <name> met <params...> doe ... gedaan` | Function definition |
| `roep <name> met <args...> amen` | Function call |
| `geeftterug <expr> amen` | Return statement |

### Expressions

| Syntax | Description |
|--------|-------------|
| `tekst <words...>` | String literal |
| `getal <digits>` | Numeric literal |
| `da <name>` | Variable reference |
| `spatie` | Space character `" "` |
| `plakt` | String concatenation |

### Operators

| Platskript | Python | Description |
|------------|--------|-------------|
| `derbij` | `+` | Addition |
| `deraf` | `-` | Subtraction |
| `keer` | `*` | Multiplication |
| `gedeeld` | `/` | Division |
| `isgelijk` | `==` | Equals |
| `isniegelijk` | `!=` | Not equals |
| `isgroterdan` | `>` | Greater than |
| `iskleinerdan` | `<` | Less than |

See `docs/04_language_spec.md` for the canonical spec.

---

## Troubleshooting

### Magic mode fails

- `python -S` disables `site`, so `.pth` hooks do not run.
- `python -I` (isolated mode) also restricts site/user-site.
- **Solution**: Use `plats run script.plats` instead.

### Common errors

| Error | Cause | Solution |
|-------|-------|----------|
| `SyntaxError: encoding problem: vlaamsplats` | Codec not registered | Install package; avoid `-S`/`-I` |
| `No such file or directory` | Wrong file path | Check the path |
| `'amen' vergeten` | Missing statement terminator | Add `amen` at end of statement |

---

## Security Note

Treat `.plats` as code. Do not execute untrusted `.plats` files automatically.

---

**'t Es simpel, 't es plansen!**
