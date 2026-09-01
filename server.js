const path = require("path");
const express = require("express");
const QRCode = require("qrcode");

const app = express();
const PORT = process.env.PORT || 3000;

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, "public")));

// Servir os assets da biblioteca de remoção de fundo (bundle do navegador)
app.use(
  "/vendor/imgly",
  express.static(path.join(__dirname, "node_modules/@imgly/background-removal"))
);
app.use(
  "/vendor/onnx",
  express.static(path.join(__dirname, "node_modules/onnxruntime-web/dist"))
);

app.use(express.json());

/**
 * Endpoint principal de geração de QR Code.
 * Aceita GET ou POST com parâmetros:
 *  - text: conteúdo a ser codificado (obrigatório)
 *  - format: "png" | "svg" (padrão: png)
 *  - size:  largura/altura em px (padrão: 512)
 *  - margin: margem em módulos (padrão: 4)
 *  - errorCorrection: "L" | "M" | "Q" | "H" (padrão: M)
 *  - color.dark / color.light: cores em formato hex (ex.: #000000)
 *  - download: se "true", força o cabeçalho Content-Disposition
 */
app.all("/api/qr", async (req, res) => {
  try {
    const {
      text,
      format = "png",
      size = 512,
      margin = 4,
      errorCorrection = "M",
      download,
    } = { ...req.query, ...req.body };

    // As cores podem vir como objeto aninhado ({ color: { dark } })
    // ou como chaves planas com ponto ("color.dark", "color.light").
    const colorDark = req.body?.color?.dark ?? req.query?.["color.dark"] ?? req.body?.["color.dark"];
    const colorLight =
      req.body?.color?.light ?? req.query?.["color.light"] ?? req.body?.["color.light"];

    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: "O parâmetro 'text' é obrigatório." });
    }

    const normalizedFormat = String(format).toLowerCase() === "svg" ? "svg" : "png";
    const opts = {
      errorCorrectionLevel: ["L", "M", "Q", "H"].includes(errorCorrection)
        ? errorCorrection
        : "M",
      margin: Math.max(0, Math.min(20, Number(margin) || 4)),
      width: Number(size) || 512,
      color: {
        dark: colorDark || "#000000",
        light: colorLight || "#ffffff",
      },
    };

    let body;
    let contentType;

    if (normalizedFormat === "svg") {
      body = await QRCode.toString(text, { ...opts, type: "svg" });
      contentType = "image/svg+xml; charset=utf-8";
    } else {
      body = await QRCode.toBuffer(text, { ...opts, type: "png" });
      contentType = "image/png";
    }

    if (String(download).toLowerCase() === "true") {
      const ext = normalizedFormat;
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="qrcode.${ext}"`
      );
    }

    res.setHeader("Content-Type", contentType);
    res.send(body);
  } catch (err) {
    res.status(500).json({ error: "Falha ao gerar o QR Code.", details: err.message });
  }
});

// Rota de healthcheck
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// No Vercel (serverless), o app é exportado; local, sobe o servidor normalmente.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✔ Gerador de QR Code rodando em http://localhost:${PORT}`);
  });
}

module.exports = app;