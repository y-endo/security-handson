const express = require("express");
const crypto = require("crypto");
const api = require("./routes/api");

const app = express();
const port = 3000;

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use("/api", api);

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

// サーバを起動する
app.listen(port, () => {
  console.log(`Server i running on http://localhost${port}`);
});
