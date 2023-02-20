# フロントエンド開発のためのセキュリティ入門 〜知らなかったでは済まされない脆弱性対策の必須知識〜
## メモ
### 同一オリジンポリシー（Same-Origin Policy）による保護
- canvas要素にクロスオリジンの画像を読み込んでいると、getImageDataなどでデータを取得できなくなる（昔やらかしたのを思い出した、、、）
  - 画像取得元のサーバがCORSを許可しているなら可能
  - JSでImageオブジェクトにcrossOriginを設定する or imgタグにcrossorigin属性を設定してCanvasから参照するなど
- iframe内のデータ取得は同一オリジンなら可、クロスオリジンは不可
### CORS（Cross-Origin Resources Sharing）
- Access-Control-Allow-Originに複数のオリジンを指定することはできないが、ワイルドカードですべてのオリジンを許可することはできる
  - ホワイトリスト形式で複数オリジンを許可する方法もある。
    - リクエストのオリジンに合わせて動的にHTTPヘッダを変える
    - 動的にHTTPヘッダの値を変更できない場合や、どこからでもアクセス可能な公開APIでもない限りワイルドカードの指定は避けるべき。
- Cookieを含むリクエストを送信する場合、サーバー側がCORSの設定でクロスオリジンのリクエストを許可する必要があり、Access-Control-Allow-Originはワイルドカードではなく明示的にオリジンを指定する必要がある。
### プロセス分離によるサイドチャネル攻撃の対策
- 「サイドチャネル攻撃」：CPUやメモリなどのハードウェアの特性を悪用した攻撃。
  - サイドチャネル攻撃のSpectreという攻撃手法が2018年に見つかり、Spectreで使われていたJSのAPI「SharedArrayBuffer」が制限されたりした。
  - 次の3つの仕組みをレスポンスヘッダで有効にすると、SharedArrayBufferなどの制限された機能を使うことができる。
    - Cross-Origin Resource Policy（CORP）
    - Cross-Origin Embedder Policy（COEP）
    - Cross-Origin Opener Policy（COOP）