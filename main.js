let selectedFiles = [];
let additionalBreaks = [];  // 追加の休憩時間を保存

// 初期化
window.onload = () => {
  document.getElementById("loadingMsg").style.display = "none";
  populateYearMonth();
  loadFromLocalStorage();
  setupTimeModeSwitcher();
  setupAdditionalBreaks();
};

// 就業時間設定モードの切り替え
function setupTimeModeSwitcher() {
  const radios = document.querySelectorAll('input[name="time_mode"]');
  const ratioInput = document.getElementById("ratioPercent");
  const fixedInput = document.getElementById("fixedHours");

  radios.forEach(radio => {
    radio.addEventListener("change", () => {
      ratioInput.disabled = radio.value !== "ratio";
      fixedInput.disabled = radio.value !== "fixed";
    });
  });

  // 初期状態
  ratioInput.disabled = true;
  fixedInput.disabled = true;
}

// 追加の休憩時間機能
function setupAdditionalBreaks() {
  const addBreakBtn = document.getElementById("addBreakBtn");
  addBreakBtn.addEventListener("click", addBreakRow);
}

function addBreakRow() {
  const breaksList = document.getElementById("breaksList");
  const breakId = Date.now();
  const li = document.createElement("li");
  
  const breakDiv = document.createElement("div");
  breakDiv.style.display = "flex";
  breakDiv.style.gap = "10px";
  breakDiv.style.alignItems = "center";

  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.className = "break-date";
  dateInput.style.flex = "1";
  dateInput.dataset.breakId = breakId;

  const hoursInput = document.createElement("input");
  hoursInput.type = "number";
  hoursInput.className = "break-hours";
  hoursInput.min = "0";
  hoursInput.placeholder = "時間";
  hoursInput.style.width = "100px";
  hoursInput.step = "0.1";
  hoursInput.dataset.breakId = breakId;

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.textContent = "削除";
  removeBtn.className = "remove-button";
  removeBtn.onclick = () => {
    li.remove();
    additionalBreaks = additionalBreaks.filter(b => b.id !== breakId);
  };

  // 入力値を同期
  dateInput.addEventListener("change", updateAdditionalBreaks);
  hoursInput.addEventListener("change", updateAdditionalBreaks);

  breakDiv.appendChild(dateInput);
  breakDiv.appendChild(hoursInput);
  breakDiv.appendChild(removeBtn);
  li.appendChild(breakDiv);
  breaksList.appendChild(li);
}

function updateAdditionalBreaks() {
  additionalBreaks = [];
  document.querySelectorAll(".break-date").forEach(dateInput => {
    const breakId = dateInput.dataset.breakId;
    const hoursInput = document.querySelector(`.break-hours[data-break-id="${breakId}"]`);
    if (dateInput.value && hoursInput.value) {
      additionalBreaks.push({
        id: breakId,
        date: dateInput.value,
        hours: parseFloat(hoursInput.value)
      });
    }
  });
}

// ファイル選択時に追加（CSVファイルのみ）
const fileInput = document.getElementById("fileInput");
fileInput.addEventListener("change", (e) => {
  const newFiles = Array.from(e.target.files).filter(f => f.name.toLowerCase().endsWith(".csv"));
  selectedFiles = selectedFiles.concat(newFiles);
  updateFileList();
});

// ドラッグ＆ドロップでファイル追加（CSVファイルのみ）
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
  const newFiles = Array.from(e.dataTransfer.files).filter(f => f.name.toLowerCase().endsWith(".csv"));
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
  ["name", "eid", "organization", "task"].forEach(id => {
    const val = localStorage.getItem(id);
    if (val) document.getElementById(id).value = val;
  });

  // 時間モードの復元
  const timeMode = localStorage.getItem("time_mode") || "none";
  document.querySelector(`input[name="time_mode"][value="${timeMode}"]`).checked = true;

  const ratioPercent = localStorage.getItem("ratio_percent");
  if (ratioPercent) document.getElementById("ratioPercent").value = ratioPercent;

  const fixedHours = localStorage.getItem("fixed_hours");
  if (fixedHours) document.getElementById("fixedHours").value = fixedHours;

  setupTimeModeSwitcher();
}

