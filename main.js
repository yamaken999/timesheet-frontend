let selectedFiles = [];

// 初期化
window.onload = () => {
  document.getElementById("loadingMsg").style.display = "none";
  populateYearMonth();
  loadFromLocalStorage();
};

// ファイル選択時に追加
const fileInput = document.getElementById("fileInput");
fileInput.addEventListener("change", (e) => {
  const newFiles = Array.from(e.target.files);
  selectedFiles = selectedFiles.concat(newFiles);
  updateFileList();
});

// ドラッグ＆ドロップでファイル追加
const dropZone = document.getElementById("dropZone");
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});
dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  const newFiles = Array.from(e.dataTransfer.files);
  selectedFiles = selectedFiles.concat(newFiles);
  updateFileList();
});

// ファイル一覧を表示・削除可能に
function updateFileList() {
  const list = document.getElementById("fileList");
  list.innerHTML = "";

  selectedFiles.forEach((file, index) => {
    const li = document.createElement("li");
    li.textContent = file.name;

    const btn = document.createElement("button");
    btn.textContent = "削除";
    btn.className = "remove-button";
    btn.onclick = () => {
      selectedFiles.splice(index, 1);
      updateFileList();
    };

    li.appendChild(btn);
    list.appendChild(li);
  });
}

// 年月ドロップダウン生成と初期設定（前月選択）
function populateYearMonth() {
  const yearSelect = document.getElementById("year");
  const monthSelect = document.getElementById("month");
  const today = new Date();
  const defaultYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
  const defaultMonth = today.getMonth() === 0 ? 12 : today.getMonth();

  for (let y = 2023; y <= today.getFullYear() + 5; y++) {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    if (y === defaultYear) opt.selected = true;
    yearSelect.appendChild(opt);
  }

  for (let m = 1; m <= 12; m++) {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    if (m === defaultMonth) opt.selected = true;
    monthSelect.appendChild(opt);
  }
}

// 入力値の保存と復元
function loadFromLocalStorage() {
  ["name", "eid", "year", "month", "task"].forEach(id => {
    const val = localStorage.getItem(id);
    if (val) document.getElementById(id).value = val;
  });
  const pres = localStorage.getItem("president");
  if (pres) document.querySelector(`input[name="president"][value="${pres}"]`).checked = true;
}
function saveToLocalStorage() {
  ["name", "eid", "year", "month", "task"].forEach(id => {
    localStorage.setItem(id, document.getElementById(id).value);
  });
  const pres = document.querySelector('input[name="president"]:checked')?.value;
  localStorage.setItem("president", pres);
}

// アップロード処理
const uploadBtn = document.getElementById("uploadBtn");
uploadBtn.addEventListener("click", async () => {
  if (selectedFiles.length === 0) return;

  saveToLocalStorage();
  uploadBtn.disabled = true;
  document.getElementById("loadingMsg").style.display = "inline";

  const name = document.getElementById("name").value;
  const eid = document.getElementById("eid").value;
  const year = document.getElementById("year").value;
  const month = document.getElementById("month").value;
  const task = document.getElementById("task").value;
  const president = document.querySelector('input[name="president"]:checked')?.value;

  const formData = new FormData();
  selectedFiles.forEach(file => formData.append("files", file));
  formData.append("name", name);
  formData.append("eid", eid);
  formData.append("year", year);
  formData.append("month", month);
  formData.append("task", task);
  formData.append("president", president);

  try {
    const response = await fetch("https://timesheet-api-un72.onrender.com/upload", {
      method: "POST",
      body: formData
    });

    if (!response.ok) throw new Error("アップロード失敗");

    const templateFile = selectedFiles.find(f => f.name.toLowerCase().endsWith(".xlsx"));
    const templateFilename = templateFile ? templateFile.name.split(".")[0] : "timesheet";

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${templateFilename}_${eid}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert("エラーが発生しました: " + err.message);
  } finally {
    uploadBtn.disabled = false;
    document.getElementById("loadingMsg").style.display = "none";
  }
});
