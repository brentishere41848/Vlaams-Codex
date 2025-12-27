# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/anubissbe/Vlaamse-Codex/compare/v0.1.6...HEAD
[0.1.6]: https://github.com/anubissbe/Vlaamse-Codex/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/anubissbe/Vlaamse-Codex/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/anubissbe/Vlaamse-Codex/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/anubissbe/Vlaamse-Codex/compare/v0.1.1...v0.1.3
[0.1.1]: https://github.com/anubissbe/Vlaamse-Codex/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/anubissbe/Vlaamse-Codex/releases/tag/v0.1.0
