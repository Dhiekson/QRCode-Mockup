import { removeBackground } from "@imgly/background-removal";

(() => {
  // =========================================================
  // Constantes e helpers de elementos
  // =========================================================
  const BASE_W = 640;
  const BASE_H = 1280;
  const OUT_W = 1280;
  const OUT_H = 2560;
  const TWO_PI = Math.PI * 2;

  const $ = (id) => document.getElementById(id);
  const stage = $("stage");
  const layerList = $("layer-list");
  const propsPanel = $("props");
  const status = $("status");
  const hint = $("hint");

  const GRAD_PRESETS = {
    default: { c0: "#0f172a", c1: "#1e3a8a", c2: "#155e75" },
    sunset: { c0: "#7f1d1d", c1: "#c2410c", c2: "#fbbf24" },
    ocean: { c0: "#0c4a6e", c1: "#0e7490", c2: "#22d3ee" },
    candy: { c0: "#831843", c1: "#db2777", c2: "#f472b6" },
    neon: { c0: "#171717", c1: "#312e81", c2: "#22d3ee" },
    gold: { c0: "#451a03", c1: "#b45309", c2: "#fde68a" },
    radial: { c0: "#1e1b4b", c1: "#6d28d9", c2: "#4c1d95" },
  };

  const PHONE_STYLES = {
    dark: { name: "Preto", body: "#0b0b0e", edge: "#000000", rail: "#1e1e22", screen: "#0f172a" },
    silver: { name: "Prata", body: "#c6cad2", edge: "#7f858f", rail: "#e2e5ea", screen: "#111827" },
    gold: { name: "Dourado", body: "#d9b988", edge: "#a6804f", rail: "#e8cfae", screen: "#111827" },
    blue: { name: "Azul", body: "#3c4b6d", edge: "#27334d", rail: "#5d6f96", screen: "#111827" },
    red: { name: "Vermelho", body: "#9f1239", edge: "#6b0727", rail: "#e11d48", screen: "#111827" },
    green: { name: "Verde", body: "#14532d", edge: "#052e16", rail: "#22c55e", screen: "#111827" },
    purple: { name: "Roxo", body: "#4c1d95", edge: "#2e1065", rail: "#8b5cf6", screen: "#111827" },
    clear: { name: "Translúcido", body: "rgba(255,255,255,0.22)", edge: "rgba(255,255,255,0.55)", rail: "rgba(255,255,255,0.4)", screen: "#0f172a" },
  };

  const FONTS = [
    "Segoe UI",
    "Arial",
    "Georgia",
    "Impact",
    "Courier New",
    "Trebuchet MS",
    "Times New Roman",
    "Verdana",
    "Poppins",
    "Montserrat",
    "Roboto",
    "Open Sans",
    "Lato",
    "Inter",
    "Oswald",
    "Raleway",
    "Playfair Display",
    "Merriweather",
    "Bebas Neue",
    "Nunito",
    "Quicksand",
    "Rubik",
    "Lobster",
    "Pacifico",
    "Dancing Script",
    "Righteous",
    "Anton",
    "Press Start 2P",
  ];

  // Modelos de aparelho: proporção, cantos, moldura e câmera
  const PHONE_MODELS = {
    iphone15: { name: "iPhone 15 Pro (Dynamic Island)", ratio: 2.06, corner: 0.16, bezel: 0.028, camera: "island" },
    iphone14: { name: "iPhone 14 (Notch)", ratio: 2.05, corner: 0.15, bezel: 0.03, camera: "notch" },
    iphonese: { name: "iPhone SE (com botão)", ratio: 1.95, corner: 0.09, bezel: 0.065, camera: "home" },
    galaxyS: { name: "Samsung Galaxy S", ratio: 2.14, corner: 0.13, bezel: 0.022, camera: "punch" },
    galaxyA: { name: "Samsung Galaxy A", ratio: 2.08, corner: 0.10, bezel: 0.035, camera: "punch" },
    pixel: { name: "Google Pixel", ratio: 2.1, corner: 0.14, bezel: 0.025, camera: "punch" },
    android: { name: "Android genérico", ratio: 2.0, corner: 0.1, bezel: 0.035, camera: "punch" },
    xiaomi: { name: "Xiaomi / Redmi", ratio: 2.05, corner: 0.11, bezel: 0.03, camera: "punchCenter" },
    ipad: { name: "iPad (Tablet)", ratio: 1.38, corner: 0.07, bezel: 0.04, camera: "punch" },
    galaxyTab: { name: "Galaxy Tab (Tablet)", ratio: 1.45, corner: 0.06, bezel: 0.035, camera: "punch" },
    fold: { name: "Galaxy Fold (aberto)", ratio: 1.28, corner: 0.05, bezel: 0.025, camera: "punch" },
  };
  const DEFAULT_MODEL = "iphone15";

  // Modelos de mockup: composições prontas aplicadas ao telefone
  const MOCKUP_TEMPLATES = {
    custom: { name: "Personalizado (atual)" },
    isometric: {
      name: "Isometric Smartphone Mockup",
      rot: 45, perspective: true, perspAmt: 0.58, scale: 0.92,
      sy: 0.46, shadow: true, shadowBlur: 55, shadowOffset: 45,
      depth: false, backdropPreset: "radial",
    },
    showcase: {
      name: "App Showcase",
      rot: 0, perspective: false, scale: 1.18,
      sy: 0.52, shadow: true, shadowBlur: 70, shadowOffset: 25,
      depth: false, backdropPreset: "ocean",
    },
    three_d: {
      name: "3D Smartphone Mockup",
      rot: 10, perspective: true, perspAmt: 0.82, scale: 1.05,
      sy: 0.5, shadow: true, shadowBlur: 50, shadowOffset: 35,
      depth: true, depthX: -12, depthY: 18, backdropPreset: "neon",
    },
    floating: {
      name: "Floating Smartphone Mockup",
      rot: -8, perspective: true, perspAmt: 0.94, scale: 1.1,
      sy: 0.44, shadow: true, shadowBlur: 90, shadowOffset: 110,
      depth: false, backdropPreset: "sunset",
    },
  };

  // =========================================================
  // Estado
  // =========================================================
  const state = {
    layers: [],
    backdrop: { type: "gradient", preset: "default", color: "#111827", color2: "#1e3a8a", image: null },
    selectedId: null,
    editMode: null,
    drawMode: false,
    draft: null,
    nextId: 1,
  };

  const KIND_LABEL = { phone: "Telefone", text: "Texto", shape: "Forma", image: "Imagem", freeform: "Forma livre" };
  const KIND_ICON = { phone: "📱", text: "🅣", shape: "●", image: "🖼", freeform: "✏️" };

  // =========================================================
  // Utilitários
  // =========================================================
  function setStatus(msg, kind = "") {
    status.textContent = msg || "";
    status.className = "status" + (kind ? " is-" + kind : "");
  }

  function uid() {
    return "c" + state.nextId++;
  }

  function loadIntoImg(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Falha ao carregar a imagem."));
      img.src = src;
    });
  }

  function fileToDataUrl(f) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(f);
    });
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function applyFilter(ctx, f, scale) {
    if (!f) return;
    const k = scale == null ? getF() : scale;
    const parts = [];
    if (f.brightness != null) parts.push(`brightness(${f.brightness})`);
    if (f.contrast != null) parts.push(`contrast(${f.contrast})`);
    if (f.saturate != null) parts.push(`saturate(${f.saturate})`);
    if (f.grayscale) parts.push("grayscale(1)");
    if (f.sepia) parts.push("sepia(1)");
    if (f.invert) parts.push("invert(1)");
    if (f.blur && f.blur > 0) parts.push(`blur(${f.blur * k}px)`);
    if (parts.length) ctx.filter = parts.join(" ");
  }

  function layerById(id) {
    return state.layers.find((l) => l.id === id);
  }

  function getF(_ctx, W) {
    // fator de escala entre as unidades do quadro (frame.w) e o canvas atual.
    // W = largura do canvas que está sendo desenhado (preview ou download 2×)
    return (W == null ? stage.width : W) / frame.w;
  }
  const frame = { w: BASE_W, h: BASE_H };
