const { default: axios } = require("axios");
const rpc = axios.create({ baseURL: "http://voicevox-engine:50021/", proxy: false });
const fs = require("fs");

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

export default generateAudio;
