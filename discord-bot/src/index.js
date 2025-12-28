import dotenv from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  Client,
  GatewayIntentBits,
  PermissionFlagsBits,
  REST,
  Routes,
  SlashCommandBuilder
} from "discord.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(PROJECT_ROOT, ".env") });

const STATE_PATH = path.join(__dirname, "state.json");
const FIXED_CHANGELOG_CHANNEL_ID = "1454574317873397771";
const X_LINK = "https://x.com/vlaamscodex";

const FIXED_LINKS = [
  "https://marketplace.visualstudio.com/items?itemName=PlatsVlaamseCodex.vlaamscodex-platskript",
  "https://open-vsx.org/extension/PlatsVlaamseCodex/vlaamscodex-platskript",
  "https://github.com/brentishere41848/Vlaams-Codex",
  "https://www.npmjs.com/package/vlaamscodex",
  "https://pypi.org/manage/project/vlaamscodex/releases/",
  "https://vlaamscodex.site"
];

function fixedLinksLine() {
  return FIXED_LINKS.map((u) => `<${u}>`).join(" | ");
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value || !String(value).trim()) {
    console.error(`Ontbrekende env var: ${name}`);
    process.exit(1);
  }
  return String(value).trim();
}

function parseBoolean(value, fallback) {
  if (value === undefined || value === null) return fallback;
  const s = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(s)) return true;
  if (["0", "false", "no", "n", "off"].includes(s)) return false;
  return fallback;
}

function parseIntSafe(value, fallback) {
  const n = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
}

function neutralizeEveryoneHere(text) {
  return String(text)
    .replace(/@everyone/g, "@\u200Beveryone")
    .replace(/@here/g, "@\u200Bhere");
}

function truncateWithSuffix(text, maxLen, suffix) {
  const s = String(text ?? "");
  if (s.length <= maxLen) return s;
  if (maxLen <= 0) return "";
  const suf = String(suffix ?? "");
  if (suf.length >= maxLen) return suf.slice(0, maxLen);
  return s.slice(0, maxLen - suf.length) + suf;
}