// =========================================================
  // Desenho do fundo
  // =========================================================
  function drawBackdrop(ctx, W, H) {
    const b = state.backdrop;
    const f = getF(null, W);
    if (b.type === "transparent") return;
    if (b.type === "solid") {
      ctx.fillStyle = b.color;
      ctx.fillRect(0, 0, W, H);
      return;
    }
    if (b.type === "image" && b.image && b.image.img) {
      const img = b.image.img;
      const ir = img.naturalWidth / img.naturalHeight;
      const cr = W / H;
      const zoom = b.image.zoom == null ? 1 : b.image.zoom;
      let dw = W, dh = H;
      if (b.image.cover === "contain") {
        if (ir > cr) dh = W / ir; else dw = H * ir;
      } else {
        if (ir > cr) dw = H * ir; else dh = W / ir;
      }
      dw *= zoom;
      dh *= zoom;
      const ox = (W - dw) / 2 + (b.image.panX || 0) * f;
      const oy = (H - dh) / 2 + (b.image.panY || 0) * f;
      ctx.save();
      ctx.globalAlpha = b.image.opacity == null ? 1 : b.image.opacity;
      if (b.image.blur) ctx.filter = `blur(${b.image.blur * f}px)`;
      ctx.drawImage(img, ox, oy, dw, dh);
      ctx.filter = "none";
      ctx.restore();
      return;
    }
    // gradiente (padrão)
    const p = GRAD_PRESETS[b.preset] || GRAD_PRESETS.default;
    let g;
    if (b.preset === "radial") {
      g = ctx.createRadialGradient(W / 2, H * 0.4, 0, W / 2, H / 2, Math.max(W, H) * 0.8);
      g.addColorStop(0, p.c0);
      g.addColorStop(0.55, p.c1);
      g.addColorStop(1, p.c2);
    } else {
      g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, p.c0);
      g.addColorStop(0.5, p.c1);
      g.addColorStop(1, p.c2);
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  const BODY_BASE_FN = () => 0.4 * frame.w; // largura base p/ normalizar sombra/brilho
// =========================================================
  // Desenho de um telefone (inclinação, sombra, profundidade, translúcido)
  // =========================================================
  function drawPhone(ctx, layer, W, H) {
    const f = getF(null, W);
    const sx = layer.sx == null ? 0.5 : layer.sx;
    const sy = layer.sy == null ? 0.5 : layer.sy;
    ctx.save();
    ctx.translate(sx * W, sy * H);
    ctx.rotate((layer.rot || 0) * (Math.PI / 180));
    if (layer.perspective) {
      ctx.scale(1, layer.perspAmt == null ? 0.86 : layer.perspAmt);
    }
    ctx.scale(layer.scale == null ? 1 : layer.scale, layer.scale == null ? 1 : layer.scale);

    const model = PHONE_MODELS[layer.model] || PHONE_MODELS[DEFAULT_MODEL];
    const w = W * 0.4;
    const h = w * model.ratio;
    const mx = -w / 2;
    const my = -h / 2;
    const corner = w * model.corner;
    const bezel = w * model.bezel;
    const pal = PHONE_STYLES[layer.style || "dark"] || PHONE_STYLES.dark;
    const wNorm = w / BODY_BASE_FN();

    // Sombra do corpo
    if (layer.shadow) {
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.65)";
      ctx.shadowBlur = (layer.shadowBlur == null ? 40 : layer.shadowBlur) * wNorm;
      ctx.shadowOffsetY = (layer.shadowOffset == null ? 30 : layer.shadowOffset) * wNorm;
      roundRectPath(ctx, mx, my, w, h, corner);
      ctx.fillStyle = "rgba(0,0,0,0.0001)";
      ctx.fill();
      ctx.restore();
    }

    // Profundidade: contorno extra deslocado
    if (layer.depth) {
      ctx.save();
      ctx.translate((layer.depthX == null ? -6 : layer.depthX) * f, (layer.depthY == null ? 10 : layer.depthY) * f);
      ctx.globalAlpha = 0.4;
      roundRectPath(ctx, mx, my, w, h, corner);
      ctx.fillStyle = pal.edge;
      ctx.fill();
      ctx.restore();
    }

    const isClear = layer.style === "clear";
    // Corpo principal
    roundRectPath(ctx, mx, my, w, h, corner);
    ctx.fillStyle = isClear ? "rgba(255,255,255,0.28)" : pal.body;
    ctx.fill();
    ctx.strokeStyle = pal.edge;
    ctx.lineWidth = Math.max(1, w * 0.006);
    ctx.stroke();

    // Reflexo no corpo
    const glint = ctx.createLinearGradient(mx, my, mx + w, my + h);
    glint.addColorStop(0, "rgba(255,255,255,0.16)");
    glint.addColorStop(0.5, "rgba(255,255,255,0)");
    glint.addColorStop(1, "rgba(0,0,0,0.10)");
    ctx.fillStyle = glint;
    roundRectPath(ctx, mx, my, w, h, corner);
    ctx.fill();

    // Trilho lateral
    ctx.fillStyle = pal.rail;
    roundRectPath(ctx, mx - bezel * 0.5, my + h * 0.16, bezel, h * 0.16, bezel / 2);
    ctx.fill();

    // Tela (clip)
    const sx0 = mx + bezel;
    const sy0 = my + bezel;
    const sw = w - bezel * 2;
    const sh = h - bezel * 2;
    ctx.save();
    roundRectPath(ctx, sx0, sy0, sw, sh, corner * 0.72);
    ctx.clip();

    if (layer.imgEl && layer.imgEl.naturalWidth > 0) {
      const irr = layer.imgEl.naturalWidth / layer.imgEl.naturalHeight;
      const scr = sw / sh;
      const zoom = layer.screenZoom == null ? 1 : layer.screenZoom;
      let dw, dh;
      if (irr > scr) { dh = sh; dw = sh * irr; } else { dw = sw; dh = sw / irr; }
      dw *= zoom;
      dh *= zoom;
      if (layer.contentFilter) applyFilter(ctx, layer.contentFilter, f);
      ctx.drawImage(layer.imgEl, sx0 + (sw - dw) / 2 + (layer.panX || 0) * f, sy0 + (sh - dh) / 2 + (layer.panY || 0) * f, dw, dh);
      ctx.filter = "none";
    } else {
      ctx.fillStyle = isClear ? "rgba(255,255,255,0.05)" : pal.screen;
      ctx.fillRect(sx0, sy0, sw, sh);
    }

    // Câmera / ilha de sensores, conforme o modelo
    const cam = model.camera;
    if (cam === "island") {
      const islandW = sw * 0.2;
      const islandH = sh * 0.02;
      ctx.beginPath();
      ctx.roundRect(sx0 + (sw - islandW) / 2, sy0 + sh * 0.014, islandW, islandH, islandH / 2);
      ctx.fillStyle = "#000";
      ctx.fill();
    } else if (cam === "notch") {
      const nw = sw * 0.32;
      const nh = sh * 0.028;
      ctx.beginPath();
      ctx.roundRect(sx0 + (sw - nw) / 2, sy0, nw, nh, [0, 0, nh / 2, nh / 2]);
      ctx.fillStyle = "#000";
      ctx.fill();
    } else if (cam === "punch" || cam === "punchCenter" || cam === "tabletCam") {
      const pr = Math.min(sw, sh) * 0.016;
      const px = cam === "punchCenter" ? sx0 + sw / 2 : sx0 + sw * 0.72;
      ctx.beginPath();
      ctx.arc(px, sy0 + sh * 0.035, pr, 0, TWO_PI);
      ctx.fillStyle = "#000";
      ctx.fill();
    } else if (cam === "home") {
      // alto-falante no topo + botão home embaixo
      const spW = sw * 0.28;
      const spH = sh * 0.008;
      ctx.beginPath();
      ctx.roundRect(sx0 + (sw - spW) / 2, sy0 + sh * 0.022, spW, spH, spH / 2);
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx0 + sw / 2, sy0 + sh - sh * 0.033, sh * 0.016, 0, TWO_PI);
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = Math.max(1, w * 0.005);
      ctx.stroke();
    }

    // Reflexo na tela
    const screenGlint = ctx.createLinearGradient(sx0, sy0, sx0, sy0 + sh);
    screenGlint.addColorStop(0, "rgba(255,255,255,0.12)");
    screenGlint.addColorStop(0.15, "rgba(255,255,255,0)");
    ctx.fillStyle = screenGlint;
    ctx.fillRect(sx0, sy0, sw, sh);

    ctx.restore(); // fim clip tela
    ctx.restore(); // fim transform do telefone
  }

  // =========================================================
  // Desenho de forma livre (trajeto desenhado pelo usuário)
  // =========================================================
  function drawFreeform(ctx, layer, W, H, opts) {
    const f = getF(null, W);
    const pts = layer.points || [];
    if (pts.length < 2) return;
    const closed = !!(layer.closed && (opts == null || opts.allowClose !== false));
    ctx.save();
    ctx.translate((layer.x || 0) * f, (layer.y || 0) * f);
    ctx.rotate((layer.rot || 0) * (Math.PI / 180));
    ctx.globalAlpha = layer.opacity == null ? 1 : layer.opacity;
    ctx.scale(layer.scale == null ? 1 : layer.scale, layer.scale == null ? 1 : layer.scale);
    if (layer.glow) {
      ctx.shadowColor = layer.glowColor || layer.color || "#22d3ee";
      ctx.shadowBlur = (layer.glowBlur == null ? 30 : layer.glowBlur) * f;
    }
    // caixa delimitadora local (para o gradiente)
    let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
    for (const p of pts) {
      if (p.x < minx) minx = p.x; if (p.x > maxx) maxx = p.x;
      if (p.y < miny) miny = p.y; if (p.y > maxy) maxy = p.y;
    }
    ctx.beginPath();
    ctx.moveTo(pts[0].x * f, pts[0].y * f);
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = ((pts[i].x + pts[i + 1].x) / 2) * f;
      const my = ((pts[i].y + pts[i + 1].y) / 2) * f;
      ctx.quadraticCurveTo(pts[i].x * f, pts[i].y * f, mx, my);
    }
    const last = pts[pts.length - 1];
    ctx.lineTo(last.x * f, last.y * f);
    if (closed) ctx.closePath();
    const wantFill = closed && layer.fill !== false;
    const wantLine = layer.line || !closed;
    if (wantFill) {
      let fill = layer.color || "#22d3ee";
      if (layer.gradient) {
        const g = ctx.createLinearGradient(minx * f, miny * f, maxx * f, maxy * f);
        g.addColorStop(0, layer.color || "#22d3ee");
        g.addColorStop(1, layer.color2 || "#3b82f6");
        fill = g;
      }
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (wantLine) {
      ctx.strokeStyle = layer.lineColor || layer.color || "#ffffff";
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.lineWidth = (layer.strokeW == null ? 4 : layer.strokeW) * f;
      ctx.stroke();
    }
    ctx.restore();
  }
