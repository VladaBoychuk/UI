const els = {
  btnPick: document.getElementById("btnPick"),
  btnRemoveSelected: document.getElementById("btnRemoveSelected"),
  btnClear: document.getElementById("btnClear"),

  btnChoosePath: document.getElementById("btnChoosePath"),
  btnClearPath: document.getElementById("btnClearPath"),

  btnCreate: document.getElementById("btnCreate"),

  files: document.getElementById("files"),
  count: document.getElementById("count"),
  selectedCount: document.getElementById("selectedCount"),
  empty: document.getElementById("empty"),

  savePathView: document.getElementById("savePathView"),

  status: document.getElementById("status"),
  error: document.getElementById("error"),

  // confirm modal
  confirmModal: document.getElementById("confirmModal"),
  confirmOverlay: document.getElementById("confirmOverlay"),
  confirmTitle: document.getElementById("confirmTitle"),
  confirmMessage: document.getElementById("confirmMessage"),
  confirmYes: document.getElementById("confirmYes"),
  confirmNo: document.getElementById("confirmNo"),

  // success modal
  successModal: document.getElementById("successModal"),
  successOverlay: document.getElementById("successOverlay"),
  successClose: document.getElementById("successClose"),
  successName: document.getElementById("successName"),
  successPath: document.getElementById("successPath"),
  successSize: document.getElementById("successSize"),
};

let selectedFiles = [];
let selectedSet = new Set();
let outPath = null;

// ---------- UI helpers ----------
function setError(msg) {
  els.error.hidden = !msg;
  els.error.textContent = msg || "";
}

function setStatus(msg) {
  els.status.textContent = msg || "";
}

function updatePathUI() {
  els.savePathView.textContent = outPath || "Не вибрано";
  els.btnClearPath.disabled = !outPath;
}

function updateButtons() {
  els.btnRemoveSelected.disabled = selectedSet.size === 0;
  els.btnCreate.disabled = !(selectedFiles.length > 0 && !!outPath);
  els.selectedCount.textContent = `Вибрано: ${selectedSet.size}`;
}

function setEmptyVisible(isVisible) {
  els.empty.style.display = isVisible ? "grid" : "none";
}

function formatBytes(bytes) {
  const n = Number(bytes || 0);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(2)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(2)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function getFileNameFromPath(p) {
  if (!p) return "";
  // Windows або Unix
  const parts = p.split(/[/\\]/);
  return parts[parts.length - 1] || p;
}

// ---------- Custom Confirm ----------
let confirmResolve = null;

function closeConfirm(result) {
  els.confirmModal.classList.add("hidden");
  els.confirmModal.setAttribute("aria-hidden", "true");

  if (confirmResolve) {
    const r = confirmResolve;
    confirmResolve = null;
    r(result);
  }
}

function confirmAction(title, message) {
  els.confirmTitle.textContent = title || "Підтвердження";
  els.confirmMessage.textContent = message || "Ви впевнені?";

  els.confirmModal.classList.remove("hidden");
  els.confirmModal.setAttribute("aria-hidden", "false");

  setTimeout(() => els.confirmYes.focus(), 0);

  return new Promise((resolve) => {
    confirmResolve = resolve;
  });
}

els.confirmYes.addEventListener("click", () => closeConfirm(true));
els.confirmNo.addEventListener("click", () => closeConfirm(false));
els.confirmOverlay.addEventListener("click", () => closeConfirm(false));

// ---------- Success Modal ----------
function openSuccessModal(p, sizeBytes) {
  const name = getFileNameFromPath(p);

  els.successName.textContent = name || "—";
  els.successPath.textContent = p || "—";
  els.successSize.textContent = formatBytes(sizeBytes);

  els.successModal.classList.remove("hidden");
  els.successModal.setAttribute("aria-hidden", "false");

  setTimeout(() => els.successClose.focus(), 0);
}

function closeSuccessModal() {
  els.successModal.classList.add("hidden");
  els.successModal.setAttribute("aria-hidden", "true");
}

els.successClose.addEventListener("click", closeSuccessModal);
els.successOverlay.addEventListener("click", closeSuccessModal);

window.addEventListener("keydown", (e) => {
  const confirmOpen = !els.confirmModal.classList.contains("hidden");
  const successOpen = !els.successModal.classList.contains("hidden");

  if (!confirmOpen && !successOpen) return;

  if (e.key === "Escape") {
    if (successOpen) closeSuccessModal();
    else closeConfirm(false);
    return;
  }

  if (e.key === "Enter") {
    if (successOpen) closeSuccessModal();
    else closeConfirm(true);
  }
});

// ---------- Render ----------
function renderFiles() {
  els.files.innerHTML = "";

  setEmptyVisible(selectedFiles.length === 0);

  selectedFiles.forEach((file) => {
    const li = document.createElement("li");
    li.className = "file-item";

    const left = document.createElement("div");
    left.className = "file-left";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = selectedSet.has(file);

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) selectedSet.add(file);
      else selectedSet.delete(file);
      updateButtons();
    });

    const name = document.createElement("div");
    name.className = "file-name";
    name.textContent = file;

    left.appendChild(checkbox);
    left.appendChild(name);

    li.appendChild(left);
    els.files.appendChild(li);
  });

  els.count.textContent = selectedFiles.length;
  updateButtons();
}

