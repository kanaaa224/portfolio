## 🖥️ 自宅サーバー

### 概要・用途

・自作アプリケーションのホスティング  
・WebAPIのテスト、公開  
・ゲームサーバーの運用（友人・家族とのプレイ用）  
・学習、検証環境としての活用

[アドレス: ponzu.server-on.net](//ponzu.server-on.net)

### 技術スタック・構成

・ハードウェア  
ASRock DeskMini A300 | AMD Athlon 200GE | DDR4-2666 8GB x2 | 120GB SSD

・ソフトウェア/ミドルウェア  
Windows 11 Server | Apache / Nginx | Docker Compose | GitHub Actions | Node.js / FastAPI / PHP / Vue.js

・セキュリティ  
Let's Encrypt による SSL/TLS 証明書の自動更新 | IPS/IDS、WAF

・ネットワーク  
グローバルIP + 無料 DDNS | ルーターのポート開放によるサービス公開（HTTP/HTTPS、SSH など）

・インフラ  
au 光回線 接続