function saveToLocalStorage() {
  ["name", "eid", "organization", "task"].forEach(id => {
    localStorage.setItem(id, document.getElementById(id).value);
  });

  const timeMode = document.querySelector('input[name="time_mode"]:checked').value;
  localStorage.setItem("time_mode", timeMode);

  const ratioPercent = document.getElementById("ratioPercent").value;
  if (ratioPercent) localStorage.setItem("ratio_percent", ratioPercent);

  const fixedHours = document.getElementById("fixedHours").value;
  if (fixedHours) localStorage.setItem("fixed_hours", fixedHours);
}

// HH:MM形式を小数時間に変換
function timeToDecimalHours(timeStr) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours + minutes / 60;
}

// アップロード処理
const uploadBtn = document.getElementById("uploadBtn");
uploadBtn.addEventListener("click", async () => {
  // CSVファイル2個の検証
  const csvFiles = selectedFiles.filter(f => f.name.toLowerCase().endsWith(".csv"));
  if (csvFiles.length !== 2) {
    alert("CSVファイルを2個選択してください");
    return;
  }

  saveToLocalStorage();
  updateAdditionalBreaks();
  uploadBtn.disabled = true;
  document.getElementById("loadingMsg").style.display = "inline";

  const name = document.getElementById("name").value;
  const eid = document.getElementById("eid").value;
  const organization = document.getElementById("organization").value;
  const year = document.getElementById("year").value;
  const month = document.getElementById("month").value;
  const task = document.getElementById("task").value;
  const timeMode = document.querySelector('input[name="time_mode"]:checked').value;
  const ratioPercent = document.getElementById("ratioPercent").value.trim();
  const fixedHours = document.getElementById("fixedHours").value.trim();

  // バリデーション
  if (timeMode === "ratio") {
    const ratioValue = Number(ratioPercent);
    if (!Number.isFinite(ratioValue) || ratioValue < 0 || ratioValue > 100) {
      alert("就業時間割合は0〜100の数値で入力してください");
      uploadBtn.disabled = false;
      document.getElementById("loadingMsg").style.display = "none";
      return;
    }
  } else if (timeMode === "fixed") {
    if (!fixedHours || !/^\d{2}:\d{2}$/.test(fixedHours)) {
      alert("固定時間はhh:mm形式で入力してください");
      uploadBtn.disabled = false;
      document.getElementById("loadingMsg").style.display = "none";
      return;
    }
  }

  let fixedHoursDecimal = null;
  if (timeMode === "fixed") {
    fixedHoursDecimal = timeToDecimalHours(fixedHours);
  }

  const formData = new FormData();
  csvFiles.forEach(file => formData.append("files", file));
  formData.append("name", name);
  formData.append("eid", eid);
  formData.append("organization", organization);
  formData.append("year", year);
  formData.append("month", month);
  formData.append("task", task);
  formData.append("time_mode", timeMode);

  if (timeMode === "ratio") {
    formData.append("ratio_percent", ratioPercent);
  } else if (timeMode === "fixed") {
    formData.append("fixed_hours", fixedHoursDecimal);
  }

  // 追加の休憩時間をJSON形式で追加
  if (additionalBreaks.length > 0) {
    formData.append("additional_breaks", JSON.stringify(additionalBreaks));
  }

  try {
    // 環境に応じてAPIエンドポイントを自動判定
    const hostname = window.location.hostname;
    let apiEndpoint;
    
    if (hostname.includes('gray-grass-06e4f8300-1.eastasia.2.azurestaticapps.net')) {
      // ステージング環境（PRプレビュー）
      apiEndpoint = "https://timesheet-api-staging.azurewebsites.net/upload";
    } else if (hostname.includes('gray-grass-06e4f8300') || hostname.includes('azurestaticapps.net')) {
      // 本番環境（Azure Static Web Apps）
      apiEndpoint = "https://timesheet-api-prod.azurewebsites.net/upload";
    } else if (hostname === 'yamaken999.github.io') {
      // 旧本番環境（GitHub Pages）
      apiEndpoint = "https://timesheet-api-prod.azurewebsites.net/upload";
    } else {
      // ローカル開発環境
      apiEndpoint = "http://localhost:10000/upload";
    }
    
    const response = await fetch(apiEndpoint, {
      method: "POST",
      body: formData
    });

    if (!response.ok) throw new Error("アップロード失敗");

    // サーバーからのレスポンスヘッダーからファイル名を取得
    const contentDisposition = response.headers.get('content-disposition');
    let filename = `タイムシート(${year}_${month.padStart(2, '0')})_${eid}.xlsx`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert("エラーが発生しました: " + err.message);
  } finally {
    uploadBtn.disabled = false;
    document.getElementById("loadingMsg").style.display = "none";
  }
});
