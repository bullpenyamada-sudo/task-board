#!/bin/zsh
# タスク管理ボードをスマホ用に公開する（暗号化→GitHub Pagesへpush）
set -e
cd "$(dirname "$0")"
cp ../task-dashboard.html index.html
node encrypt-feed.mjs ../task-feed.js ../.taskboard-pass feed.enc.json
git add -A
git diff --cached --quiet && { echo "変更なし（公開スキップ）"; exit 0; }
git commit -m "予定データ更新 $(date +%Y-%m-%d\ %H:%M)"
git push
echo "公開完了"
