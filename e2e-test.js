const puppeteer = require("puppeteer-core");

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = "http://localhost:3000/mockup.html";

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: "new",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  await page.setViewport({ width: 1500, height: 1100 });

  await page.goto(BASE, { waitUntil: "networkidle2", timeout: 60000 });
  await page.waitForSelector("#stage");

  // 1) Canvas redimensionado (640x1280)
  const canvas = await page.evaluate(() => {
    const c = document.getElementById("stage");
    return { w: c.width, h: c.height };
  });
  console.log("CANVAS:", JSON.stringify(canvas));

  // 2) Aplicar imagem ao telefone (demo) via upload primário
  await page.evaluate(async () => {
    const c = document.createElement("canvas");
    c.width = 800; c.height = 600;
    const x = c.getContext("2d");
    const g = x.createLinearGradient(0, 0, 800, 600);
    g.addColorStop(0, "#3b82f6"); g.addColorStop(1, "#ec4899");
    x.fillStyle = g; x.fillRect(0, 0, 800, 600);
    x.fillStyle = "#fff"; x.fillRect(360, 100, 80, 400);
    const blob = await new Promise((r) => c.toBlob(r, "image/png"));
    const file = new File([blob], "shot.png", { type: "image/png" });
    const input = document.getElementById("file");
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    input.dispatchEvent(new Event("change"));
  });
  await new Promise((r) => setTimeout(r, 600));

  // 3) Adicionar texto e verificar que aparece na lista de camadas
  await page.click("#btn-add-text");
  const layerCountAfterText = await page.evaluate(() => document.querySelectorAll(".layer-item").length);
  console.log("LAYER_COUNT_AFTER_TEXT:", layerCountAfterText);

  // 4) Mudar fundo para cor sólida e validar pixel no canvas
  await page.evaluate(() => {
    const sel = document.getElementById("bg-type");
    sel.value = "solid";
    sel.dispatchEvent(new Event("change"));
    const c = document.getElementById("bg-color");
    c.value = "#ff0000";
    c.dispatchEvent(new Event("input"));
  });
  await new Promise((r) => setTimeout(r, 200));
  const bgPx = await page.evaluate(() => {
    const c = document.getElementById("stage");
    return Array.from(c.getContext("2d").getImageData(8, 8, 1, 1).data.slice(0, 3));
  });
  console.log("BACKDROP_RGB:", JSON.stringify(bgPx));

  // 5) Adicionar segunda forma (círculo) e mudar estilo do telefone selecionado via propriedades
  await page.click("#btn-add-shape");
  await page.evaluate(async () => {
    // seleciona o telefone: primeiro item da lista estáz no topo; clica no 2º (demophone)
    const items = document.querySelectorAll(".layer-item");
    const phone = Array.from(items).find((i) => i.textContent.includes("Telefone"));
    if (phone) phone.click();
    await new Promise((r) => setTimeout(r, 200));
    // mudar estilo para "gold" via select [data-k="style"]
    const sel = document.querySelector('[data-k="style"]');
    if (sel) { sel.value = "gold"; sel.dispatchEvent(new Event("change")); }
  });
  await new Promise((r) => setTimeout(r, 300));
  const styleApplied = await page.evaluate(() => {
    const sel = document.querySelector('[data-k="style"]');
    return sel ? sel.value : "no-select";
  });
  console.log("PHONE_STYLE:", styleApplied);

  // 6) Download via interceptação do blob
  const dlInfo = await page.evaluate(async () => {
    const origCreate = URL.createObjectURL.bind(URL);
    const origRevoke = URL.revokeObjectURL.bind(URL);
    let captured = null;
    URL.createObjectURL = (b) => { captured = b; return origCreate(b); };
    URL.revokeObjectURL = () => {};
    document.getElementById("btn-download").click();
    await new Promise((r) => setTimeout(r, 900));
    URL.createObjectURL = origCreate;
    URL.revokeObjectURL = origRevoke;
    if (!captured) return { err: "nenhum blob" };
    const buf = await captured.arrayBuffer();
    const bytes = new Uint8Array(buf);
    const sig = Array.from(bytes.slice(0, 8)).map((x) => x.toString(16).padStart(2, "0")).join("");
    const w = ((bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19]) >>> 0;
    const h = ((bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23]) >>> 0;
    return { bytes: buf.byteLength, sig, w, h };
  });
  console.log("DOWNLOAD:", JSON.stringify(dlInfo));

  console.log("PAGE_ERRORS:", errors.length ? JSON.stringify(errors) : "none");
  await browser.close();
})().catch((e) => {
  console.error("TEST_FAILED", e && e.stack ? e.stack : e);
  process.exit(1);
});