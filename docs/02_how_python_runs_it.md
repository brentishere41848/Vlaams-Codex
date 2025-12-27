# 02 — How `python myscript.plats` can work

This document explains the mechanism that lets Python execute a non-Python language file, as long as the file can be transformed into valid Python **before** parsing.

## Key fact: Python decodes source *before* it parses it

When you run:

```bash
python myscript.plats
```

Python will:

1. Read bytes from the file.
2. **Decode** those bytes into text using an encoding.
3. Parse the resulting text as Python syntax.
4. Execute the compiled code object.

If we can intercept step (2) and return *different text* (valid Python), then Python will happily parse and execute it.

## The “encoding cookie” (source encoding declaration)

Python supports declaring a source encoding in the first or second line of a file. The canonical form is:

```text
# coding: utf-8
```

But the encoding name can be any encoding that Python can resolve through its codec registry.

So if the first line is:

```text
# coding: vlaamsplats
```

Python will try to locate a codec named `vlaamsplats`. If it exists, Python will use it to decode the file.

## The codec registry trick

Python can be taught new encodings at runtime.

- You implement a codec (really: a `codecs.CodecInfo` with encode/decode functions).
- You register a search function via `codecs.register(search_function)`.
- When Python sees an encoding name, it calls the registered search functions to resolve it.

### What the decoder does

For the `vlaamsplats` codec, the *decoder* does:

1. Decode bytes as UTF-8 (so you get the original Plats text).
2. Remove or ignore the `# coding: vlaamsplats` line so it doesn't confuse your parser.
3. Compile/translate the Plats source into valid Python source (a string).
4. Return that Python string as the “decoded text”.

From Python’s perspective, it just decoded the file. It does not know (or care) that it was a transformation.

## The hard requirement: the codec must be registered *before* Python reads the file

Important:

- Python needs the codec while it is decoding the script file itself.
- Therefore, the registration must happen at interpreter startup, not later.

### How to ensure early registration

There are a few approaches:

#### Option A (recommended): install a `.pth` startup hook

Python’s `site` module processes `.pth` files in site-packages at startup. A `.pth` file may contain an `import ...` line which gets executed.

So you can ship a `.pth` file like:

```text
import vlaamscodex.codec as _vc; _vc.register()
```

If that `.pth` file lands in site-packages, then as soon as Python starts (normally), it imports your module and registers the codec — early enough for the main script decode step.

#### Option B: `sitecustomize.py`

Python imports `sitecustomize` (if present on sys.path) during `site` initialization. You can use this to register your codec.

Downside: it is more likely to conflict with other customizations and can be harder to reason about in larger environments.

#### Option C: require users to use an explicit runner

This avoids the whole “python myscript.plats” requirement:

```bash
plats run myscript.plats
```

It is simpler and more robust, but you said you specifically want the `python myscript.plats` behavior.

## Limitations and failure modes

Even with the `.pth` approach, there are cases where Python will not load `site`, and your codec registration will not happen:

- `python -S ...` disables the automatic import of `site`.
- `python -I ...` runs in isolated mode (site-packages and user site are restricted).
- Some embedded or constrained Python environments intentionally do not process `.pth` hooks.

In these environments, `python myscript.plats` will fail because Python can’t resolve the `vlaamsplats` encoding.

Mitigation:
- Provide `plats run` as the canonical way.
- Document that `python myscript.plats` requires a normal Python environment.

## Debuggability

If your codec compiles Plats to Python, runtime errors will show Python tracebacks referring to the compiled code.

For a better UX, you can implement one of:

- **Line number mapping**: generate Python in a way that preserves line numbers (or embeds `# line`-style hints).
- **Source maps**: keep a mapping from generated Python lines back to `.plats` lines and rewrite tracebacks.

The toy implementation in this ZIP does not do full source mapping, but the docs explain how you’d add it.

## Security note

Executing arbitrary `.plats` means executing generated Python. If `.plats` comes from untrusted users, treat it like untrusted code:

- run in a sandbox
- restrict filesystem/network
- or avoid executing it automatically.
