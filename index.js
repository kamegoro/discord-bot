const convertMessage = require("./utils/convertMessage");
const generateAudio = require("./utils/generateAudio");
const {
  getVoiceConnection,
  createAudioResource,
  StreamType,
  createAudioPlayer,
  NoSubscriberBehavior,
} = require("@discordjs/voice");
const fs = require("fs");

const { Client, Intents } = require("discord.js");
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MESSAGES,
  ],
});

const dotenv = require("dotenv");
dotenv.config();

const default_voice = "6";
var voiceMap = new Map();

// コマンド取得
const commands = {};
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands[command.data.name] = command;
}

client.on("ready", async () => {
  // コマンド登録
  const data = [];
  for (const commandName in commands) {
    data.push(commands[commandName].data);
  }
  await client.application.commands.set(data);
  console.log("Ready!");
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isCommand()) {
    return;
  }

  const command = commands[interaction.commandName];
  try {
    if (interaction.commandName === "voice-actor") {
      const voice = interaction.options.getString("speaker");
      voiceMap.set(interaction.member.id, voice);
    }
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

client.on("messageCreate", async msg => {
  if (msg.author.bot) {
    return;
  }
  const filepath = "sounds/" + msg.author.id + ".wav";
  var voice = voiceMap.get(msg.author.id);
  if (!voice) {
    voice = default_voice;
  }

  var message = convertMessage(msg.cleanContent);
  await generateAudio(message, filepath, voice);
  await play(msg, filepath);
});

async function getConnection(interaction) {
  const guild = interaction.guild;
  const member = await guild.members.fetch(interaction.member.id);
  const memberVC = member.voice.channel;
  if (!memberVC) {
    console.log("接続先のVCが見つかりません");
  }
  if (!memberVC.joinable) {
    console.log("VCに接続できません。");
  }
  if (!memberVC.speakable) {
    console.log("VCで音声を再生する権限がありません。");
  }
  return getVoiceConnection(memberVC.guild.id);
}

async function play(interaction, filepath) {
  const connection = await getConnection(interaction);

  if (!connection) {
    console.log("VCに接続していません。");
    return;
  }
  const resource = createAudioResource(filepath, { inputType: StreamType.Arbitrary });
  const player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    },
  });
  player.play(resource);

  connection.subscribe(player);
}

client.login(process.env.TOKEN);
