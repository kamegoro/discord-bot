const { Client } = require("discord.js");
const { Player } = require("discord-player");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config();

const client = new Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"],
});

client.slashcommands = {};
client.player = new Player(client);

// commandsディレクトリのファイルを全取得
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.slashcommands[command.data.name] = command;
}

client.once("ready", () => {
  console.log("ready!");
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isCommand()) return;

  // コマンド名からコマンドを取得して実行
  const command = client.slashcommands[interaction.commandName];
  if (!command) {
    await interaction.reply({
      content: "コマンドが存在しません",
      ephemeral: true,
    });
  }
  await command.run({ client, interaction });
});

// bot起動
client.login(process.env.TOKEN);
