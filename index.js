const {
  createAudioResource,
  StreamType,
  createAudioPlayer,
  NoSubscriberBehavior,
} = require("@discordjs/voice");

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

client.on("ready", async () => {
  console.log("Ready!");
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

async function generateAudio(text, filepath, voice) {
  /* まずtextを渡してsynthesis宛のパラメータを生成する、textはURLに付けるのでencodeURIで変換しておく。*/
  const audio_query = await rpc.post(
    "audio_query?text=" + encodeURI(text) + "&speaker=" + voice,
    {
      headers: { accept: "application/json" },
    }
  );

  //audio_queryで受け取った結果がaudio_query.dataに入っている。
  //このデータをメソッド:synthesisに渡すことで音声データを作ってもらえる
  //audio_query.dataはObjectで、synthesisに送る為にはstringで送る必要があるのでJSON.stringifyでstringに変換する
  const synthesis = await rpc.post(
    "synthesis?speaker=" + voice,
    JSON.stringify(audio_query.data),
    {
      responseType: "arraybuffer",
      headers: {
        accept: "audio/wav",
        "Content-Type": "application/json",
      },
    }
  );

  //受け取った後、Bufferに変換して書き出す
  fs.writeFileSync(filepath, new Buffer.from(synthesis.data), "binary");
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

client.login(process.env.DISCORD_TOKEN);
