# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.5] - 2025-12-28

### Added

- Website: `website/playground/` — browser playground (Pyodide) om Platskript te runnen.
- Website: `website/examples/code-blocks/` — “View Full Code” pagina’s per example.
- Website footer: Discord invite link toegevoegd.

### Changed

- Compiler: support voor `maak als ... doe` / `maak zolang ... doe` / `anders` (control flow).
- Compiler: `roep ...` kan nu ook in expressions (bv. `klap roep ...` en `zet x op roep ...`).
- Compiler: `maak funksie <naam> doe` (zonder `met`) werkt nu ook.
- Compiler: `plakt` stringify’t waarden (geen crash meer bij tekst + getal).
- Compiler: `waar`/`onwaar` literals + `en`/`of` als logische operators.
- Website: examples links & knoppen gefixt; “Run in Playground” opent nu het echte playground.
- Website: emoji icons verwijderd en vervangen door SVG icons.
- Website: footer links gefixt zodat alles naar bestaande pagina’s gaat.
- Website: Euraika logo linkt nu door naar `https://euraika.net`.
- Project links: repository URLs gestandaardiseerd naar `brentishere41848/Vlaams-Codex`.

## [0.2.4] - 2025-12-28

### Added

- `discord-bot/`: support tickets (dropdown panel + ticket-kanalen onder categorie) + `/stuurlinks` post naar vast kanaal.
- Bot mention replies: `@botnaam` geeft plat-Vlaamse reactie.

### Changed

- Project messaging: “parody/parodie” wording verwijderd (docs/website/metadata) — VlaamsCodex is serieus bedoeld.
- CI: fixed `publish.yml` conditional zodat de workflow weer geldig is.

## [0.2.3] - 2025-12-28

### Added

- `discord-bot/`: Discord bot (discord.js v14, ESM) die GitHub Releases monitort (polling) en automatisch announcements post.
- GitHub workflow: create GitHub Release bij tag push (`v*.*.*`).
- GitHub workflow: sync “latest release” body vanuit `CHANGELOG.md`.

### Changed

- README: “NEW in v0.2.3”.
- `.gitignore`: `.env` en bot state worden genegeerd.

## [0.2.2] - 2025-12-28

### Changed

- VS Code extension: added "Debug Plats File" via Python debugger and line-preserving compilation.

## [0.2.1] - 2025-12-28

### Added

- npm package wrapper for installing/running `plats` via Node.js.
- Chocolatey packaging skeleton (local pack/install workflow).
- VS Code extension improvements: run/build/check in the integrated terminal + optional auto-bootstrap Python venv.
## [0.2.0] - 2025-12-28

### Added - Multi-Vlaams Editie! 🇧🇪

This is a major release that adds full Multi-Vlaams dialect support across all commands!

#### New Commands

- **Interactive REPL** (`plats repl`)
  - Dialect aliases: `proboir` (West-Vlaams), `smos` (Antwerps), `efkes` (Limburgs), `praot` (Brussels)
  - Multiline input support for functions
  - History with readline
  - `.help` commands inside REPL

- **Examples Browser** (`plats examples`)
  - Dialect aliases: `tuuntnekeer` (West-Vlaams), `toondada` (Antwerps), `loatskiejn` (Limburgs)
  - 5 built-in example programs: hello, rekenen, funksies, begroeting, teller
  - `--show`, `--run`, `--save`, `--list` options

- **Syntax Checker** (`plats check`)
  - Dialect aliases: `zijdezekers` (West-Vlaams), `istdagoe` (Antwerps), `kloptda` (Limburgs)
  - Error messages in your chosen dialect!
  - Line numbers with Flemish explanations

- **Project Scaffolding** (`plats init`)
  - Dialect aliases: `allehop` (West-Vlaams), `awel` (Antwerps), `allei` (Limburgs)
  - Creates project structure with sample .plats file
  - Generates LEESMIJ.md quick start guide

- **Flemish Fortune** (`plats fortune`)
  - Dialect aliases: `zegt` (West-Vlaams), `watteda` (Antwerps), `wiste` (Limburgs)
  - 80+ Flemish proverbs and sayings
  - Easter egg feature for fun!

#### Dialect Support

Full command aliases for 7 Flemish regions:
- **West-Vlaams**: plansen, zacht (`voertuut`, `proboir`, `tuuntnekeer`, `zijdezekers`, `allehop`, `zegt`)
- **Oost-Vlaams**: rap, direct (`doeme`, `komaan`, `ziedievoorbeelden`)
- **Antwerps**: smos, ketjes (`doet`, `smos`, `toondada`, `istdagoe`, `awel`, `watteda`)
- **Vlaams-Brabants**: zenansen (`doeme`, `efkees`)
- **Limburgs**: zjweet, rustig (`gaon`, `efkes`, `loatskiejn`, `kloptda`, `allei`, `wiste`)
- **Brussels**: zwansen, stoef (`doeda`, `praot`, `toontmansen`, `isdagoe`, `maakaan`, `spreuk`)
- **Genks**: cité-taal (`jaowdoen`, `babbel`, `jaowkiek`, `istokin`, `pakaan`, `jaowzegt`)

#### New Files

