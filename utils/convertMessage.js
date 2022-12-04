function convertMessage(text) {
  // カスタム絵文字
  text = text.replace(/<:[a-zA-Z0-9_]+:[0-9]+>/g, "");
  // 絵文字
  text = text.replace(emojiRegex(), "");
  // URL
  text = text.replace(/(https?|ftp)(:\/\/[\w\/:%#\$&\?\(\)~\.=\+\-]+)/g, "");
  // 改行
  text = text.replace(/\r?\n/g, "、");

  return text;
}

export default convertMessage;
