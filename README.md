# フロントエンド開発のためのセキュリティ入門 〜知らなかったでは済まされない脆弱性対策の必須知識〜
## メモ
### 同一オリジンポリシー（Same-Origin Policy）による保護
- canvas要素にクロスオリジンの画像を読み込んでいると、getImageDataなどでデータを取得できなくなる（昔やらかしたのを思い出した、、、）
  - 画像取得元のサーバがCORSを許可しているなら可能
  - JSでImageオブジェクトにcrossOriginを設定する or imgタグにcrossorigin属性を設定してCanvasから参照するなど
- iframe内のデータ取得は同一オリジンなら可、クロスオリジンは不可
### CORS（Cross-Origin Resources Sharing）
オリジン間リソース共有、fetchとか非同期通信でクロスオリジンの通信が禁止されたりするいつものやつ。  
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
### XSS
#### 大きく3種類のXSSがある
- 反射型XSS（Reflected XSS）: サーバーサイドのコード不備で発生
- 蓄積型XSS（Stored XSS）: サーバーサイドのコード不備で発生
- DOM-based XSS: フロントエンドサイドのコード不備で発生
#### DOM-based XSSはJavaScriptによるDOM操作が原因で発生するXSS
- ユーザー等が入力した値をHTMLに出力する時に発生する。
  - HTMLタグを特殊文字に置き換える（サニタイズ）をちゃんとすること
    - HTMLの属性に値を反映する場合は、クォーテーションがないとサニタイズしても意味がない。  
      属性の値はクォーテーションで囲む（NG: src={{value}}, OK: src="{{value}}"）  
      また、クォーテーションのサニタイズも忘れずにやること。  
      入力値にクォーテーションが含まれている場合は、元のクォーテーションを閉じた状態にされてしまう。
    - aタグのhref属性に値を入れる場合はjavascript:も除外する。
  - DOM操作のメソッドやプロパティを工夫する
    - innerHTMLなどを使わずに適切な実装方法を選ぶ
      - createElementで要素を作成し、入力値はテキストノードとして作成した要素に追加、作成した要素をappendChildで追加（出力）するなど
- サニタイズのおすすめライブラリ「DOMPurify」
  - 開発が盛んで新しい脆弱性への対応も早い。Cure53というセキュリティの専門企業が開発している。
- 現在（2023/2月）開発中のJS APIに「Sanitizer API」がある（一部ブラウザのみ有効）
  - SanitizerAPIとElement.setHTML()を組み合わせて、XSS対策を施したHTML挿入が可能になる
#### Content Security Policy（CSP）
CSPは許可していないJavaScriptの実行やリソースの読み込みをブロックする。  
サーバーサイドでContent-Security-Policyヘッダをレスポンスに含めると有効化される。  
レスポンスヘッダだけではなく、HTMLに<meta>でCSPの設定を埋め込むことも可能だが、HTTPヘッダのCSPが優先され、一部使えない設定がある。  
```
<!-- *.example.com のscriptは許可する -->
<meta http-equiv="Content-Security-Policy" content="script-src *.example.com">
```

**nonce-source**  
インラインスクリプトを許可するためにランダムな値を生成して、ポリシーとscriptタグに含める。  
```
Content-Security-Policy: script-src 'nonce-2726c7f26c'
```
```
<script nonce="2726c7f26c">
  const inline = 1;
  // …
</script>
```
### その他の受動的攻撃（CSRF、クリックジャッキング、オープンリダイレクト）
#### CSRF（Cross-Site Request Forgeries）
- Double Submit Cookie
  - サーバーサイドのCookieとフロントエンドサイドのトークン用Cookieを合わせてCSRFを対策する一種の方法
  - サーバーがCookie（トークン）を発行して、クライアント側のJSで該当のCookieを取得する。
    そのCookieをPOSTで一緒に送信して、サーバー側が受け取ったCookieが発行したものと一致しているか確認する。
#### クリックジャッキング
透明なiframeをページ上に配置して、ユーザーに押してはいけないもの押させたりする。  
X-Frame-Optionsなどのヘッダでiframeを使ったページの埋め込み制御をして対策する。  
#### オープンリダイレクト
Webアプリケーション内にあるリダイレクト機能を利用して攻撃者のページに強制的に遷移させる攻撃。  
例えば https://example.com/?url=/test/ のようにGETパラメータのurlのページにリダイレクトする処理があった場合、  
?url=https://attack.com/ のような攻撃用ページのurlが設定されてしまう。  
遷移先のURLが許可しているものかチェックするホワイトリスト的な処理を入れて対策を行う。  
### 認証・認可
inputのpattern属性に正規表現を入れてバリデーションができる。  
ブラウザ標準のエラーメッセージにはtitle属性で設定した値が表示される。  
JSのConstraint Validation APIを使うと、バリデーションエラー時に表示するエラーメッセージをカスタマイズできる。  
```
password.setCustomValidity('パスワードには8文字以上の英数字を入力してください');
```
### ライブラリを狙ったセキュリティリスク
ライブラリに脆弱性が埋め込まれる経路。  
- OSSの場合プルリクエストをちゃんとレビューせずにマージしてしまう
- アカウントの乗っ取り、実際にESLint開発者のnpmアカウントが乗っ取られて悪意のあるコードをnpmに公開されてしまった
- 依存関係の継承による脆弱性の流入
  - 例えば、AがBを依存していて、BがCを依存している場合、AがCを依存しているときにCの脆弱性がAにも影響する
- CDN上のコンテンツの改ざん
#### 脆弱性を検知するツールやサービス
- npm audit コマンド。
  - npm installでローカルにインストールしたパッケージの脆弱性を検知する。
  - --productionオプションを付けて実行すると --save-dev でインストールしたnpmパッケージは検査しない
- npm audit fix コマンド
  - npm auditで検知した脆弱性を修正するためのパッチを自動で適用する
#### メンテナンスが持続されているライブラリを利用する
- Renovate
  - 利用しているライブラリに新しいバージョンの更新がないかを検索して、あった場合はバージョンアップのプルリクエストを作成してくれる。