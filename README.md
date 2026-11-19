# Poker House いわし赤坂 来店ガイド

GitHub Pages で配信する静的サイトです。ローカルでは次のコマンドで起動し、http://127.0.0.1:8011/ を開きます。

```sh
python3 -m http.server 8011 --bind 127.0.0.1
```

## 大会日程

`python3 scripts/update-calendar.py` で[店舗が公開しているPokerFansカレンダー](https://pokerfans.jp/clubs/6134?_lang=ja)から日程を取得し、`schedule.json` に書き出します。初回受付締切は明記された時刻だけを採用します。再参加の締切は各イベントの案内を参照してください。来店ガイドは日本時間で本日と近日を表示します。

GitHub Actions の `Publish visitor guide` がメインブランチへの反映時と4時間おきに取得・公開します。取得や検査が失敗した場合は公開済みの内容を維持します。画面には取得日時と店舗カレンダーへのリンクを併記します。手動更新は Actions の「Run workflow」から実行できます。

```sh
node --check schedule.js
git diff --check
```

## 店舗情報の参照先

- [店舗公式X](https://x.com/iwashi_poker)
- [11月19日のリング料金と店舗情報](https://pokerfans.jp/events/2502461?_lang=ja)
- [11月19日の大会・料金・参加予約](https://pokerfans.jp/events/2524820?_lang=ja)

トップページは提供素材のポーカー映像の静止画を使っています。初めての方向けの写真は [Leo_Visions / Unsplash](https://unsplash.com/photos/red-and-green-poker-chips-on-a-green-felt-table-o7Y-sUEf5-I) の作品です。
