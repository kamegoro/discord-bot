const { getVoiceConnection } = require("@discordjs/voice");
module.exports = {
  data: {
    name: "bye",
    description: "Disconnect voice channel!",
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

    const connection = getVoiceConnection(memberVC.guild.id);
    connection.destroy();
    await interaction.reply("Bye VC");
  },
};
