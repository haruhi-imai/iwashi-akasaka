# Poker House いわし赤坂 来店ガイド

GitHub Pages で配信する静的サイトです。ローカルでは次のコマンドで起動し、http://127.0.0.1:8011/ を開きます。

```sh
python3 -m http.server 8011 --bind 127.0.0.1
```

## トップページを編集する

- 文章、ロゴ、メニューと各リンクは `index.html` で変更します。画面上部のメニュー、スマホメニュー、FV右欄のナビゲーションがあります。
- FVの動画は `assets/room-film.mp4`、最初の静止画は `assets/room-hero.webp` です。提供動画 `gemini_generated_video_2180f445.mp4` の1280×720の映像トラックを無劣化で収録し、先頭フレームからポスターを作成しました。映像は無音で一度再生します。再生操作とヘッダーの切り替えは `site.js` にあります。
- ロゴ・色・レイアウトは `style.css`、大会一覧は `calendar.css`、ゲームと料金は `games.css` で調整します。新しい配信ファイルを追加したときは `.github/workflows/pages.yml` のコピー対象にも加えます。

## 大会日程

`python3 scripts/update-calendar.py` で[店舗が公開しているPokerFansカレンダー](https://pokerfans.jp/clubs/6134?_lang=ja)から日程を取得し、`schedule.json` に書き出します。初回受付締切は明記された時刻だけを採用します。再参加の締切は各イベントの案内を参照してください。来店ガイドは日本時間で本日と近日を表示します。

GitHub Actions の `Publish visitor guide` がメインブランチへの反映時と4時間おきに取得・公開します。取得や検査が失敗した場合は公開済みの内容を維持します。画面には取得日時と店舗カレンダーへのリンクを併記します。手動更新は Actions の「Run workflow」から実行できます。

```sh
node --check site.js
node --check schedule.js
git diff --check
```

## 店舗情報の参照先

- [店舗公式X](https://x.com/iwashi_poker)
- [11月19日のリング料金と店舗情報](https://pokerfans.jp/events/2502461?_lang=ja)
- [11月19日の大会・料金・参加予約](https://pokerfans.jp/events/2524820?_lang=ja)

FVと初めての方向けの写真には提供映像を使用しています。リングゲームのチップ写真は [Leo_Visions / Unsplash](https://unsplash.com/photos/red-and-green-poker-chips-on-a-green-felt-table-o7Y-sUEf5-I) の作品です。
