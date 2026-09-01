(() => {
  const form = document.getElementById("qr-form");
  const text = document.getElementById("text");
  const size = document.getElementById("size");
  const errorCorrection = document.getElementById("errorCorrection");
  const format = document.getElementById("format");
  const dark = document.getElementById("dark");
  const light = document.getElementById("light");
  const result = document.getElementById("result");
  const resultImage = document.getElementById("result-image");
  const resultStatus = document.getElementById("result-status");
  const btnDownload = document.getElementById("btn-download");
  const btnCopy = document.getElementById("btn-copy");
  const transparent = document.getElementById("transparent");

  let currentBlob = null;
  let currentExt = "png";

  function buildQuery() {
    const params = new URLSearchParams({
      text: text.value,
      size: size.value || 512,
      errorCorrection: errorCorrection.value,
      format: format.value,
      "color.dark": dark.value,
      // fundo transparente: cor com canal alpha (#RRGGBBAA) suportada pela lib qrcode
      "color.light": transparent && transparent.checked ? "#00000000" : light.value,
    });
    return `/api/qr?${params.toString()}`;
  }

  if (transparent) {
    transparent.addEventListener("change", () => {
      light.disabled = transparent.checked;
    });
  }

  function stripErrorBanner() {
    const old = document.querySelector(".error-banner");
    if (old) old.remove();
  }

  function setStatus(msg, isError = false) {
    resultStatus.textContent = msg;
    resultStatus.classList.toggle("is-error", isError);
  }

  async function generate(e) {
    if (e) e.preventDefault();
    stripErrorBanner();

    if (!text.value.trim()) {
      text.focus();
      setStatus("Informe o conteúdo do QR Code.", true);
      return;
    }

    setStatus("Gerando QR Code...");
    result.hidden = true;

    try {
      const resp = await fetch(buildQuery());
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao gerar o QR Code.");
      }

      const blob = await resp.blob();
      currentExt = format.value === "svg" ? "svg" : "png";
      currentBlob = new Blob([blob], {
        type: currentExt === "svg" ? "image/svg+xml" : "image/png",
      });

      const url = URL.createObjectURL(currentBlob);
      resultImage.src = url;
      // Liberar a URL anterior
      if (resultImage._url) URL.revokeObjectURL(resultImage._url);
      resultImage._url = url;

      result.hidden = false;
      setStatus("QR Code gerado com sucesso!");
    } catch (err) {
      result.hidden = true;
      setStatus(err.message || "Não foi possível gerar o QR Code.", true);
    }
  }

  async function download() {
    if (!currentBlob) return;
    setStatus("Baixando...");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(currentBlob);
    link.download = `qrcode.${currentExt}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setStatus("Download concluído.");
  }

  async function copy() {
    if (!currentBlob) return;
    const type =
      currentExt === "svg" ? "image/svg+xml" : "image/png";
    try {
      const safeBlob = new Blob([await currentBlob.arrayBuffer()], { type });
      await navigator.clipboard.write([new ClipboardItem({ [type]: safeBlob })]);
      setStatus("Imagem copiada para a área de transferência.");
    } catch (err) {
      setStatus("Não foi possível copiar. Tente o download.", true);
    }
  }

  form.addEventListener("submit", generate);
  btnDownload.addEventListener("click", download);
  btnCopy.addEventListener("click", copy);

  // Gera um exemplo ao carregar
  text.value = "https://exemplo.com.br";
  generate();
})();