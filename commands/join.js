const { joinVoiceChannel } = require("@discordjs/voice");
module.exports = {
  data: {
    name: "join",
    description: "Join voice channel!",
  },
  async execute(interaction) {
    const guild = interaction.guild;
    const member = await guild.members.fetch(interaction.member.id);
    const memberVC = member.voice.channel;
    if (!memberVC) {
      console.log("接続先のVCが見つかりません。");
    }
    if (!memberVC.joinable) {
      console.log("VCに接続できません。");
    }
    if (!memberVC.speakable) {
      console.log("VCで音声を再生する権限がありません。");
    }
    const connection = joinVoiceChannel({
      guildId: guild.id,
      channelId: memberVC.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfMute: false,
      selfDeaf: true,
    });
    await interaction.reply("Join VC");
    return;
  },
};