- `src/vlaamscodex/repl.py` - Interactive REPL implementation
- `src/vlaamscodex/examples.py` - Examples browser system
- `src/vlaamscodex/checker.py` - Syntax checker with dialect errors
- `src/vlaamscodex/init.py` - Project scaffolding
- `src/vlaamscodex/fortune.py` - Flemish proverbs (80+)
- `examples/rekenmachine.plats` - Calculator example
- `examples/funksies.plats` - Functions example
- `examples/begroeting.plats` - Greeting example
- `examples/teller.plats` - Counter example

### Changed

- Updated CLI with 80+ dialect command aliases
- Improved error messages with dialect-specific wording
- Enhanced help output showing all dialect options

### Stats

- 🎯 **80+** dialect aliases across all commands
- 📝 **5** built-in example programs
- 🔮 **80+** Flemish proverbs
- 🆕 **5** new modules

## [0.1.7] - 2025-12-27

### Added

- VS Code extension CI/CD improvements
- Build and attach VS Code extension on release

### Changed

- VS Code extension set to publisher PlatsVlaamseCodex
- Removed 'parody' wording from extension

## [0.1.6] - 2025-12-27

### Added

- Flemish command aliases for all CLI commands! 🇧🇪
  - `plats loop` (= run) - Voer een programma uut
  - `plats bouw` (= build) - Compileer na Python
  - `plats toon` (= show-python) - Toon de Python code
  - `plats versie` (= version) - Toon versie
  - `plats haalp` (= help) - Already added in v0.1.5
- Both English and Flemish commands documented in help output
- Command alias translation system in CLI

### Changed

- Updated help messages to prominently show both language options
- Flemish commands work exactly like their English counterparts

## [0.1.5] - 2025-12-27

### Added

- `plats haalp` command - Help in Flemish dialect! 🇧🇪
- Language reference included in Flemish help output
- Fun tagline: "'t Es simpel, 't es plansen, 't es Vlaams!"

## [0.1.4] - 2025-12-27

### Added

- `plats help` command with detailed usage information
- `plats version` command to display version
- `plats -v` and `plats --version` flags
- Version info displayed in help output

### Changed

- Improved CLI help messages and descriptions
- Better argument parser with epilog documentation link

## [0.1.3] - 2025-12-27

### Added

- Comprehensive PyPI metadata for better discoverability
- Project URLs (Homepage, Documentation, Repository, Changelog, Bug Tracker)
- Keywords for search optimization
- Full classifier taxonomy (Development Status, Audience, Topics, Languages)
- Maintainer information
- Python 3.13 support declared

### Changed

- Enhanced package description for clarity
- Improved project categorization on PyPI

### Fixed

- Removed deprecated License classifier (now using PEP 639 license expression)

## [0.1.1] - 2025-12-27

### Added

- GitHub Packages support with release assets
- Improved CI/CD workflow with parallel jobs
- Build artifacts attached to GitHub releases

### Changed

- Publish workflow now uploads wheel and sdist to releases

## [0.1.0] - 2024-12-27

### Added

- Initial release of VlaamsCodex toolchain
- Platskript-to-Python transpiler (`compiler.py`)
- Custom source encoding codec `vlaamsplats` (`codec.py`)
- CLI with `run`, `build`, and `show-python` commands (`cli.py`)
- Magic mode: execute `.plats` files directly with `python script.plats`
- Automatic codec registration via `.pth` startup hook
- Custom PEP 517 build backend for wheel packaging
- Example program: `examples/hello.plats`
- Comprehensive documentation in `docs/`
- Test suite with compiler and magic mode tests

### Language Features (v0.1)

- Program blocks: `plan doe ... gedaan`
- Statement terminator: `amen`
- Variable assignment: `zet <var> op <expr> amen`
- Print statement: `klap <expr> amen`
- Function definition: `maak funksie <name> met <params> doe ... gedaan`
- Function call: `roep <name> met <args> amen`
- Return statement: `geeftterug <expr> amen`
- String literals: `tekst <words>`
- Numeric literals: `getal <n>`
- Variable reference: `da <name>`
- Space literal: `spatie`
- Operators: `plakt`, `derbij`, `deraf`, `keer`, `gedeeld`, `isgelijk`, `isniegelijk`, `isgroterdan`, `iskleinerdan`, `enook`, `ofwel`, `nie`
[Unreleased]: https://github.com/brentishere41848/Vlaams-Codex/compare/v0.2.5...HEAD
[0.2.5]: https://github.com/brentishere41848/Vlaams-Codex/compare/v0.2.4...v0.2.5
[0.2.4]: https://github.com/brentishere41848/Vlaams-Codex/compare/v0.2.3...v0.2.4
[0.2.3]: https://github.com/brentishere41848/Vlaams-Codex/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/brentishere41848/Vlaams-Codex/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/brentishere41848/Vlaams-Codex/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/brentishere41848/Vlaams-Codex/compare/v0.1.7...v0.2.0
[0.1.7]: https://github.com/brentishere41848/Vlaams-Codex/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/brentishere41848/Vlaams-Codex/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/brentishere41848/Vlaams-Codex/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/brentishere41848/Vlaams-Codex/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/brentishere41848/Vlaams-Codex/compare/v0.1.1...v0.1.3
[0.1.1]: https://github.com/brentishere41848/Vlaams-Codex/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/brentishere41848/Vlaams-Codex/releases/tag/v0.1.0
