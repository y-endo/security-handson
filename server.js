const express = require("express");
const crypto = require("crypto");
const api = require("./routes/api");
const csrf = require("./routes/csrf");

const app = express();
const port = 3000;

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use("/api", api);
app.use("/csrf", csrf);

app.get("/", (req, res, next) => {
  res.end("Top Page");
});

app.get("/csp", (req, res) => {
  // CSPサンプル
  const nonceValue = crypto.randomBytes(16).toString("base64");
  res.header(
    "Content-Security-Policy",
    `script-src 'nonce-${nonceValue}' 'strict-dynamic'; object-src 'none'; base-uri 'none'; require-trusted-types-for 'script';`
  );

  res.render("csp", { nonce: nonceValue });
});

// フォームの内容を解析してreq.bodyへ格納する
app.use(express.urlencoded({ extended: true }));

app.post('/signup', (req, res) => {
  console.log(req.body);
  res.send('アカウント作成登録が完了しました');
})

// サーバを起動する
app.listen(port, () => {
  console.log(`Server i running on http://localhost${port}`);
});
