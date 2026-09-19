#!/bin/bash
cd -- "$(dirname -- "$0")" || exit 1
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
printf '\nWhisperDrop を起動します。\n\n'
if ! command -v node >/dev/null 2>&1; then
  printf 'Node.js が見つかりません。\nhttps://nodejs.org/ja/download から LTS の macOS Installer (.pkg) をインストールしてください。\nインストール後、この「起動.command」をもう一度ダブルクリックしてください。\n\nEnterキーで閉じます。'
  read -r
  exit 1
fi
if ! node -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 18 ? 0 : 1)'; then
  printf 'Node.js 18以降が必要です。公式サイトからLTS版をインストールしてください。\nEnterキーで閉じます。'
  read -r
  exit 1
fi
if [ ! -f dist/index.html ] || [ ! -f scripts/serve.mjs ]; then
  printf '必要なファイルが見つかりません。ZIPを解凍し、フォルダ一式をそのまま使用してください。\nEnterキーで閉じます。'
  read -r
  exit 1
fi
node scripts/serve.mjs
result=$?
printf '\nWhisperDropを終了しました。Enterキーでこの画面を閉じます。'
read -r
exit "$result"
