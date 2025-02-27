//@ts-nocheck
/**
 * @typedef {(
    *  "en"
    *  "af-ZA"|"am-ET"|"hy-AM"|"az-AZ"|"id-ID"|"ms-MY"|"bn-BD"|"bn-IN"|"ca-ES"|"cs-CZ"|"da-DK"|"de-DE"|
    *  "en-AU"|"en-CA"|"en-GH"|"en-GB"|"en-IN"|"en-IE"|"en-KE"|"en-NZ"|"en-NG"|"en-PH"|"en-SG"|"en-ZA"|
    *  "en-TZ"|"en-US"|"es-AR"|"es-BO"|"es-CL"|"es-CO"|"es-CR"|"es-EC"|"es-SV"|"es-ES"|"es-US"|"es-GT"|
    *  "es-HN"|"es-MX"|"es-NI"|"es-PA"|"es-PY"|"es-PE"|"es-PR"|"es-DO"|"es-UY"|"es-VE"|"eu-ES"|"fil-PH"|
    *  "fr-CA"|"fr-FR"|"gl-ES"|"ka-GE"|"gu-IN"|"hr-HR"|"zu-ZA"|"is-IS"|"it-IT"|"jv-ID"|"kn-IN"|"km-KH"|
    *  "lo-LA"|"lv-LV"|"lt-LT"|"hu-HU"|"ml-IN"|"mr-IN"|"nl-NL"|"ne-NP"|"nb-NO"|"pl-PL"|"pt-BR"|"pt-PT"|
    *  "ro-RO"|"si-LK"|"sk-SK"|"sl-SI"|"su-ID"|"sw-TZ"|"sw-KE"|"fi-FI"|"sv-SE"|"ta-IN"|"ta-SG"|"ta-LK"|
    *  "ta-MY"|"te-IN"|"vi-VN"|"tr-TR"|"ur-PK"|"ur-IN"|"el-GR"|"bg-BG"|"ru-RU"|"sr-RS"|"uk-UA"|"he-IL"|
    *  "ar-IL"|"ar-JO"|"ar-AE"|"ar-BH"|"ar-DZ"|"ar-SA"|"ar-IQ"|"ar-KW"|"ar-MA"|"ar-TN"|"ar-OM"|"ar-PS"|
    *  "ar-QA"|"ar-LB"|"ar-EG"|"fa-IR"|"hi-IN"|"th-TH"|"ko-KR"|"zh-TW"|"yue-Hant-HK"|"ja-JP"|"zh-HK"|"zh"
    *  )} Language
*/
const googleTTS = require('google-tts-api'); // CommonJS
const fs = require('fs');
const Stream = require('stream');

function base64ToBinary(base64Text){
  const binary=Buffer.from(base64Text,"base64").toString("binary");
  const buffer=new ArrayBuffer(binary.length);
  let bytes=new Uint8Array(buffer);
  let i=0;
  const bytesLength=buffer.byteLength;
  for (i; i < bytesLength; i++) {
      bytes[i]=binary.charCodeAt(i) & 0xFF;
  }
  return bytes;
}

function base64toBinaryStream(base64Text){
  const binary=base64ToBinary(base64Text);
  const stream=new Stream.PassThrough();
  stream.write(binary,"binary");
  return stream;
}

/**
 * @param {string} text
 * @param {PlainObject} cfg
 * @param {Language} cfg.lang
 * @param {boolean} cfg.slow
 * @param {string} cfg.host
 * @param {number} cfg.timeout
 * @param {string} cfg.splitPunct
 */
function downloadFromInfoCallback(stream, text, {lang, slow, host, timeout, splitPunct}) {
    googleTTS.getAudioBase64(text, {lang, slow, host, timeout, splitPunct})
      .then(base64Audio => base64toBinaryStream(base64Audio))
      .then(audioStream => audioStream.pipe(stream))
      .catch(console.error);
}

/**
 * @param {string} text
 * @param {Language} [lang="en-GB"]
 * @param {boolean} [slow=false]
 * @param {string} cfg.host
 * @param {number} cfg.timeout
 * @param {string} cfg.splitPunct
 */
function getVoiceStream(text, {lang = 'en', slow = false, host = 'https://translate.google.com', timeout = 10000, splitPunct} = {}) {
    const stream = new Stream.PassThrough();
    downloadFromInfoCallback(stream, text, {lang, slow, host, timeout, splitPunct });
    return stream;
}

/**
 * @param {string} filePath
 * @param {string} text
 * @param {PlainObject} cfg
 * @param {Language} [cfg.lang="pt-BR"]
 * @param {number} [cfg.slow=false]
 * @param {string} cfg.host
 * @param {number} cfg.timeout
 * @param {string} cfg.splitPunct
 */
function saveToFile(filePath, text, {lang = 'pt-BR', slow = false, host, timeout, splitPunct} = {}) {
    const stream = new Stream.PassThrough();
    const writeStream = fs.createWriteStream(filePath);
    downloadFromInfoCallback(stream, text, {lang, slow, host, timeout, splitPunct });
    stream.pipe(writeStream);
    stream.on('end', () => writeStream.close());
}

module.exports.getVoiceStream = getVoiceStream;
module.exports.saveToFile = saveToFile;
