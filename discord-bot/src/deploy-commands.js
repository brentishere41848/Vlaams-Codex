import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PermissionFlagsBits, REST, Routes, SlashCommandBuilder } from "discord.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(PROJECT_ROOT, ".env") });

function requiredEnv(name) {
  const value = process.env[name];
  if (!value || !String(value).trim()) {
    console.error(`Ontbrekende env var: ${name}`);
    process.exit(1);
  }
  return String(value).trim();
}

const DISCORD_TOKEN = requiredEnv("DISCORD_TOKEN");
const CLIENT_ID = requiredEnv("CLIENT_ID");
const GUILD_ID = String(process.env.GUILD_ID || "1454570813784199181").trim();

const adminPerms = PermissionFlagsBits.ManageGuild;

const commands = [
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

const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

try {
  console.log(`Deploying ${commands.length} guild commands naar guild ${GUILD_ID}...`);
  await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
  console.log("Klaar.");
} catch (error) {
  console.error("Deploy mislukt:", error);
  process.exit(1);
}
