// task-feed.js を合言葉で暗号化して feed.enc.json を作る
// 使い方: node encrypt-feed.mjs <task-feed.jsのパス> <合言葉ファイル> <出力パス>
import { readFileSync, writeFileSync } from 'fs';
import crypto from 'crypto';
import vm from 'vm';

const [,, feedPath, passPath, outPath] = process.argv;
if (!feedPath || !passPath || !outPath){
  console.error('usage: node encrypt-feed.mjs <task-feed.js> <passfile> <out.json>');
  process.exit(1);
}
const ctx = { window: {} };
vm.runInNewContext(readFileSync(feedPath, 'utf8'), ctx);
if (!ctx.window.TASK_FEED) { console.error('TASK_FEED not found in ' + feedPath); process.exit(1); }
const json = JSON.stringify(ctx.window.TASK_FEED);
const pass = readFileSync(passPath, 'utf8').trim();

const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);
const key = crypto.pbkdf2Sync(pass, salt, 150000, 32, 'sha256'); // ブラウザ側WebCryptoと同一条件
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const ct = Buffer.concat([cipher.update(json, 'utf8'), cipher.final(), cipher.getAuthTag()]);
writeFileSync(outPath, JSON.stringify({
  v: 1,
  salt: salt.toString('base64'),
  iv: iv.toString('base64'),
  data: ct.toString('base64')
}));
console.log('encrypted ->', outPath, `(${ct.length} bytes)`);