// =========================================================
  // Desenho de texto
  // =========================================================
  // Fonte do texto (peso, itálico, família) — compartilhado entre canvas e bounds
  function textFont(layer, sizePx) {
    const weight = parseInt(layer.weight, 10) || (layer.bold ? 700 : 400);
    const it = layer.italic ? "italic " : "";
    return `${it}${weight} ${sizePx}px ${layer.font || "Arial"}, sans-serif`;
  }
  function textLines(layer) {
    let t = String(layer.text || "");
    if (layer.transform === "upper") t = t.toUpperCase();
    else if (layer.transform === "lower") t = t.toLowerCase();
    return t.split("\n");
  }

  function drawText(ctx, layer, W, H) {
    const f = getF(null, W);
    ctx.save();
    ctx.translate(layer.x * f, layer.y * f);
    ctx.rotate((layer.rot || 0) * (Math.PI / 180));
    ctx.globalAlpha = layer.opacity == null ? 1 : layer.opacity;
    ctx.scale(layer.scale == null ? 1 : layer.scale, layer.scale == null ? 1 : layer.scale);
    const size = (layer.size == null ? 48 : layer.size) * f;
    ctx.font = textFont(layer, size);
    if ("letterSpacing" in ctx) ctx.letterSpacing = ((layer.letterSpacing || 0) * f) + "px";
    ctx.textBaseline = "middle";
    const align = layer.align || "center";
    ctx.textAlign = align;
    const lines = textLines(layer);
    const lineH = size * (layer.lineHeight == null ? 1.15 : layer.lineHeight);
    const startY = -((lines.length - 1) / 2) * lineH;

    // Faixa de fundo atrás do texto
    if (layer.bgBox) {
      const pad = (layer.bgPad == null ? 14 : layer.bgPad) * f;
      let maxW = 0;
      lines.forEach((ln) => { maxW = Math.max(maxW, ctx.measureText(ln).width); });
      const bw = maxW + pad * 2;
      const bh = lines.length * lineH + pad * 2;
      const bx = align === "left" ? -pad : align === "right" ? -bw + pad : -bw / 2;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(bx, -bh / 2 + pad * 0.1, bw, bh, (layer.bgRadius == null ? 12 : layer.bgRadius) * f);
      ctx.fillStyle = layer.bgColor || "rgba(0,0,0,0.55)";
      ctx.fill();
      ctx.restore();
    }

    if (layer.shadow) {
      ctx.shadowColor = layer.shadowColor || "rgba(0,0,0,0.6)";
      ctx.shadowBlur = (layer.shadowBlur == null ? 8 : layer.shadowBlur) * f;
      ctx.shadowOffsetY = 2 * f;
    }
    // Preenchimento: cor sólida ou gradiente vertical
    if (layer.grad) {
      const g = ctx.createLinearGradient(0, startY - size / 2, 0, startY + (lines.length - 1) * lineH + size / 2);
      g.addColorStop(0, layer.color || "#ffffff");
      g.addColorStop(1, layer.color2 || "#22d3ee");
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = layer.color || "#ffffff";
    }
    lines.forEach((line, i) => {
      const y = startY + i * lineH;
      if (layer.stroke && (layer.strokeW == null ? 4 : layer.strokeW) > 0) {
        ctx.lineWidth = (layer.strokeW == null ? 4 : layer.strokeW) * f;
        ctx.strokeStyle = layer.strokeColor || "#000000";
        ctx.lineJoin = "round";
        ctx.strokeText(line, 0, y);
      }
      ctx.fillText(line, 0, y);
    });
    ctx.restore();
  }

  // =========================================================
  // Desenho de formas (círculos/quadrado/anéis com gradiente e brilho)
  // =========================================================
  function drawShape(ctx, layer, W, H) {
    const f = getF(null, W);
    ctx.save();
    ctx.translate(layer.x * f, layer.y * f);
    ctx.rotate((layer.rot || 0) * (Math.PI / 180));
    ctx.globalAlpha = layer.opacity == null ? 1 : layer.opacity;
    ctx.scale(layer.scale == null ? 1 : layer.scale, layer.scale == null ? 1 : layer.scale);
    const r = (layer.radius == null ? 60 : layer.radius) * f;
    if (layer.glow) {
      ctx.shadowColor = layer.glowColor || layer.color || "#22d3ee";
      ctx.shadowBlur = (layer.glowBlur == null ? 40 : layer.glowBlur) * f;
    }
    const drawPath = (shape) => {
      ctx.beginPath();
      if (shape === "ring" || shape === "circle") {
        ctx.arc(0, 0, r, 0, TWO_PI);
      } else if (shape === "square") {
        ctx.rect(-r, -r, r * 2, r * 2);
      } else if (shape === "rounded") {
        ctx.roundRect(-r, -r, r * 2, r * 2, r * 0.25);
      } else if (shape === "pill") {
        ctx.roundRect(-r, -r * 0.5, r * 2, r, r / 2);
      } else if (shape === "triangle") {
        ctx.moveTo(0, -r);
        ctx.lineTo(r, r * 0.85);
        ctx.lineTo(-r, r * 0.85);
        ctx.closePath();
      } else if (shape === "star") {
        for (let i = 0; i < 10; i++) {
          const rad = i % 2 === 0 ? r : r * 0.45;
          const a = (Math.PI / 5) * i - Math.PI / 2;
          const x = Math.cos(a) * rad, y = Math.sin(a) * rad;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
      } else if (shape === "hexagon") {
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i - Math.PI / 2;
          const x = Math.cos(a) * r, y = Math.sin(a) * r;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
      } else if (shape === "diamond") {
        ctx.moveTo(0, -r);
        ctx.lineTo(r * 0.7, 0);
        ctx.lineTo(0, r);
        ctx.lineTo(-r * 0.7, 0);
        ctx.closePath();
      } else if (shape === "arrow") {
        ctx.moveTo(-r, -r * 0.35);
        ctx.lineTo(r * 0.25, -r * 0.35);
        ctx.lineTo(r * 0.25, -r * 0.75);
        ctx.lineTo(r, 0);
        ctx.lineTo(r * 0.25, r * 0.75);
        ctx.lineTo(r * 0.25, r * 0.35);
        ctx.lineTo(-r, r * 0.35);
        ctx.closePath();
      } else if (shape === "heart") {
        ctx.moveTo(0, r * 0.75);
        ctx.bezierCurveTo(-r * 1.3, -r * 0.15, -r * 0.55, -r * 1.05, 0, -r * 0.35);
        ctx.bezierCurveTo(r * 0.55, -r * 1.05, r * 1.3, -r * 0.15, 0, r * 0.75);
        ctx.closePath();
      } else if (shape === "blob") {
        ctx.moveTo(0, -r);
        ctx.bezierCurveTo(r * 1.1, -r * 0.9, r * 0.95, r * 0.85, r * 0.1, r);
        ctx.bezierCurveTo(-r * 0.95, r * 1.05, -r * 1.15, -r * 0.8, 0, -r);
        ctx.closePath();
      }
    };
    const fillOrStroke = () => {
      let fill = layer.color || "#22d3ee";
      if (layer.gradient) {
        const g = ctx.createLinearGradient(-r, -r, r, r);
        g.addColorStop(0, layer.color || "#22d3ee");
        g.addColorStop(1, layer.color2 || "#3b82f6");
        fill = g;
      }
      ctx.fillStyle = fill;
      ctx.fill();
      if (layer.outline) {
        ctx.strokeStyle = layer.outlineColor || layer.color2 || "#ffffff";
        ctx.lineWidth = (layer.strokeW == null ? 8 : layer.strokeW) * f;
        ctx.stroke();
      }
    };
    if (layer.shape === "ring") {
      ctx.strokeStyle = layer.color || "#22d3ee";
      ctx.lineWidth = (layer.strokeW == null ? 12 : layer.strokeW) * f;
      drawPath("ring");
      ctx.stroke();
    } else if (layer.shape === "line") {
      // linha: apenas traço (com gradiente opcional)
      let stroke = layer.color || "#22d3ee";
      if (layer.gradient) {
        const g = ctx.createLinearGradient(-r, 0, r, 0);
        g.addColorStop(0, layer.color || "#22d3ee");
        g.addColorStop(1, layer.color2 || "#3b82f6");
        stroke = g;
      }
      ctx.strokeStyle = stroke;
      ctx.lineWidth = (layer.strokeW == null ? 10 : layer.strokeW) * f;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-r, 0);
      ctx.lineTo(r, 0);
      ctx.stroke();
    } else {
      drawPath(layer.shape || "circle");
      fillOrStroke();
    }
    ctx.restore();
  }

  // =========================================================
  // Desenho de imagem (elemento flutuante com filtros e máscara)
  // =========================================================
  function drawImageLayer(ctx, layer, W, H) {
    const f = getF(null, W);
    if (!layer.imgEl) return;
    ctx.save();
    ctx.translate(layer.x * f, layer.y * f);
    ctx.rotate((layer.rot || 0) * (Math.PI / 180));
    ctx.globalAlpha = layer.opacity == null ? 1 : layer.opacity;
    ctx.scale(layer.scale == null ? 1 : layer.scale, layer.scale == null ? 1 : layer.scale);
    if (layer.glow) {
      ctx.shadowColor = layer.glowColor || "rgba(0,0,0,0.5)";
      ctx.shadowBlur = (layer.glowBlur == null ? 30 : layer.glowBlur) * f;
    }
    if (layer.filters) applyFilter(ctx, layer.filters, f);
    const bw = (layer.blendW == null ? 300 : layer.blendW) * f;
    const bh = (layer.blendH == null ? 380 : layer.blendH) * f;
    const mask = layer.mask || "none";
    if (mask !== "none") {
      ctx.beginPath();
      if (mask === "circle") ctx.arc(0, 0, Math.min(bw, bh) / 2, 0, TWO_PI);
      else if (mask === "rounded") roundRectPath(ctx, -bw / 2, -bh / 2, bw, bh, bh * 0.15);
      else ctx.rect(-bw / 2, -bh / 2, bw, bh);
      ctx.clip();
    }
    if (!layer.imgEl || !layer.imgEl.naturalWidth) return;
    const irr = layer.imgEl.naturalWidth / layer.imgEl.naturalHeight;
    const want = bw / bh;
    const zoom = layer.imgZoom == null ? 1 : layer.imgZoom;
    let dw, dh;
    if (irr > want) { dh = bh; dw = bh * irr; } else { dw = bw; dh = bw / irr; }
    dw *= zoom;
    dh *= zoom;
    ctx.drawImage(layer.imgEl, -dw / 2, -dh / 2, dw, dh);
    ctx.filter = "none";
    ctx.restore();
  }
