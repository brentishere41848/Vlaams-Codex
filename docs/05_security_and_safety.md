# 05 — Security & Safety Notes

Even if this is a parody project, the moment you can execute `.plats` files you have a real code execution system.

## Treat `.plats` as code, not as data

A `.plats` program ultimately becomes real Python code and executes with the same permissions as the Python process.

If you accept `.plats` from other people (uploads, pull requests, chat inputs), do not run it automatically.

## Recommended precautions for untrusted code

- Run inside a container / sandbox:
  - restricted filesystem
  - restricted network
  - CPU/time limits
- Avoid `exec` in long-running privileged services.
- Consider a “safe subset” mode (no file IO, no imports, no network).

## Supply chain / packaging caution

A `.pth` startup hook executes code on interpreter startup.

- Keep it minimal: only register the codec.
- Avoid heavy imports and side effects in the `.pth` hook.
- Document the behavior clearly for users.

## Transparency

Because `.pth` autoloading is “magic”, document it prominently:

- what it does
- how to disable it
- what the limitations are

That helps avoid surprise and builds trust.