// ---------- Start ----------
setError("");
setStatus("");
updatePathUI();
renderFiles();

// ---------- Actions ----------

// ОБРАТИ ФАЙЛИ
els.btnPick.addEventListener("click", async () => {
  setError("");
  setStatus("");

  const res = await window.api.pickFiles();
  if (res.canceled) return;

  selectedFiles = [...new Set([...selectedFiles, ...res.files])];
  renderFiles();
});

// ВИДАЛИТИ ВИБРАНІ
els.btnRemoveSelected.addEventListener("click", async () => {
  if (selectedSet.size === 0) return;

  const ok = await confirmAction(
    "Видалити файли",
    `Ви точно бажаєте видалити ${selectedSet.size} файл(и)?`
  );
  if (!ok) return;

  selectedFiles = selectedFiles.filter(f => !selectedSet.has(f));
  selectedSet.clear();
  renderFiles();
});

// ОЧИСТИТИ СПИСОК
els.btnClear.addEventListener("click", async () => {
  if (selectedFiles.length === 0) return;

  const ok = await confirmAction(
    "Очистити список",
    "Ви точно бажаєте видалити всі файли зі списку?"
  );
  if (!ok) return;

  selectedFiles = [];
  selectedSet.clear();

  setError("");
  setStatus("");
  renderFiles();
});

// ВИБРАТИ ШЛЯХ
els.btnChoosePath.addEventListener("click", async () => {
  setError("");
  setStatus("");

  const saveRes = await window.api.pickArchiveDestination("archive.zip");
  if (saveRes.canceled || !saveRes.outPath) return;

  outPath = saveRes.outPath;
  updatePathUI();
  updateButtons();
  setStatus("Шлях вибрано ✅");
});

// СКИНУТИ ШЛЯХ
els.btnClearPath.addEventListener("click", () => {
  outPath = null;
  updatePathUI();
  updateButtons();
  setStatus("");
});

// СТВОРИТИ АРХІВ
els.btnCreate.addEventListener("click", async () => {
  setError("");
  setStatus("");

  if (!(selectedFiles.length > 0 && outPath)) return;

  const ok = await confirmAction(
    "Створення архіву",
    `Ви точно бажаєте створити архів з ${selectedFiles.length} файл(ів)?`
  );
  if (!ok) return;

  setStatus("Архівування...");

  const res = await window.api.createZip({ files: selectedFiles, outPath });

  if (!res.ok) {
    setStatus("");
    setError(res.error || "Помилка створення архіву.");
    return;
  }

  setError("");
  setStatus("");

  openSuccessModal(outPath, res.size);
});