// =========================================================
  // Render mestre
  // =========================================================
  function renderAt(ctx, W, H, drawSelection) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    drawBackdrop(ctx, W, H);
    for (const layer of state.layers) {
      if (!layer.visible) continue;
      switch (layer.kind) {
        case "phone": drawPhone(ctx, layer, W, H); break;
        case "text": drawText(ctx, layer, W, H); break;
        case "shape": drawShape(ctx, layer, W, H); break;
        case "freeform": drawFreeform(ctx, layer, W, H); break;
        case "image": drawImageLayer(ctx, layer, W, H); break;
      }
    }
    if (state.draft) drawFreeform(ctx, state.draft, W, H, { allowClose: false });
    if (drawSelection) drawSelectionBox(ctx, W, H);
    if (drawSelection) drawEditOverlay(ctx, W, H);
  }

  function drawEditOverlay(ctx, W, H) {
    const l = editLayer();
    if (!l || l.kind !== "phone" || !l.imgEl) return;
    const f = getF(null, W);
    const b = boundsOf(l, W, H);
    if (!b) return;
    ctx.save();
    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 2.5;
    ctx.setLineDash([10, 7]);
    ctx.strokeRect(b.x * f - 4, b.y * f - 4, b.w * f + 8, b.h * f + 8);
    ctx.setLineDash([]);
    ctx.fillStyle = "#22d3ee";
    const label = "✂ arraste a imagem · rolinha = zoom";
    ctx.font = "600 13px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    const lx = (b.x + b.w / 2) * f;
    const ly = b.y * f - 8;
    const tw = ctx.measureText(label).width + 16;
    ctx.fillStyle = "rgba(15,23,42,0.85)";
    roundRectPath(ctx, lx - tw / 2, ly - 20, tw, 22, 6);
    ctx.fill();
    ctx.fillStyle = "#22d3ee";
    ctx.fillText(label, lx, ly);
    ctx.restore();
  }

  function render() {
    if (stage.width !== frame.w) stage.width = frame.w;
    if (stage.height !== frame.h) stage.height = frame.h;
    const ctx = stage.getContext("2d");
    renderAt(ctx, frame.w, frame.h, true);
  }

  function drawSelectionBox(ctx, W, H) {
    const layer = layerById(state.selectedId);
    if (!layer || !layer.visible) return;
    const f = getF(null, W);
    ctx.save();
    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    const b = boundsOf(layer, W, H);
    if (b) {
      ctx.strokeRect(b.x * f, b.y * f, b.w * f, b.h * f);
    }
    ctx.setLineDash([]);
    ctx.restore();
  }

  function boundsOf(layer, W, H) {
    switch (layer.kind) {
      case "phone": {
        const model = PHONE_MODELS[layer.model] || PHONE_MODELS[DEFAULT_MODEL];
        const w = W * 0.4 * (layer.scale == null ? 1 : layer.scale);
        const h = w * model.ratio;
        const cxp = (layer.sx == null ? 0.5 : layer.sx) * W;
        const cyp = (layer.sy == null ? 0.5 : layer.sy) * H;
        return { x: cxp - w / 2, y: cyp - h / 2, w, h };
      }
      case "text": {
        const c = stage.getContext("2d");
        const sz = layer.size == null ? 48 : layer.size;
        c.font = textFont(layer, sz);
        if ("letterSpacing" in c) c.letterSpacing = (layer.letterSpacing || 0) + "px";
        const lines = textLines(layer);
        let maxW = 0;
        lines.forEach((l) => { maxW = Math.max(maxW, c.measureText(l).width); });
        const hh = lines.length * sz * (layer.lineHeight == null ? 1.15 : layer.lineHeight);
        const s = layer.scale == null ? 1 : layer.scale;
        return { x: layer.x - (maxW * s) / 2, y: layer.y - (hh * s) / 2, w: maxW * s, h: hh * s };
      }
      case "shape": {
        const r = (layer.radius == null ? 60 : layer.radius) * (layer.scale == null ? 1 : layer.scale);
        return { x: layer.x - r, y: layer.y - r, w: r * 2, h: r * 2 };
      }
      case "freeform": {
        const pts = layer.points || [];
        if (!pts.length) return null;
        const s = layer.scale == null ? 1 : layer.scale;
        let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
        for (const p of pts) {
          if (p.x < minx) minx = p.x; if (p.x > maxx) maxx = p.x;
          if (p.y < miny) miny = p.y; if (p.y > maxy) maxy = p.y;
        }
        return { x: layer.x + minx * s, y: layer.y + miny * s, w: (maxx - minx) * s, h: (maxy - miny) * s };
      }
      case "image": {
        const s = layer.scale == null ? 1 : layer.scale;
        const bw = (layer.blendW == null ? 300 : layer.blendW) * s;
        const bh = (layer.blendH == null ? 380 : layer.blendH) * s;
        return { x: layer.x - bw / 2, y: layer.y - bh / 2, w: bw, h: bh };
      }
    }
    return null;
  }

  // =========================================================
  // Hit test na tela (seleção por clique)
  // =========================================================
  function hitTest(px, py) {
    // itera de cima (última camada) para baixo
    for (let i = state.layers.length - 1; i >= 0; i--) {
      const l = state.layers[i];
      if (!l.visible) continue;
      const b = boundsOf(l, frame.w, frame.h);
      if (!b) continue;
      if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) {
        return l.id;
      }
    }
    return null;
  }
// =========================================================
  // Criação de camadas
  // =========================================================
  function addPhone(opts) {
    const layer = {
      id: uid(), kind: "phone",
      model: DEFAULT_MODEL,
      sx: 0.5, sy: 0.52, scale: 1, rot: 0, opacity: 1,
      style: "dark", shadow: true, shadowBlur: 40, shadowOffset: 30,
      depth: false, depthX: -6, depthY: 10,
      perspective: false, perspAmt: 0.86,
      template: "custom",
      imgEl: (opts && opts.img) || null,
      contentFilter: null, panX: 0, panY: 0,
      visible: true,
    };
    state.layers.push(layer);
    return layer;
  }

  // Aplica um modelo de mockup (composição pronta) à camada de telefone
  function applyTemplate(l, key) {
    const t = MOCKUP_TEMPLATES[key];
    if (!l || !t || key === "custom") { l.template = key; return; }
    ["rot", "perspective", "perspAmt", "scale", "sy", "shadow", "shadowBlur", "shadowOffset", "depth"].forEach((k) => {
      if (t[k] != null) l[k] = t[k];
    });
    if (t.depthX != null) l.depthX = t.depthX;
    if (t.depthY != null) l.depthY = t.depthY;
    l.template = key;
    if (t.backdropPreset && state.backdrop.type === "gradient") {
      state.backdrop.preset = t.backdropPreset;
    }
  }

  function addText() {
    state.layers.push({
      id: uid(), kind: "text", text: "Seu texto aqui",
      x: frame.w / 2, y: frame.h * 0.18, scale: 1, rot: 0, opacity: 1,
      size: 52, color: "#ffffff", font: "Arial", bold: true, align: "center",
      weight: "700", italic: false, letterSpacing: 0, lineHeight: 1.15, transform: "none",
      grad: false, color2: "#22d3ee", stroke: false, strokeColor: "#000000", strokeW: 4,
      bgBox: false, bgColor: "rgba(0,0,0,0.55)", bgPad: 14, bgRadius: 12,
      shadow: true, shadowColor: "rgba(0,0,0,0.7)", shadowBlur: 8,
      visible: true,
    });
  }

  function addShape(shape) {
    state.layers.push({
      id: uid(), kind: "shape", shape: shape || "circle",
      x: frame.w * 0.22, y: frame.h * 0.2, scale: 1, rot: 0, opacity: 0.9,
      radius: 55, color: "#22d3ee", color2: "#3b82f6",
      gradient: true, glow: true, glowBlur: 40, strokeW: shape === "line" ? 10 : 12,
      visible: true,
    });
  }

  // Lista de formas do seletor (ícone, rótulo)
  const SHAPE_CHOICES = [
    ["square", "▢", "Quadrado"],
    ["circle", "○", "Círculo"],
    ["triangle", "△", "Triângulo"],
    ["diamond", "◆", "Losango"],
    ["star", "★", "Estrela"],
    ["arrow", "➜", "Seta"],
    ["line", "─", "Linha"],
    ["free", "✏️", "Forma Livre"],
    ["ring", "◎", "Anel"],
    ["rounded", "▣", "Quadrado arredondado"],
    ["pill", "▬", "Pílula"],
    ["hexagon", "⬡", "Hexágono"],
    ["heart", "♥", "Coração"],
    ["blob", "🫧", "Blob orgânico"],
  ];

  function addImageLayer(imgEl) {
    state.layers.push({
      id: uid(), kind: "image",
      x: frame.w * 0.5, y: frame.h * 0.28, scale: 0.5, rot: 0, opacity: 1,
      imgEl, blendW: 320, blendH: 400, mask: "none",
      glow: false, glowBlur: 30, glowColor: "rgba(0,0,0,0.5)",
      filters: null, visible: true,
    });
  }

  // =========================================================
  // Lista de camadas (UI)
  // =========================================================
  function renderLayerList() {
    layerList.innerHTML = "";
    // mostrar de cima (última) para baixo
    for (let i = state.layers.length - 1; i >= 0; i--) {
      const l = state.layers[i];
      const row = document.createElement("div");
      row.className = "layer-item" + (l.id === state.selectedId ? " is-selected" : "");
      row.innerHTML = `
        <span class="layer-item__icon">${KIND_ICON[l.kind]}</span>
        <span class="layer-item__name">${KIND_LABEL[l.kind]}</span>
        <button class="layer-item__btn" data-act="up" title="Para frente">⬆</button>
        <button class="layer-item__btn" data-act="down" title="Para trás">⬇</button>
        <button class="layer-item__btn" data-act="del" title="Excluir">✕</button>`;
      row.addEventListener("click", (e) => {
        const act = e.target.getAttribute("data-act");
        if (act) {
          e.stopPropagation();
          handleLayerAction(act, l.id);
          return;
        }
        selectLayer(l.id);
      });
      layerList.appendChild(row);
    }
  }

  function handleLayerAction(act, id) {
    const idx = state.layers.findIndex((l) => l.id === id);
    if (idx < 0) return;
    if (act === "del") {
      state.layers.splice(idx, 1);
      if (state.selectedId === id) state.selectedId = null;
      if (state.editMode === id) setEditMode(null);
      refresh();
      renderProps();
    } else if (act === "up" && idx < state.layers.length - 1) {
      const [l] = state.layers.splice(idx, 1);
      state.layers.splice(idx + 1, 0, l);
      renderLayerList();
      render();
    } else if (act === "down" && idx > 0) {
      const [l] = state.layers.splice(idx, 1);
      state.layers.splice(idx - 1, 0, l);
      renderLayerList();
      render();
    }
  }

  function selectLayer(id) {
    state.selectedId = id;
    renderLayerList();
    render();
    renderProps();
  }
  function editLayer() {
    return state.editMode ? layerById(state.editMode) : null;
  }
  function setEditMode(id) {
    const l = id ? layerById(id) : null;
    state.editMode = l && l.kind === "phone" && l.imgEl ? id : null;
    const on = !!state.editMode;
    stage.classList.toggle("is-editing", on);
    const stagePanel = stage.closest(".stage");
    if (stagePanel) stagePanel.classList.toggle("is-editing", on);
    if (on) setStatus("Modo de edição da imagem: arraste para mover/cortar, rolinha para zoom. Esc para sair.");
    else setStatus("");
    render();
  }
  function refresh() {
    renderLayerList();
    render();
  }
