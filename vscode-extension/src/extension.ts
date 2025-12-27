import * as vscode from "vscode";
import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

type RunResult = { code: number | null; signal: NodeJS.Signals | null };

function getPlatsPath(): string {
  return vscode.workspace.getConfiguration("vlaamscodex").get<string>("platsPath", "plats");
}

function getWorkingDirectoryForFile(filePath: string): string {
  const folder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(filePath));
  if (folder) return folder.uri.fsPath;
  return path.dirname(filePath);
}

function getDefaultCwd(): string {
  const folder = vscode.workspace.workspaceFolders?.[0];
  if (folder) return folder.uri.fsPath;
  return os.homedir();
}

async function ensureActivePlatsEditor(): Promise<vscode.TextEditor> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) throw new Error("No active editor. Open a .plats file first.");
  const filePath = editor.document.uri.fsPath;
  if (!filePath.endsWith(".plats")) throw new Error("The active file is not a .plats file.");
  return editor;
}

function appendChannelHeader(channel: vscode.OutputChannel, title: string): void {
  channel.appendLine("");
  channel.appendLine(`=== ${title} (${new Date().toISOString()}) ===`);
}

function isSpawnNotFound(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code?: unknown }).code === "ENOENT";
}

function runPlats(channel: vscode.OutputChannel, platsPath: string, args: string[], cwd: string): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    let child;
    try {
      child = spawn(platsPath, args, { cwd });
    } catch (err) {
      reject(err);
      return;
    }

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");

    child.stdout.on("data", (chunk: string) => channel.append(chunk));
    child.stderr.on("data", (chunk: string) => channel.append(chunk));

    child.on("error", (err) => reject(err));
    child.on("close", (code, signal) => resolve({ code, signal }));
  });
}

async function runWithErrorHandling(
  channel: vscode.OutputChannel,
  title: string,
  platsArgs: string[],
  cwd: string,
  onSuccess?: () => void,
): Promise<void> {
  const platsPath = getPlatsPath();

  channel.show(true);
  appendChannelHeader(channel, title);
  channel.appendLine(`Command: ${platsPath} ${platsArgs.join(" ")}`);
  channel.appendLine(`CWD: ${cwd}`);

  try {
    const result = await runPlats(channel, platsPath, platsArgs, cwd);
    if (result.code !== 0) {
      void vscode.window.showErrorMessage(`VlaamsCodex failed (exit code ${result.code ?? "unknown"}). See Output: VlaamsCodex.`);
    } else {
      onSuccess?.();
    }
  } catch (err) {
    if (isSpawnNotFound(err)) {
      void vscode.window.showErrorMessage(
        "Could not find the 'plats' executable. Install VlaamsCodex (pipx/pip) or set vlaamscodex.platsPath in Settings.",
      );
    } else {
      void vscode.window.showErrorMessage("Failed to run Plats. See Output: VlaamsCodex.");
    }
    channel.appendLine("");
    channel.appendLine(`Error: ${String(err)}`);
  }
}

function normalizeSelectionText(text: string): string {
  return text.replace(/\r\n/g, "\n");
}

function ensureCodingCookie(text: string): string {
  const trimmed = text.trimStart();
  if (trimmed.startsWith("# coding:")) return text;
  return `# coding: vlaamsplats\n${text}`;
}

function ensureProgramWrapper(text: string): string {
  const hasPlan = /\bplan\s+doe\b/.test(text);
  const hasGedaan = /\bgedaan\b/.test(text);
  if (hasPlan && hasGedaan) return text;

  const body = text
    .split("\n")
    .map((line) => (line.trim().length === 0 ? "" : `  ${line}`))
    .join("\n");
  return `plan doe\n${body}\n\ngedaan\n`;
}

async function cmdRunFile(channel: vscode.OutputChannel): Promise<void> {
  const editor = await ensureActivePlatsEditor();
  if (editor.document.isDirty) await editor.document.save();

  const filePath = editor.document.uri.fsPath;
  const cwd = getWorkingDirectoryForFile(filePath);

  await runWithErrorHandling(channel, `Run Plats File: ${path.basename(filePath)}`, ["run", filePath], cwd);
}

