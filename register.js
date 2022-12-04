const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config();

const commands = [];

// commandsディレクトリのファイルを全取得
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

// コマンドを配列に突っ込む
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

// コマンドをdiscordサーバに登録
(async () => {
  try {
    console.log("スラッシュコマンド登録");
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
  } catch (err) {
    console.error(err);
  }
})();