// =========================================================
  // Painel de propriedades (gerado dinamicamente)
  // =========================================================
  function prText(label, key, onChange, type = "text") {
    const v = (selected() || {})[key] || "";
    return `<div class="props-field"><label>${label}</label>
      <input type="${type}" data-k="${key}" class="pr-${type}" value="${esc(String(v))}"></div>`;
  }

  function prRange(label, key, min, max, step, onCur) {
    const l = selected();
    const v = l ? l[key] : 0;
    return `<div class="props-field"><label>${label} <output>${fmtNum(v)}${onCur || ""}</output></label>
      <input type="range" min="${min}" max="${max}" step="${step}" value="${v == null ? 0 : v}" data-k="${key}" data-live="1"></div>`;
  }

  function prColor(label, key) {
    const l = selected();
    const v = l ? l[key] || "#ffffff" : "#ffffff";
    return `<div class="props-field"><label>${label}</label>
      <input type="color" data-k="${key}" class="pr-color" value="${v}"></div>`;
  }

  function prSelect(label, key, options) {
    const l = selected();
    const opts = options.map(([val, nm]) => {
      const sel = l && l[key] === val ? " selected" : "";
      return `<option value="${val}"${sel}>${nm}</option>`;
    }).join("");
    return `<div class="props-field"><label>${label}</label>
      <select data-k="${key}">${opts}</select></div>`;
  }

  // Seletor de fontes: cada opção é renderizada na própria fonte e o texto
  // do mockup muda na hora conforme a fonte é escolhida
  function prFontSelect(label, key) {
    const l = selected();
    const cur = l ? l[key] || "Arial" : "Arial";
    const opts = FONTS.map((f) => {
      const sel = cur === f ? " selected" : "";
      return `<option value="${esc(f)}"${sel} style="font-family:'${esc(f)}'">${esc(f)}</option>`;
    }).join("");
    return `<div class="props-field"><label>${label}</label>
      <select data-k="${key}" style="font-family:'${esc(cur)}'">${opts}</select></div>`;
  }

  function prCheck(label, key) {
    const l = selected();
    const ch = l && l[key] ? " checked" : "";
    return `<div class="props-field"><label class="toggle"><input type="checkbox" data-k="${key}"${ch}><span>${label}</span></label></div>`;
  }

  function prRadio(label, key, options) {
    const l = selected();
    const radios = options.map(([val, nm]) => {
      const ch = l && (l[key] || "none") === val ? " checked" : "";
      return `<label><input type="radio" name="r-${key}" data-k="${key}" value="${val}"${ch}>${nm}</label>`;
    });
    return `<div class="props-field"><label>${label}</label><div class="radio-btns">${radios.join("")}</div></div>`;
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function fmtNum(n) {
    if (n == null) return "0";
    return Math.round(n * 100) / 100;
  }
function selected() {
    return layerById(state.selectedId);
  }

  function renderProps() {
    const l = selected();
    if (!l) {
      propsPanel.innerHTML = `<p class="props__placeholder">Selecione uma camada na lista ou na tela para editar.</p>`;
      return;
    }
    const c = []; // campos comuns
    const sp = []; // específicos

    // ----- comuns para texto/shape/imagem telefone -----
    if (l.kind === "phone") {
      sp.push(prSelect("Modelo de mockup", "template", Object.entries(MOCKUP_TEMPLATES).map(([k, v]) => [k, v.name])));
      sp.push(prSelect("Modelo do aparelho", "model", Object.entries(PHONE_MODELS).map(([k, v]) => [k, v.name])));
      sp.push(prSelect("Cor do aparelho", "style", Object.entries(PHONE_STYLES).map(([k, v]) => [k, v.name])));
      sp.push(prCheck("Sombra", "shadow"));
      sp.push(prRange("Difusão da sombra", "shadowBlur", 0, 120, 1));
      sp.push(prRange("Queda da sombra", "shadowOffset", 0, 80, 1));
      sp.push(prCheck("Profundidade (efeito 3D de empilhado)", "depth"));
      sp.push(prRange("Offset // profundidade X", "depthX", -40, 40, 1));
      sp.push(prRange("Offset // profundidade Y", "depthY", 0, 60, 1));
      sp.push(prCheck("Inclinar (perspectiva)", "perspective"));
      sp.push(prRange("Ângulo de inclinação", "perspAmt", 0.5, 1, 0.01));
      sp.push(prRange("Inclinação da tela (rotação)", "rot", -40, 40, 1, "°"));
      if (l.imgEl) {
        sp.push(prCheck("Remover o fundo da imagem", "__removeBg"));
        sp.push(`<div class="props-field"><label>Filtros da imagem</label>
          <div class="chip-row">
            <button class="chip" data-f="bright" data-fdir="+">Brilho+</button>
            <button class="chip" data-f="bright" data-fdir="-">Brilho-</button>
            <button class="chip" data-f="contrast" data-fdir="+">Contraste</button>
            <button class="chip" data-f="saturate" data-fdir="+">Saturação</button>
            <button class="chip" data-f="gray">P/B</button>
            <button class="chip" data-f="reset">Limpar</button>
          </div></div>`);
        sp.push(`<div class="props-divider"></div>`);
        sp.push(`<div class="props-field"><label>Edição da imagem da tela</label></div>`);
        sp.push(prRange("Zoom da imagem", "screenZoom", 0.5, 3, 0.01, "×"));
        sp.push(prRange("Mover imagem X", "panX", -300, 300, 1));
        sp.push(prRange("Mover imagem Y", "panY", -300, 300, 1));
        sp.push(`<div class="props-field">
          <button class="btn btn--small btn--ghost" data-screenreset="1">↺ Resetar posição/zoom da imagem</button></div>`);
        sp.push(`<div class="props-field">
          <button class="btn btn--small ${state.editMode === l.id ? "btn--accent" : "btn--ghost"}" data-editimg="1">✂ Editar imagem no mockup</button></div>`);
      }
      sp.push(`<div class="props-field"><label>Trocar imagem da tela</label>
        <button class="btn btn--small btn--ghost" data-sel-file="1">⬆ Escolher imagem</button>
        <input type="file" accept="image/*" hidden data-file-input /></div>`);
    } else if (l.kind === "text") {
      sp.push(`<div class="props-field"><label>Conteúdo</label>
        <textarea data-k="text" data-live="1">${esc(l.text)}</textarea></div>`);
      sp.push(prFontSelect("Fonte", "font"));
      sp.push(prSelect("Peso", "weight", [
        ["400", "Normal"], ["500", "Médio"], ["600", "Semi-bold"],
        ["700", "Bold"], ["800", "Extra-bold"], ["900", "Black"],
      ]));
      sp.push(prRange("Tamanho", "size", 12, 200, 1));
      sp.push(prColor("Cor", "color"));
      sp.push(prRadio("Alinhamento", "align", [["left", "E"], ["center", "C"], ["right", "D"]]));
      sp.push(prRadio("Caixa", "transform", [["none", "Aa"], ["upper", "AA"], ["lower", "aa"]]));
      sp.push(prCheck("Itálico", "italic"));
      sp.push(prRange("Espaço entre letras", "letterSpacing", -10, 40, 1));
      sp.push(prRange("Altura da linha", "lineHeight", 0.8, 2.5, 0.05));
      sp.push(`<div class="props-divider"></div>`);
      sp.push(prCheck("Gradiente no texto", "grad"));
      sp.push(prColor("Cor 2 do gradiente", "color2"));
      sp.push(prCheck("Contorno", "stroke"));
      sp.push(prColor("Cor do contorno", "strokeColor"));
      sp.push(prRange("Espessura do contorno", "strokeW", 1, 30, 1));
      sp.push(`<div class="props-divider"></div>`);
      sp.push(prCheck("Faixa de fundo", "bgBox"));
      sp.push(prColor("Cor do fundo", "bgColor"));
      sp.push(prRange("Espaço interno", "bgPad", 0, 80, 1));
      sp.push(prRange("Cantos arredondados", "bgRadius", 0, 80, 1));
      sp.push(`<div class="props-divider"></div>`);
      sp.push(prCheck("Sombra no texto", "shadow"));
      sp.push(prColor("Cor da sombra", "shadowColor"));
    } else if (l.kind === "shape") {
      sp.push(prSelect("Forma", "shape", [
        ["circle", "Círculo"], ["ring", "Anel"], ["square", "Quadrado"], ["rounded", "Quadrado arredondado"],
        ["pill", "Pílula"], ["triangle", "Triângulo"], ["star", "Estrela"], ["hexagon", "Hexágono"],
        ["diamond", "Losango"], ["heart", "Coração"], ["blob", "Blob orgânico"],
        ["arrow", "Seta"], ["line", "Linha"],
      ]));
      sp.push(prRange("Raio", "radius", 10, 320, 1));
      sp.push(prCheck("Gradiente", "gradient"));
      sp.push(prColor("Cor 1", "color"));
      sp.push(prColor("Cor 2", "color2"));
      sp.push(prCheck("Contorno", "outline"));
      sp.push(prColor("Cor do contorno", "outlineColor"));
      sp.push(prRange("Espessura do contorno", "strokeW", 2, 60, 1));
      sp.push(prCheck("Brilho (glow)", "glow"));
      sp.push(prRange("Intensidade do brilho", "glowBlur", 0, 160, 1));
      if (l.shape === "ring") sp.push(prRange("Espessura do anel", "strokeW", 4, 60, 1));
    } else if (l.kind === "freeform") {
      sp.push(prCheck("Fechar forma (preenchível)", "closed"));
      sp.push(prCheck("Preencher", "fill"));
      sp.push(prColor("Cor 1", "color"));
      sp.push(prCheck("Gradiente", "gradient"));
      sp.push(prColor("Cor 2", "color2"));
      sp.push(prCheck("Linha / contorno", "line"));
      sp.push(prColor("Cor da linha", "lineColor"));
      sp.push(prRange("Espessura da linha", "strokeW", 1, 60, 1));
      sp.push(prCheck("Brilho (glow)", "glow"));
      sp.push(prRange("Intensidade do brilho", "glowBlur", 0, 160, 1));
      sp.push(`<div class="props-field"><label>✏️ Para desenhar outra forma, use “● Forma” → “Forma Livre”</label></div>`);
    } else if (l.kind === "image") {
      sp.push(prSelect("Máscara / formato", "mask", [
        ["none", "Retângulo"], ["rounded", "Arredondado"], ["circle", "Círculo"],
      ]));
      sp.push(prRange("Largura", "blendW", 60, 700, 1));
      sp.push(prRange("Altura", "blendH", 60, 900, 1));
      sp.push(prRange("Zoom interno da imagem", "imgZoom", 0.2, 3, 0.01, "×"));
      sp.push(prCheck("Brilho (halo)", "glow"));
      sp.push(prRange("Intensidade do brilho", "glowBlur", 0, 160, 1));
      sp.push(`<div class="props-field"><label>Filtros</label>
        <div class="chip-row">
          <button class="chip" data-f="bright" data-fdir="+">Brilho</button>
          <button class="chip" data-f="contrast" data-fdir="+">Contraste</button>
          <button class="chip" data-f="saturate" data-fdir="+">Saturação</button>
          <button class="chip" data-f="gray">P/B</button>
          <button class="chip" data-f="sepia">Sépia</button>
          <button class="chip" data-f="reset">Limpar</button>
        </div></div>`);
    }

    // ------ comuns: transformações ------
    c.push(prRange("Rotação", "rot", -180, 180, 1, "°"));
    c.push(prRange("Escala", "scale", 0.2, 3, 0.01, "×"));
    if (l.kind === "phone") {
      c.push(prRange("Posição X (%)", "sx", 0, 1, 0.01));
      c.push(prRange("Posição Y (%)", "sy", 0, 1, 0.01));
    } else {
      c.push(prRange("Posição X", "x", 20, frame.w - 20, 1));
      c.push(prRange("Posição Y", "y", 40, frame.h - 40, 1));
    }
    if (l.kind !== "phone") c.push(prRange("Opacidade", "opacity", 0.05, 1, 0.01));
    c.push(prCheck("Visível", "visible"));
    c.push(`<div class="props-actions">
      <button class="btn btn--small btn--ghost" data-dup="1">Duplicar</button>
      <button class="btn btn--small btn--ghost" data-del="1">Excluir</button>
    </div>`);

    propsPanel.innerHTML = sp.join("") + `<div class="props-divider"></div>` + c.join("");
    bindProps();
  }
// =========================================================
  // Handler de campos de propriedades
  // =========================================================
  function bindProps() {
    propsPanel.querySelectorAll("[data-k]").forEach((el) => {
      const key = el.dataset.k;
      const mutate = () => {
        const l = selected();
        if (!l) return false;
        if (key === "template" && el.tagName === "SELECT") {
          applyTemplate(l, el.value);
          return true;
        }
        if (el.type === "radio") {
          if (el.checked) l[key] = el.value;
          return true;
        }
        if (el.type === "checkbox") {
          l[key] = el.checked;
        } else if (el.type === "number" || el.type === "range") {
          l[key] = parseFloat(el.value);
        } else if (el.tagName === "SELECT") {
          l[key] = el.value;
        } else if (el.tagName === "TEXTAREA") {
          l.text = el.value;
        } else if (key === "opacity") {
          l[key] = parseFloat(el.value);
        } else {
          l[key] = el.value;
        }
        return true;
      };
      // durante a digitação/arrasto: só atualiza o canvas e a lista;
      // o painel de propriedades NÃO é reconstruído para não perder o foco
      el.addEventListener("input", () => {
        if (!mutate()) return;
        render();
        renderLayerList();
      });
      // ao concluir (blur/select): reconstrói o painel (campos condicionais)
      el.addEventListener("change", () => {
        if (!mutate()) return;
        render();
        renderLayerList();
        renderProps();
      });
    });

    propsPanel.querySelectorAll("[data-screenreset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const l = selected();
        if (!l) return;
        l.screenZoom = 1;
        l.panX = 0;
        l.panY = 0;
        render();
        renderProps();
        setStatus("Posição e zoom da imagem da tela restaurados.");
      });
    });

    propsPanel.querySelectorAll("[data-editimg]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const l = selected();
        if (!l || !l.imgEl) return;
        setEditMode(state.editMode === l.id ? null : l.id);
        renderProps();
      });
    });

    propsPanel.querySelectorAll("[data-f]").forEach((chip) => {
      chip.addEventListener("click", (e) => {
        const l = selected();
        if (!l) return;
        const f = chip.dataset.f;
        const dir = chip.dataset.fdir || "";
        if (!l.contentFilter) l.contentFilter = { brightness: 1, contrast: 1, saturate: 1, grayscale: false, sepia: false };
        if (f === "bright") {
          l.contentFilter.brightness = Math.max(0.2, Math.min(3, (l.contentFilter.brightness || 1) + (dir === "-" ? -0.2 : 0.2)));
        } else if (f === "contrast") {
          l.contentFilter.contrast = Math.max(0.2, Math.min(3, (l.contentFilter.contrast || 1) + 0.2));
        } else if (f === "saturate") {
          l.contentFilter.saturate = Math.max(0, Math.min(5, (l.contentFilter.saturate || 1) + 0.5));
        } else if (f === "gray") {
          l.contentFilter.grayscale = !l.contentFilter.grayscale;
        } else if (f === "sepia") {
          l.contentFilter.sepia = !l.contentFilter.sepia;
        } else if (f === "reset") {
          l.contentFilter = null;
        }
        render();
        renderProps();
      });
    });

    propsPanel.querySelectorAll("[data-sel-file]").forEach((b) => {
      b.addEventListener("click", () => {
        const input = b.nextElementSibling;
        if (input) input.click();
      });
    });
    propsPanel.querySelectorAll("[data-file-input]").forEach((input) => {
      input.addEventListener("change", async () => {
        const l = selected();
        if (!l || !input.files[0]) return;
        const url = await fileToDataUrl(input.files[0]);
        const img = await loadIntoImg(url);
        l.imgEl = img;
        l._srcFile = input.files[0];
        l.screenZoom = 1;
        l.panX = 0;
        l.panY = 0;
        input.value = "";
        render();
        renderProps();
      });
    });

    propsPanel.querySelectorAll("[data-del]").forEach((b) => {
      b.addEventListener("click", () => {
        if (state.selectedId) handleLayerAction("del", state.selectedId);
      });
    });
    propsPanel.querySelectorAll("[data-dup]").forEach((b) => {
      b.addEventListener("click", () => {
        const l = selected();
        if (!l) return;
        // cópia profunda que preserva imgEl (elemento de imagem) e _srcFile
        // (JSON.stringify destruiria esses objetos e quebraria a renderização)
        const copy = { ...l };
        if (l.contentFilter) copy.contentFilter = { ...l.contentFilter };
        if (l.points) copy.points = l.points.map((p) => ({ ...p }));
        if (l.imgEl) copy.imgEl = l.imgEl; // referencia o mesmo elemento de imagem
        copy.id = uid();
        // desloca levemente para não nascer exatamente sobre o original
        if (l.kind === "phone") {
          copy.sx = Math.min(0.95, (copy.sx || 0.5) + 0.06);
          copy.sy = Math.min(0.95, (copy.sy || 0.5) + 0.04);
        } else {
          copy.x = Math.min(frame.w - 10, (copy.x || 0) + 24);
          copy.y = Math.min(frame.h - 20, (copy.y || 0) + 24);
        }
        state.layers.push(copy);
        if (state.editMode === l.id) state.editMode = null;
        selectLayer(copy.id);
        setStatus("Camada duplicada.");
      });
    });

    // botão especial "remover fundo" da imagem do telefone
    const rb = propsPanel.querySelector('[data-k="__removeBg"], [data-removebg]');
    // (o checkbox *_removeBg é tratado por bindRemoveBg abaixo)
    const rmCb = propsPanel.querySelector('[data-k="__removeBg"]');
    if (rmCb) {
      rmCb.addEventListener("change", async () => {
        const l = selected();
        if (!l || !l.imgEl) return;
        if (!l._srcFile) return;
        rmCb.disabled = true;
        setStatus("Removendo fundo…", "loading");
        try {
          const outBlob = await removeBackground(l._srcFile, {
            progress: (k, cur, tot) => {
              if (cur && tot) setStatus(`Removendo fundo… ${Math.round((cur / tot) * 100)}%`, "loading");
            },
          });
          l.imgEl = await loadIntoImg(URL.createObjectURL(outBlob));
          l.contentFilter = null;
          render();
          renderProps();
          setStatus("Fundo removido do telefone.");
        } catch (err) {
          setStatus("Erro ao remover fundo: " + (err && err.message ? err.message : err), "error");
        } finally {
          rmCb.disabled = false;
        }
      });
    }
  }
