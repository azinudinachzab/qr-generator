const form = document.getElementById("form");
const input = document.getElementById("url");
const eccSelect = document.getElementById("ecc");
const canvas = document.getElementById("qr");
const result = document.getElementById("result");
const errorEl = document.getElementById("error");
const downloadBtn = document.getElementById("download");

const TARGET_SIZE = 1024; // approximate pixel size of the exported PNG
const QUIET_ZONE = 4;     // blank modules around the code (QR spec)

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.hidden = !msg;
}

function generate() {
  const text = input.value.trim();
  showError("");

  if (!text) {
    result.hidden = true;
    return;
  }

  let qr;
  try {
    qr = qrcode(0, eccSelect.value); // 0 = auto-detect version
    qr.addData(text);
    qr.make();
  } catch (e) {
    result.hidden = true;
    showError("Text is too long to fit in a QR code. Try a shorter link or lower error correction.");
    return;
  }

  const count = qr.getModuleCount();
  const total = count + QUIET_ZONE * 2;
  const cell = Math.max(1, Math.floor(TARGET_SIZE / total));
  const size = cell * total;

  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "#000000";

  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) {
        ctx.fillRect((c + QUIET_ZONE) * cell, (r + QUIET_ZONE) * cell, cell, cell);
      }
    }
  }

  result.hidden = false;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  generate();
});

input.addEventListener("input", generate);
eccSelect.addEventListener("change", generate);

downloadBtn.addEventListener("click", () => {
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = "qr-code.png";
  a.click();
});
