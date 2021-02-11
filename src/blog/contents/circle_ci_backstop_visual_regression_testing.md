<!-- 
title: CircleCI + BackstopJS (Puppeteer) でビジュアルリグレッションテストを継続的に監視する
date: 2019-11-15T00:00:00+09:00
draft: false
description: description
-->
# Links
https://qiita.com/silverbirder/items/35d8109faf649808ccb9

CircleCIとBackstopJSを組み合わせて、『継続的にWebページの視覚的な変化を監視するツール』を作成しました。
https://github.com/Silver-birder/silver-enigma

![backstopjs](https://res.cloudinary.com/silverbirder/image/upload/v1573651959/backstopjs/backstopjs.png)

# Motivation
Webアプリを運用する上で、システム改善は継続的に行われます。
そのシステム改善をリリースする前に、入念なテスト（ユニットテスト、インテグレーションテスト、E2Eテスト）をパスする必要があります。しかし、Webアプリの規模が大きくなるにつれて、**意図せずデグレ**が発生してしまう可能性が大きくなります。
そのデグレを気づくのが『社内部指摘』なのか『エンドユーザからのお問い合わせ』からなのか分かりません。
そこで、**Webアプリを定期的に監視すること**で、予想外なデグレッションを早期に発見できる仕組みが欲しくなりました。

必要とする要件は、次のとおりです。

* スケジューリング実行可能
  * 無料で使えること
* わかりやすい視覚的変化のレポート
* カスタマイズしやすい監視方法

ここから、CircleCI + BackstopJS(Puppeteer)という組み合わせが生まれました。

# Usage
次の手順で構築できます。

```bash:環境
~ $ node -v
v12.9.1
```

1. backstop.jsonに監視したいURLを設定
2. CircleCIに必要な環境変数を設定([README.md](https://github.com/Silver-birder/silver-enigma/blob/master/README.md)参照)
3. CircleCIでJobを実行し、Artifactsにあるレポートを閲覧

Puppeteerを使ってWebアプリへリクエストしています。
そのため、『Javascriptを無効にする』や『Cookieを設定する』といったニーズに対応できます。

# Conclusion
このツールにより、外部からWebアプリの変化を早期に発見できるようになりました。
ただし、リクエストするスケジューリング間隔には十分にお気をつけください。
リクエストをしすぎると、対象Webアプリの負荷が高まってしまいます。