// =========================================================
  // Interações no canvas
  // =========================================================
  let dragging = false;
  let dragMode = "move";
  let lastX = 0;
  let lastY = 0;
  let moved = false;

  function canvasCoords(e) {
    const rect = stage.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * frame.w,
      y: ((e.clientY - rect.top) / rect.height) * frame.h,
    };
  }

  stage.addEventListener("pointerdown", (e) => {
    if (hint && !hint.hidden) hint.hidden = false;
    const p = canvasCoords(e);
    if (state.drawMode) {
      // começa um traço de forma livre
      state.draft = {
        kind: "freeform", x: 0, y: 0, points: [p], closed: true,
        fill: true, gradient: false, color: "#22d3ee", color2: "#3b82f6",
        line: false, lineColor: "#ffffff", strokeW: 4, visible: true,
      };
      dragging = true;
      dragMode = "draw";
      try { stage.setPointerCapture(e.pointerId); } catch (_) {}
      return;
    }
    const el = editLayer();
    if (el && el.kind === "phone" && el.imgEl) {
      // modo de edição da imagem: arrastar move a imagem dentro da tela;
      // clicar fora do telefone sai do modo
      const b = boundsOf(el, frame.w, frame.h);
      const inside = b && p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h;
      if (!inside) {
        setEditMode(null);
        return;
      }
      selectLayer(el.id);
      dragging = true;
      dragMode = "imgpan";
      moved = false;
      lastX = e.clientX;
      lastY = e.clientY;
      try { stage.setPointerCapture(e.pointerId); } catch (_) {}
      return;
    }
    const hit = hitTest(p.x, p.y);
    if (hit) {
      selectLayer(hit);
      dragging = true;
      dragMode = "move";
      moved = false;
      lastX = e.clientX;
      lastY = e.clientY;
      try { stage.setPointerCapture(e.pointerId); } catch (_) {}
    } else {
      state.selectedId = null;
      renderLayerList();
      render();
      renderProps();
    }
  });

  stage.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    if (dragMode !== "draw" && !state.selectedId) return;
    const rect = stage.getBoundingClientRect();
    const k = frame.w / rect.width;
    const dx = (e.clientX - lastX) * k;
    const dy = (e.clientY - lastY) * k;
    lastX = e.clientX;
    lastY = e.clientY;
    if (Math.abs(dx) + Math.abs(dy) > 0.5) moved = true;
    if (dragMode === "draw") {
      // coleta pontos do traço (com distância mínima para suavizar)
      const p2 = canvasCoords(e);
      const pts = state.draft ? state.draft.points : null;
      if (pts) {
        const last = pts[pts.length - 1];
        if (Math.hypot(p2.x - last.x, p2.y - last.y) > 2) pts.push(p2);
        render();
      }
      return;
    }
    const l = layerById(state.selectedId);
    if (!l) return;
    if (dragMode === "imgpan" && l.kind === "phone") {
      // move a imagem dentro da tela (recorta estendendo o pan)
      l.panX = Math.max(-600, Math.min(600, (l.panX || 0) + dx / (l.scale || 1)));
      l.panY = Math.max(-600, Math.min(600, (l.panY || 0) + dy / (l.scale || 1)));
    } else if (l.kind === "phone") {
      l.sx = Math.max(0, Math.min(1, (l.sx || 0.5) + dx / frame.w));
      l.sy = Math.max(0, Math.min(1, (l.sy || 0.5) + dy / frame.h));
    } else {
      l.x = Math.max(10, Math.min(frame.w - 10, (l.x || 0) + dx));
      l.y = Math.max(20, Math.min(frame.h - 20, (l.y || 0) + dy));
    }
    render();
    renderLayerList();
  });

  ["pointerup", "pointercancel"].forEach((ev) =>
    stage.addEventListener(ev, () => {
      if (dragMode === "draw") {
        dragging = false;
        dragMode = "move";
        finishFreeDraw(ev === "pointercancel");
        return;
      }
      dragging = false;
      if (moved) renderProps();
    })
  );

  // Conclui o traço da forma livre e cria a camada
  function finishFreeDraw(cancelled) {
    const d = state.draft;
    state.draft = null;
    state.drawMode = false;
    stage.classList.remove("is-drawing");
    if (cancelled || !d || d.points.length < 2) {
      render();
      if (!cancelled) setStatus("");
      return;
    }
    // recentra os pontos na caixa delimitadora
    let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
    for (const p of d.points) {
      if (p.x < minx) minx = p.x; if (p.x > maxx) maxx = p.x;
      if (p.y < miny) miny = p.y; if (p.y > maxy) maxy = p.y;
    }
    const cx = (minx + maxx) / 2;
    const cy = (miny + maxy) / 2;
    // reutiliza o estilo da última forma livre, se houver
    const styleSrc = [...state.layers].reverse().find((l) => l.kind === "freeform") || {};
    const layer = {
      id: uid(), kind: "freeform",
      x: cx, y: cy,
      points: d.points.map((p) => ({ x: p.x - cx, y: p.y - cy })),
      scale: 1, rot: 0, opacity: 1, visible: true,
      closed: styleSrc.closed != null ? styleSrc.closed : true,
      fill: styleSrc.fill != null ? styleSrc.fill : true,
      gradient: !!styleSrc.gradient,
      color: styleSrc.color || "#22d3ee",
      color2: styleSrc.color2 || "#3b82f6",
      line: !!styleSrc.line,
      lineColor: styleSrc.lineColor || "#ffffff",
      strokeW: styleSrc.strokeW == null ? 4 : styleSrc.strokeW,
      glow: !!styleSrc.glow,
      glowBlur: styleSrc.glowBlur == null ? 30 : styleSrc.glowBlur,
      glowColor: styleSrc.glowColor || "rgba(0,0,0,0.5)",
    };
    state.layers.push(layer);
    selectLayer(layer.id);
    setStatus("Forma livre criada! Ajuste cor, contorno e preenchimento no painel.");
  }

  stage.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const el = editLayer();
      if (el && el.kind === "phone" && el.imgEl) {
        // zoom da imagem dentro da tela do telefone
        const step = e.deltaY > 0 ? -0.05 : 0.05;
        el.screenZoom = Math.max(0.2, Math.min(4, (el.screenZoom == null ? 1 : el.screenZoom) + step));
        render();
        renderPropsLater();
        return;
      }
      if (!state.selectedId) return;
      const l = layerById(state.selectedId);
      if (!l) return;
      const step = e.deltaY > 0 ? -0.08 : 0.08;
      l.scale = Math.max(0.2, Math.min(4, (l.scale || 1) + step));
      render();
      if (!renderTimer) renderPropsLater();
    },
    { passive: false }
  );

  let renderTimer = null;
  function renderPropsLater() {
    if (renderTimer) return;
    renderTimer = setTimeout(() => {
      renderTimer = null;
      renderProps();
    }, 120);
  }

  stage.addEventListener("click", (e) => {
    // alternativa ao dblclick: segundo clique rápido também alterna o modo
    if (state.editMode && e.detail >= 2) setEditMode(null);
  });

  stage.addEventListener("dblclick", (e) => {
    if (state.editMode) {
      setEditMode(null);
      return;
    }
    const p = canvasCoords(e);
    const hit = hitTest(p.x, p.y);
    const l = hit ? layerById(hit) : null;
    if (l && l.kind === "phone" && l.imgEl) {
      // duplo clique entra no modo de edição da imagem direto no mockup
      selectLayer(l.id);
      setEditMode(l.id);
    } else if (l && l.kind === "phone") {
      setStatus("Adicione uma imagem à tela antes de editá-la no mockup.");
    }
  });

  // Teclado: Delete remove a camada selecionada; Esc sai do modo de edição
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state.drawMode) {
      state.drawMode = false;
      state.draft = null;
      stage.classList.remove("is-drawing");
      render();
      setStatus("");
      return;
    }
    if (e.key === "Escape" && state.editMode) {
      setEditMode(null);
      return;
    }
    if ((e.key === "Delete" || e.key === "Backspace") && state.selectedId) {
      const t = e.target;
      const tag = t && t.tagName;
      const editing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (t && t.isContentEditable);
      if (editing) return; // não apagar a camada enquanto o usuário digita
      e.preventDefault();
      handleLayerAction("del", state.selectedId);
    }
  });
