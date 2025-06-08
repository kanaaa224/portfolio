## Webブラウザで動作するイコライザーと音場シミュレーションの開発

### 概要・用途

開発中の音楽ストリーミングアプリの内部システムで使用するためのものとして制作しました。

サウンドファイルを解析し、リアルタイムでイコライザーや音場シミュレーション処理を行えるオーディオプレイヤーです。  
最新の WebAudio API を使用しており、以前開発時に使用した ScriptProcessorNode よりも安定したパフォーマンスを実現しています。

[ソースコード（GitHub）](https://github.com/kanaaa224/web-apps)  
[Webブラウザで実行できるデモ](https://kanaaa224.github.io/web-apps/)

### 技術スタック・構成

・フレームワーク  
Vue.js / Vuetify

・使用技術  
WebAudio API

・開発環境  
Docker | Visual Studio Code | Chrome DevTools