async function cmdRunSelection(channel: vscode.OutputChannel): Promise<void> {
  const editor = await ensureActivePlatsEditor();
  const selection = editor.selection;
  const selectedText = editor.document.getText(selection);
  if (!selectedText || selectedText.trim().length === 0) {
    void vscode.window.showInformationMessage("Select some Plats code first.");
    return;
  }

  const normalized = normalizeSelectionText(selectedText);
  const wrapped = ensureProgramWrapper(normalized);
  const withCookie = ensureCodingCookie(wrapped);

  const tmpFile = path.join(os.tmpdir(), `vlaamscodex-selection-${Date.now()}-${Math.random().toString(16).slice(2)}.plats`);
  await fs.writeFile(tmpFile, withCookie, { encoding: "utf8" });

  const filePath = editor.document.uri.fsPath;
  const cwd = getWorkingDirectoryForFile(filePath);

  try {
    await runWithErrorHandling(
      channel,
      `Run Selection as Plats: ${path.basename(filePath)}`,
      ["run", tmpFile],
      cwd,
    );
  } finally {
    try {
      await fs.unlink(tmpFile);
    } catch {
      // ignore
    }
  }
}

async function cmdShowPython(channel: vscode.OutputChannel): Promise<void> {
  const editor = await ensureActivePlatsEditor();
  if (editor.document.isDirty) await editor.document.save();

  const filePath = editor.document.uri.fsPath;
  const cwd = getWorkingDirectoryForFile(filePath);
  await runWithErrorHandling(channel, `Show Generated Python: ${path.basename(filePath)}`, ["show-python", filePath], cwd);
}

async function cmdBuildPython(channel: vscode.OutputChannel): Promise<void> {
  const editor = await ensureActivePlatsEditor();
  if (editor.document.isDirty) await editor.document.save();

  const filePath = editor.document.uri.fsPath;
  const cwd = getWorkingDirectoryForFile(filePath);

  const defaultOut = filePath.replace(/\.plats$/i, ".py");
  const outUri = await vscode.window.showSaveDialog({
    title: "Build Plats to Python",
    defaultUri: vscode.Uri.file(defaultOut),
    filters: { Python: ["py"] },
  });
  if (!outUri) return;

  await runWithErrorHandling(
    channel,
    `Build Plats to Python: ${path.basename(filePath)}`,
    ["build", filePath, "--out", outUri.fsPath],
    cwd,
    () => void vscode.window.showInformationMessage(`Built Python file: ${outUri.fsPath}`),
  );
}

async function cmdHelp(channel: vscode.OutputChannel): Promise<void> {
  await runWithErrorHandling(channel, "Plats CLI Help", ["help"], getDefaultCwd());
}

async function cmdVersion(channel: vscode.OutputChannel): Promise<void> {
  await runWithErrorHandling(channel, "Plats CLI Version", ["version"], getDefaultCwd());
}

export function activate(context: vscode.ExtensionContext): void {
  const channel = vscode.window.createOutputChannel("VlaamsCodex");

  context.subscriptions.push(
    channel,
    vscode.commands.registerCommand("vlaamscodex.runFile", () => cmdRunFile(channel)),
    vscode.commands.registerCommand("vlaamscodex.runSelection", () => cmdRunSelection(channel)),
    vscode.commands.registerCommand("vlaamscodex.showPython", () => cmdShowPython(channel)),
    vscode.commands.registerCommand("vlaamscodex.buildPython", () => cmdBuildPython(channel)),
    vscode.commands.registerCommand("vlaamscodex.help", () => cmdHelp(channel)),
    vscode.commands.registerCommand("vlaamscodex.version", () => cmdVersion(channel)),
  );
}

export function deactivate(): void {
  // no-op
}