// =========================================================
  // Upload principal (tela do celular) + botões de camada
  // =========================================================
  const drop = $("drop");
  const fileInput = $("file");

  async function handlePrimaryFile(f) {
    if (!f || !f.type.startsWith("image/")) {
      setStatus("Envie um arquivo de imagem.", "error");
      return;
    }
    const dataUrl = await fileToDataUrl(f);
    const img = await loadIntoImg(dataUrl);
    // Se ainda não há telefone, cria um central com a imagem
    const existing = state.layers.find((l) => l.kind === "phone");
    if (existing) {
      existing.imgEl = img;
      existing._srcFile = f;
      selectLayer(existing.id);
    } else {
      const ph = addPhone({ img });
      ph._srcFile = f;
      ph.sx = 0.5;
      ph.sy = 0.55;
      selectLayer(ph.id);
    }
    hint.hidden = true;
    setStatus("Imagem aplicada ao telefone. Arraste para mover, use a rolinha para redimensionar.");
  }

  fileInput.addEventListener("change", () => handlePrimaryFile(fileInput.files[0]));

  ["dragenter", "dragover"].forEach((ev) =>
    drop.addEventListener(ev, (e) => {
      e.preventDefault();
      drop.classList.add("is-over");
    })
  );
  ["dragleave", "drop"].forEach((ev) =>
    drop.addEventListener(ev, (e) => {
      e.preventDefault();
      drop.classList.remove("is-over");
    })
  );
  drop.addEventListener("drop", (e) => {
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) handlePrimaryFile(f);
  });

  $("btn-add-phone").addEventListener("click", () => {
    // novo telefone sem imagem; usuário pode atribuir depois
    const ph = addPhone();
    selectLayer(ph.id);
  });
  $("btn-add-text").addEventListener("click", () => {
    addText();
    selectLayer(state.layers[state.layers.length - 1].id);
  });
  // Seletor de formas (popup do botão "● Forma")
  const shapePicker = $("shape-picker");
  shapePicker.innerHTML = SHAPE_CHOICES.map(
    ([id, icon, label]) =>
      `<button class="shape-picker__item" data-shape="${id}" title="${label}"><span class="shape-picker__icon">${icon}</span>${label}</button>`
  ).join("");

  function closeShapePicker() {
    shapePicker.hidden = true;
  }

  $("btn-add-shape").addEventListener("click", (e) => {
    e.stopPropagation();
    shapePicker.hidden = !shapePicker.hidden;
  });
  shapePicker.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-shape]");
    if (!btn) return;
    closeShapePicker();
    if (btn.dataset.shape === "free") {
      // entra no modo de desenho livre
      state.drawMode = true;
      state.draft = null;
      stage.classList.add("is-drawing");
      setStatus("Modo desenho: arraste no palco para criar sua forma (traço aberto = linha). Esc cancela.");
      return;
    }
    addShape(btn.dataset.shape);
    selectLayer(state.layers[state.layers.length - 1].id);
  });
  document.addEventListener("click", (e) => {
    if (!shapePicker.hidden && !shapePicker.contains(e.target)) closeShapePicker();
  });
  $("btn-add-image").addEventListener("click", () => {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = "image/*";
    inp.multiple = true;
    inp.onchange = async () => {
      if (!inp.files.length) return;
      let last;
      for (const file of inp.files) {
        const img = await loadIntoImg(await fileToDataUrl(file));
        last = addImageLayer(img);
        // espalha as fotos para não ficarem todas sobrepostas
        last.x = Math.max(10, Math.min(frame.w - 10, last.x + state.layers.length * 14));
        last.y = Math.max(20, Math.min(frame.h - 20, last.y + state.layers.length * 10));
      }
      if (last) selectLayer(last.id);
      setStatus(inp.files.length > 1 ? inp.files.length + " fotos adicionadas." : "Foto adicionada.");
    };
    inp.click();
  });

  // =========================================================
  // Fundo (fundo atrás do mockup)
  // =========================================================
  const bgType = $("bg-type");
  const bgColor = $("bg-color");
  const bgColor2 = $("bg-color2");
  const bgPreset = $("bg-grad-preset");
  const bgImageFile = $("bg-image-file");
  const btnBgImage = $("btn-bg-image");
  const btnBgImageClear = $("btn-bg-image-clear");

  // =========================================================
  // Tamanho do quadro (estender o fundo)
  // =========================================================
  const framePreset = $("frame-preset");
  const frameWInp = $("frame-w");
  const frameHInp = $("frame-h");

  function clampFrame(v) {
    return Math.max(200, Math.min(2400, Math.round(v / 10) * 10));
  }
  function setFrameSize(w, h) {
    frame.w = clampFrame(w);
    frame.h = clampFrame(h);
    frameWInp.value = frame.w;
    frameHInp.value = frame.h;
    render();
    if (selected()) renderProps();
  }
  framePreset.addEventListener("change", () => {
    if (framePreset.value === "custom") return;
    const [w, h] = framePreset.value.split("x").map(Number);
    if (w && h) setFrameSize(w, h);
  });
  frameWInp.addEventListener("change", () => {
    framePreset.value = "custom";
    setFrameSize(parseFloat(frameWInp.value) || frame.w, frame.h);
  });
  frameHInp.addEventListener("change", () => {
    framePreset.value = "custom";
    setFrameSize(frame.w, parseFloat(frameHInp.value) || frame.h);
  });

  function syncBgUI() {
    const t = state.backdrop.type;
    $("bg-solid-wrap").style.display = t === "solid" ? "" : "none";
    $("bg-grad-wrap").style.display = t === "gradient" ? "" : "none";
    $("bg-image-edit").hidden = !(t === "image" && state.backdrop.image);
  }

  function syncBgEditControls() {
    const im = state.backdrop.image;
    if (!im) return;
    $("bg-img-zoom").value = im.zoom == null ? 1 : im.zoom;
    $("bg-img-panx").value = im.panX || 0;
    $("bg-img-pany").value = im.panY || 0;
    $("bg-img-opacity").value = im.opacity == null ? 1 : im.opacity;
    $("bg-img-blur").value = im.blur || 0;
    $("bg-img-fit").value = im.cover || "cover";
  }

  function bindBgEditControl(id, key) {
    $(id).addEventListener("input", () => {
      const im = state.backdrop.image;
      if (!im) return;
      im[key] = parseFloat($(id).value);
      render();
    });
  }

  bgType.addEventListener("change", () => {
    state.backdrop.type = bgType.value;
    syncBgUI();
    render();
  });
  bgColor.addEventListener("input", () => {
    state.backdrop.color = bgColor.value;
    if (state.backdrop.type === "solid") render();
  });
  bgColor2.addEventListener("input", () => { state.backdrop.color2 = bgColor2.value; });
  bgPreset.addEventListener("change", () => {
    state.backdrop.preset = bgPreset.value;
    render();
  });
  btnBgImage.addEventListener("click", () => bgImageFile.click());
  bgImageFile.addEventListener("change", async () => {
    if (!bgImageFile.files[0]) return;
    const img = await loadIntoImg(await fileToDataUrl(bgImageFile.files[0]));
    state.backdrop.image = { img, cover: "cover", zoom: 1, panX: 0, panY: 0, opacity: 1, blur: 0 };
    state.backdrop.type = "image";
    bgType.value = "image";
    syncBgUI();
    syncBgEditControls();
    render();
    setStatus("Imagem de fundo aplicada. Use os ajustes abaixo para editar.");
  });
  btnBgImageClear.addEventListener("click", () => {
    state.backdrop.image = null;
    state.backdrop.type = "gradient";
    bgType.value = "gradient";
    syncBgUI();
    render();
  });

  bindBgEditControl("bg-img-zoom", "zoom");
  bindBgEditControl("bg-img-panx", "panX");
  bindBgEditControl("bg-img-pany", "panY");
  bindBgEditControl("bg-img-opacity", "opacity");
  bindBgEditControl("bg-img-blur", "blur");
  $("bg-img-fit").addEventListener("change", () => {
    const im = state.backdrop.image;
    if (!im) return;
    im.cover = $("bg-img-fit").value;
    render();
  });
  $("btn-bg-edit-reset").addEventListener("click", () => {
    const im = state.backdrop.image;
    if (!im) return;
    im.zoom = 1;
    im.panX = 0;
    im.panY = 0;
    im.opacity = 1;
    im.blur = 0;
    im.cover = "cover";
    syncBgEditControls();
    render();
    setStatus("Ajustes da imagem de fundo restaurados.");
  });

  syncBgUI();