async function readJsonFileOrNull(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function writeJsonAtomic(filePath, data) {
  const dir = path.dirname(filePath);
  const tmp = path.join(dir, `.tmp-${path.basename(filePath)}-${process.pid}-${Date.now()}`);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(tmp, JSON.stringify(data, null, 2) + "\n", "utf8");
  await fs.rename(tmp, filePath);
}

function buildDefaultState() {
  const channelId = FIXED_CHANGELOG_CHANNEL_ID;
  const mentionEveryone = parseBoolean(process.env.MENTION_EVERYONE, true);
  return { lastReleaseId: null, channelId, mentionEveryone };
}

async function loadState() {
  const fallback = buildDefaultState();
  const state = (await readJsonFileOrNull(STATE_PATH)) ?? {};

  const merged = {
    lastReleaseId:
      typeof state.lastReleaseId === "number" || typeof state.lastReleaseId === "string"
        ? state.lastReleaseId
        : fallback.lastReleaseId,
    channelId: FIXED_CHANGELOG_CHANNEL_ID,
    mentionEveryone: typeof state.mentionEveryone === "boolean" ? state.mentionEveryone : fallback.mentionEveryone
  };

  await writeJsonAtomic(STATE_PATH, merged);
  return merged;
}

async function saveState(nextState) {
  await writeJsonAtomic(STATE_PATH, nextState);
}

function githubReleasesUrl(owner, repo) {
  return `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases?per_page=10&page=1`;
}

async function fetchReleases({ owner, repo, token }) {
  const url = githubReleasesUrl(owner, repo);
  const baseHeaders = {
    Accept: "application/vnd.github+json",
    "User-Agent": "VLAAMSCODEX-DiscordBot"
  };

  const tokenTrimmed = token && String(token).trim() ? String(token).trim() : "";
  const authedHeaders = tokenTrimmed
    ? { ...baseHeaders, Authorization: `Bearer ${tokenTrimmed}` }
    : baseHeaders;

  let res = await fetch(url, { headers: authedHeaders });
  if (res.status === 401 && tokenTrimmed) {
    const text = await res.text().catch(() => "");
    console.error(
      `GitHub token ongeldig (401). Ik probeer opnieuw zonder token. Details: ${text || "Bad credentials"}`
    );
    res = await fetch(url, { headers: baseHeaders });
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GitHub API fout (${res.status}): ${text || res.statusText}`);
  }
  const json = await res.json();
  return Array.isArray(json) ? json : [];
}

function pickLatestRelease(releases, includePrereleases) {
  const filtered = releases
    .filter((r) => r && r.draft === false)
    .filter((r) => (includePrereleases ? true : r.prerelease === false))
    .filter((r) => typeof r.published_at === "string" && r.published_at);

  filtered.sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at));
  return filtered[0] ?? null;
}

function toUnixSeconds(isoString) {
  const ms = Date.parse(isoString);
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : null;
}

function formatReleaseAnnouncementContent(release, { mentionEveryone }) {
  const title = neutralizeEveryoneHere(release.name || release.tag_name || "Nieuwe release");
  const url = String(release.html_url || "").trim();
  const published = toUnixSeconds(release.published_at);

  const headerLines = [];
  if (mentionEveryone) headerLines.push("@everyone");
  headerLines.push(`**${title}**`);
  if (url) headerLines.push(`<${url}>`);
  if (published) headerLines.push(`<t:${published}:F>`);

  const footer = fixedLinksLine();
  const rawBody = neutralizeEveryoneHere(release.body || "");
  const bodyOrFallback = rawBody.trim() ? rawBody.trim() : "Geen changelog opgegeven.";

  const base = headerLines.join("\n") + "\n\n";
  const suffix = "… (ingekort)";

  const maxTotal = 2000;
  const reserved = base.length + "\n\n".length + footer.length;
  const maxBody = Math.max(0, maxTotal - reserved);
  const bodyFinal = truncateWithSuffix(bodyOrFallback, Math.min(2000, maxBody), suffix);

  return `${base}${bodyFinal}\n\n${footer}`;
}

function formatManualAnnouncementContent(text, { mentionEveryone }) {
  const footer = fixedLinksLine();
  const prefix = mentionEveryone ? "@everyone\n\n" : "";
  const safeText = neutralizeEveryoneHere(text || "").trim() || " ";

  const maxTotal = 2000;
  const suffix = "… (ingekort)";
  const reserved = prefix.length + "\n\n".length + footer.length;
  const maxText = Math.max(0, maxTotal - reserved);
  const textFinal = truncateWithSuffix(safeText, maxText, suffix);

  return `${prefix}${textFinal}\n\n${footer}`;
}

function formatStuurlinksMessage() {
  const lines = [
    "Awel se, pak u nen koffie en zet u efkes: hier zenne de VlaamsCodex-links waar ge mee kunt stoefen.",
    "",
    `- VS Code Marketplace: <${FIXED_LINKS[0]}>`,
    `- Open VSX: <${FIXED_LINKS[1]}>`,
    `- GitHub: <${FIXED_LINKS[2]}>`,
    `- NPM: <${FIXED_LINKS[3]}>`,
    `- PyPI (ja, da’s nen rare /manage/ link, mo ’t moet zo): <${FIXED_LINKS[4]}>`,
    `- Docs: <${FIXED_LINKS[5]}>`,
    `- X (Twitter, hoe ge ’t ook noemt): <${X_LINK}>`,
    "",
    "En nu: goa gij wa plansen of wa? ’t Es tijd da ge iets schoons in mekaar steekt."
  ];
  return lines.join("\n");
}

const DISCORD_TOKEN = requiredEnv("DISCORD_TOKEN");
const CLIENT_ID = String(process.env.CLIENT_ID || "").trim();
const GUILD_ID = String(process.env.GUILD_ID || "1454570813784199181").trim();
const GITHUB_OWNER = String(process.env.GITHUB_OWNER || "brentishere41848").trim();
const GITHUB_REPO = String(process.env.GITHUB_REPO || "Vlaams-Codex").trim();
const GITHUB_TOKEN = String(process.env.GITHUB_TOKEN || "").trim();
const POLL_INTERVAL_MS = Math.max(10_000, parseIntSafe(process.env.POLL_INTERVAL_MS, 300_000));
const INCLUDE_PRERELEASES = parseBoolean(process.env.INCLUDE_PRERELEASES, true);
const ANNOUNCE_ON_START = parseBoolean(process.env.ANNOUNCE_ON_START, false);

function buildGuildCommands() {
  const adminPerms = PermissionFlagsBits.ManageGuild;
  return [
    new SlashCommandBuilder().setName("ping").setDescription("Check of de bot leeft.").setDMPermission(false),

    new SlashCommandBuilder().setName("links").setDescription("Toon alle vaste links.").setDMPermission(false),

    new SlashCommandBuilder()
      .setName("stuurlinks")
      .setDescription("Stuur de links in schoon plat Vlaams.")
      .setDMPermission(false),

    new SlashCommandBuilder().setName("changelog").setDescription("Toon de laatste GitHub release.").setDMPermission(false),

    new SlashCommandBuilder()
      .setName("announce")
      .setDescription("Post handmatig in het changelog-kanaal.")
      .setDMPermission(false)
      .setDefaultMemberPermissions(adminPerms)
      .addStringOption((opt) =>
        opt.setName("tekst").setDescription("De tekst die je wil posten.").setRequired(true)
      ),

    new SlashCommandBuilder()
      .setName("forcecheck")
      .setDescription("Forceer GitHub release check en post altijd.")
      .setDMPermission(false)
      .setDefaultMemberPermissions(adminPerms),

    new SlashCommandBuilder()
      .setName("toggleeveryone")
      .setDescription("Zet @everyone AAN/UIT.")
      .setDMPermission(false)
      .setDefaultMemberPermissions(adminPerms),

    new SlashCommandBuilder()
      .setName("setchannel")
      .setDescription("Zet het changelog-kanaal.")
      .setDMPermission(false)
      .setDefaultMemberPermissions(adminPerms)
      .addStringOption((opt) =>
        opt.setName("channel_id").setDescription("Discord kanaal ID (snowflake).").setRequired(true)
      ),

    new SlashCommandBuilder().setName("config").setDescription("Toon de huidige botconfig.").setDMPermission(false),

    new SlashCommandBuilder()
      .setName("vlaamsify")
      .setDescription("Zet uw tekst nen tikkeltje meer Vlaams.")
      .setDMPermission(false)
      .addStringOption((opt) =>
        opt.setName("tekst").setDescription("Tekst om te vlaamsify’en.").setRequired(true)
      )
  ].map((c) => c.toJSON());
}

async function deployGuildCommandsOnStart() {
  if (!CLIENT_ID) {
    console.error("Command deploy overgeslagen: CLIENT_ID ontbreekt in .env");
    return false;
  }
  if (!GUILD_ID) {
    console.error("Command deploy overgeslagen: GUILD_ID ontbreekt in .env");
    return false;
  }

  try {
    const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);
    const commands = buildGuildCommands();
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log(`Slash commands gedeployed naar guild ${GUILD_ID}.`);
    return true;
  } catch (error) {
    console.error("Slash command deploy fout:", error);
    return false;
  }
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  allowedMentions: { parse: [] }
});

let state = await loadState();
let isChecking = false;

async function resolveChangelogChannel() {
  const channelId = FIXED_CHANGELOG_CHANNEL_ID;
  if (!channelId) throw new Error("Geen channelId in state.json of env var CHANGELOG_CHANNEL_ID.");

  let channel = null;
  try {
    channel = await client.channels.fetch(channelId);
  } catch (error) {
    throw new Error(`Kon kanaal ${channelId} niet ophalen: ${String(error?.message || error)}`);
  }

  if (!channel) throw new Error(`Kanaal niet gevonden: ${channelId}`);
  if (!channel.isTextBased?.() || typeof channel.send !== "function") {
    throw new Error(`Kanaal is niet text-based of niet postbaar: ${channelId}`);
  }
  return channel;
}

async function postToChangelog(content, { allowEveryone }) {
  let channel = null;
  try {
    channel = await resolveChangelogChannel();
  } catch (error) {
    console.error("Kanaal fout:", error);
    return false;
  }

  try {
    await channel.send({
      content,
      allowedMentions: allowEveryone ? { parse: ["everyone"] } : { parse: [] }
    });
    return true;
  } catch (error) {
    console.error("Discord send fout:", error);
    return false;
  }
}

async function checkForNewRelease({ forcePost }) {
  if (isChecking) return { ok: false, reason: "busy" };
  isChecking = true;

  try {
    const releases = await fetchReleases({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      token: GITHUB_TOKEN
    });
    const latest = pickLatestRelease(releases, INCLUDE_PRERELEASES);
    if (!latest) return { ok: true, posted: false, latest: null };

    const latestId = latest.id;
    const lastId = state.lastReleaseId;
    const isFirstRun = lastId === null || lastId === undefined || lastId === "";

    if (!forcePost && isFirstRun && !ANNOUNCE_ON_START) {
      state.lastReleaseId = latestId;
      await saveState(state);
      return { ok: true, posted: false, latest, initialized: true };
    }

    const shouldPost = forcePost || String(latestId) !== String(lastId);
    if (!shouldPost) return { ok: true, posted: false, latest };

    const content = formatReleaseAnnouncementContent(latest, {
      mentionEveryone: Boolean(state.mentionEveryone)
    });

    const posted = await postToChangelog(content, { allowEveryone: Boolean(state.mentionEveryone) });
    if (posted) {
      state.lastReleaseId = latestId;
      await saveState(state);
    }

    return { ok: true, posted, latest };
  } catch (error) {
    console.error("GitHub check fout:", error);
    return { ok: false, error: String(error?.message || error) };
  } finally {
    isChecking = false;
  }
}

function vlaamsifyText(input) {
  const rules = [
    ["jij", "gij"],
    ["niet", "nie"],
    ["wat", "wa"],
    ["heel", "kei"],
    ["goed", "goe"],
    ["hoe", "oe"]
  ];

  let out = String(input ?? "");
  for (const [from, to] of rules) {
    const re = new RegExp(`\\b${from}\\b`, "gi");
    out = out.replace(re, (match) => {
      const isCapitalized = match[0] === match[0].toUpperCase();
      return isCapitalized ? to[0].toUpperCase() + to.slice(1) : to;
    });
  }
  return out;
}

client.on("ready", async () => {
  console.log(`Ingelogd als ${client.user?.tag ?? client.user?.id ?? "onbekend"}.`);
  console.log(
    [
      `Guild: ${GUILD_ID}`,
      `Repo: ${GITHUB_OWNER}/${GITHUB_REPO}`,
      `Kanaal: ${FIXED_CHANGELOG_CHANNEL_ID}`,
      `@everyone: ${state.mentionEveryone ? "AAN" : "UIT"}`,
      `Include prereleases: ${INCLUDE_PRERELEASES ? "ja" : "nee"}`,
      `Poll interval: ${POLL_INTERVAL_MS} ms`
    ].join(" | ")
  );

  await deployGuildCommandsOnStart();

  const first = await checkForNewRelease({ forcePost: false });
  if (!first.ok) console.error("Init check fout:", first.error || first.reason || "onbekend");

  setInterval(async () => {
    const result = await checkForNewRelease({ forcePost: false });
    if (!result.ok) console.error("Polling check fout:", result.error || result.reason || "onbekend");
  }, POLL_INTERVAL_MS).unref?.();
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    const isAdmin = Boolean(interaction.memberPermissions?.has?.(PermissionFlagsBits.ManageGuild));

    if (interaction.commandName === "ping") {
      await interaction.reply({
        content: "Awel ja, ik leef nog. Wa is’t er? Zedde gij mij aan ’t testen ofwa? 😄",
        ephemeral: true,
        allowedMentions: { parse: [] }
      });
      return;
    }

    if (interaction.commandName === "links") {
      const lines = FIXED_LINKS.map((u) => `<${u}>`).join("\n");
      await interaction.reply({ content: lines, ephemeral: true, allowedMentions: { parse: [] } });
      return;
    }

    if (interaction.commandName === "stuurlinks") {
      await interaction.reply({ content: formatStuurlinksMessage(), ephemeral: true, allowedMentions: { parse: [] } });
      return;
    }

    if (interaction.commandName === "changelog") {
      const releases = await fetchReleases({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        token: GITHUB_TOKEN
      });
      const latest = pickLatestRelease(releases, INCLUDE_PRERELEASES);
      if (!latest) {
        await interaction.reply({ content: "Geen releases gevonden.", ephemeral: true, allowedMentions: { parse: [] } });
        return;
      }

      const content = formatReleaseAnnouncementContent(latest, { mentionEveryone: false });
      await interaction.reply({ content, ephemeral: true, allowedMentions: { parse: [] } });
      return;
    }

    if (interaction.commandName === "announce") {
      if (!isAdmin) {
        await interaction.reply({ content: "Geen permissie (Manage Server nodig).", ephemeral: true, allowedMentions: { parse: [] } });
        return;
      }
      const text = interaction.options.getString("tekst", true);
      const content = formatManualAnnouncementContent(text, {
        mentionEveryone: Boolean(state.mentionEveryone)
      });
      const posted = await postToChangelog(content, { allowEveryone: Boolean(state.mentionEveryone) });
      await interaction.reply({
        content: posted ? "Geplaatst." : "Kon niet posten (zie logs).",
        ephemeral: true,
        allowedMentions: { parse: [] }
      });
      return;
    }

    if (interaction.commandName === "forcecheck") {
      if (!isAdmin) {
        await interaction.reply({ content: "Geen permissie (Manage Server nodig).", ephemeral: true, allowedMentions: { parse: [] } });
        return;
      }
      const result = await checkForNewRelease({ forcePost: true });
      const msg =
        result.ok && result.posted
          ? "Forcecheck gedaan en gepost."
          : result.ok
            ? "Forcecheck gedaan, maar posten faalde (zie logs)."
            : `Forcecheck faalde: ${result.error || "onbekend"}`;
      await interaction.reply({ content: msg, ephemeral: true, allowedMentions: { parse: [] } });
      return;
    }

    if (interaction.commandName === "toggleeveryone") {
      if (!isAdmin) {
        await interaction.reply({ content: "Geen permissie (Manage Server nodig).", ephemeral: true, allowedMentions: { parse: [] } });
        return;
      }
      state.mentionEveryone = !Boolean(state.mentionEveryone);
      await saveState(state);
      await interaction.reply({
        content: `@everyone staat nu ${state.mentionEveryone ? "AAN" : "UIT"}.`,
        ephemeral: true,
        allowedMentions: { parse: [] }
      });
      return;
    }

    if (interaction.commandName === "setchannel") {
      if (!isAdmin) {
        await interaction.reply({ content: "Geen permissie (Manage Server nodig).", ephemeral: true, allowedMentions: { parse: [] } });
        return;
      }

      const requested = String(interaction.options.getString("channel_id", true)).trim();
      if (requested !== FIXED_CHANGELOG_CHANNEL_ID) {
        state.channelId = FIXED_CHANGELOG_CHANNEL_ID;
        await saveState(state);
        await interaction.reply({
          content: `Dit project post altijd naar ${FIXED_CHANGELOG_CHANNEL_ID}.`,
          ephemeral: true,
          allowedMentions: { parse: [] }
        });
        return;
      }

      state.channelId = FIXED_CHANGELOG_CHANNEL_ID;
      await saveState(state);
      await interaction.reply({ content: `Changelog-kanaal gezet naar ${FIXED_CHANGELOG_CHANNEL_ID}.`, ephemeral: true, allowedMentions: { parse: [] } });
      return;
    }

    if (interaction.commandName === "config") {
      const lines = [
        `channelId: ${FIXED_CHANGELOG_CHANNEL_ID}`,
        `mentionEveryone: ${state.mentionEveryone ? "true" : "false"}`,
        `pollInterval: ${POLL_INTERVAL_MS}`,
        `repo: ${GITHUB_OWNER}/${GITHUB_REPO}`,
        `includePrereleases: ${INCLUDE_PRERELEASES ? "true" : "false"}`
      ].join("\n");
      await interaction.reply({ content: lines, ephemeral: true, allowedMentions: { parse: [] } });
      return;
    }

    if (interaction.commandName === "vlaamsify") {
      const text = interaction.options.getString("tekst", true);
      const out = vlaamsifyText(text);
      await interaction.reply({ content: out || " ", ephemeral: true, allowedMentions: { parse: [] } });
      return;
    }
  } catch (error) {
    console.error("Interaction fout:", error);
    const payload = { content: "Er ging iets mis (zie logs).", ephemeral: true, allowedMentions: { parse: [] } };
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(payload).catch(() => {});
    } else {
      await interaction.reply(payload).catch(() => {});
    }
  }
});

process.on("unhandledRejection", (reason) => console.error("UnhandledRejection:", reason));
process.on("uncaughtException", (error) => console.error("UncaughtException:", error));

await client.login(DISCORD_TOKEN);