// =========================================================
  // Download em alta resolução
  // =========================================================
  $("btn-download").addEventListener("click", async () => {
    const btn = $("btn-download");
    btn.disabled = true;
    const old = btn.textContent;
    btn.textContent = "Gerando…";
    setStatus("Renderizando em alta resolução…", "loading");
    try {
      const out = document.createElement("canvas");
      out.width = frame.w * 2;
      out.height = frame.h * 2;
      const octx = out.getContext("2d");
      // usa as dimensões reais do quadro (2×), não as constantes antigas,
      // para o download sair exatamente como está sendo editado
      renderAt(octx, out.width, out.height, false);
      const blob = await new Promise((resolve, reject) =>
        out.toBlob((b) => (b ? resolve(b) : reject(new Error("Erro ao gerar PNG."))), "image/png")
      );
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "mockup-smartphone.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
      setStatus("Mockup baixado!");
    } catch (err) {
      setStatus("Erro ao gerar o download.", "error");
    } finally {
      btn.disabled = false;
      btn.textContent = old;
    }
  });

  // =========================================================
  // Inicialização (exemplo com 1 telefone e um texto)
  // =========================================================
  const demoPhone = addPhone();
  demoPhone.sx = 0.5;
  demoPhone.sy = 0.55;
  demoPhone.style = "dark";
  demoPhone.shadow = true;
  demoPhone.shadowBlur = 48;
  demoPhone.shadowOffset = 36;

  const demoTitle = {
    id: uid(), kind: "text", text: "Seu app aqui", x: frame.w / 2, y: frame.h * 0.13,
    size: 54, color: "#ffffff", font: "Arial", bold: true, align: "center",
    shadow: true, shadowColor: "rgba(0,0,0,0.7)", shadowBlur: 6, scale: 1, rot: 0, opacity: 1, visible: true,
  };
  state.layers.push(demoTitle);

  selectLayer(demoPhone.id);
  render();
})();