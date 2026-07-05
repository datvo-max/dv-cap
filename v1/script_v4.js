let scannedData = [];
let html5QrCode = null;

// ==========================================
// 1. TẠO GIAO DIỆN BẢNG THÔNG BÁO TÙY CHỈNH
// ==========================================
function createCustomModal() {
  // Thêm CSS cho bảng thông báo
  const style = document.createElement('style');
  style.innerHTML = `
        .scan-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.6); display: none; 
            justify-content: center; align-items: center; z-index: 9999;
        }
        .scan-modal {
            background: white; padding: 25px; border-radius: 12px;
            width: 85%; max-width: 350px; text-align: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .scan-modal h3 { margin-top: 0; margin-bottom: 15px; }
        .scan-modal p { margin-bottom: 25px; line-height: 1.5; color: #333; font-size: 15px; }
        .scan-modal-btns { display: flex; gap: 10px; justify-content: center; }
        .scan-modal-btns button { 
            flex: 1; padding: 12px; font-size: 16px; border: none; 
            border-radius: 8px; cursor: pointer; color: white; font-weight: bold; 
        }
        .btn-continue { background-color: #ff9800; }
        .btn-close { background-color: #6c757d; }
    `;
  document.head.appendChild(style);

  // Thêm HTML cho bảng thông báo
  const overlay = document.createElement('div');
  overlay.className = 'scan-modal-overlay';
  overlay.id = 'scan-modal-overlay';
  overlay.innerHTML = `
        <div class="scan-modal">
            <h3 id="modal-title">Thông báo</h3>
            <p id="modal-message">Nội dung</p>
            <div class="scan-modal-btns">
                <button class="btn-close" onclick="closeModal()">Đóng</button>
                <button class="btn-continue" onclick="continueScanning()">Chụp tiếp</button>
            </div>
        </div>
    `;
  document.body.appendChild(overlay);
}

// Chạy hàm tạo giao diện ngay khi load web
createCustomModal();

// Các hàm điều khiển bảng thông báo
function showModal(title, message, isSuccess) {
  document.getElementById('modal-title').innerText = title;
  document.getElementById('modal-title').style.color = isSuccess ? '#28a745' : '#dc3545';
  document.getElementById('modal-message').innerText = message;
  document.getElementById('scan-modal-overlay').style.display = 'flex';
}

function closeModal() {
  document.getElementById('scan-modal-overlay').style.display = 'none';
}

function continueScanning() {
  closeModal();
  // Đây là lệnh click trực tiếp từ tay người dùng, trình duyệt sẽ không chặn nữa!
  document.getElementById('file-input').click();
}


// ==========================================
// 2. CÁC HÀM XỬ LÝ QUÉT QR & EXCEL
// ==========================================

function parseCCCD(qrText) {
  const parts = qrText.split('|');
  if (parts.length >= 6) {
    return {
      "Số CCCD": parts[0] || "",
      "CMND Cũ": parts[1] || "",
      "Họ và Tên": parts[2] || "",
      "Ngày Sinh": parts[3] || "",
      "Giới Tính": parts[4] || "",
      "Địa Chỉ": parts[5] || "",
      "Ngày Cấp": parts[6] || ""
    };
  } else {
    return { "Dữ liệu": qrText };
  }
}

function startScanner() {
  document.getElementById('reader').style.display = 'block';
  document.getElementById('start-btn').style.display = 'none';
  document.getElementById('stop-btn').style.display = 'inline-block';

  if (!html5QrCode) {
    html5QrCode = new Html5Qrcode("reader");
  }

  const config = { fps: 10, qrbox: { width: 230, height: 230 }, formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE] };
  const cameraConstraints = { facingMode: "environment" };

  html5QrCode.start(cameraConstraints, config, (decodedText) => {
    const personData = parseCCCD(decodedText);
    scannedData.push(personData);
    updateTable();
    alert("Đã quét thành công: " + (personData["Họ và Tên"] || "Mã QR"));
    stopScanner();
  }).catch(err => {
    alert("Lỗi mở camera tự động. Vui lòng dùng chức năng 'Chụp Ảnh Thẻ để Quét'.");
    stopScanner();
  });
}

function stopScanner() {
  if (html5QrCode && html5QrCode.isScanning) {
    html5QrCode.stop().then(() => {
      document.getElementById('reader').style.display = 'none';
      document.getElementById('start-btn').style.display = 'inline-block';
      document.getElementById('stop-btn').style.display = 'none';
    });
  } else {
    document.getElementById('reader').style.display = 'none';
    document.getElementById('start-btn').style.display = 'inline-block';
    document.getElementById('stop-btn').style.display = 'none';
  }
}

function scanImage(event) {
  if (event.target.files.length === 0) return;
  const file = event.target.files[0];

  if (!html5QrCode) {
    html5QrCode = new Html5Qrcode("reader");
  }

  if (html5QrCode.isScanning) {
    html5QrCode.stop().then(() => {
      document.getElementById('reader').style.display = 'none';
      document.getElementById('start-btn').style.display = 'inline-block';
      document.getElementById('stop-btn').style.display = 'none';
      processImageFile(file, event);
    });
  } else {
    processImageFile(file, event);
  }
}

function processImageFile(file, event) {
  html5QrCode.scanFile(file, false)
    .then(decodedText => {
      const personData = parseCCCD(decodedText);
      scannedData.push(personData);
      updateTable();

      // SỬ DỤNG BẢNG THÔNG BÁO TÙY CHỈNH THAY VÌ CONFIRM
      showModal("Quét thành công!", "Đã thêm dữ liệu của: " + (personData["Họ và Tên"] || "Mã QR") + "\n\nBạn có muốn chụp thẻ tiếp theo không?", true);
      event.target.value = "";
    })
    .catch(err => {
      showModal("Chưa nhận diện được!", "Không tìm thấy mã QR hợp lệ trong ảnh.\n\nLưu ý: Hãy đưa máy sát thẻ và đợi lấy nét rõ chữ.\n\nBạn có muốn chụp lại ngay không?", false);
      event.target.value = "";
    });
}

function updateTable() {
  const tbody = document.getElementById('table-body');
  tbody.innerHTML = "";

  scannedData.forEach((item, index) => {
    const tr = document.createElement('tr');
    if (item["Số CCCD"]) {
      tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${item["Số CCCD"]}</td>
                <td>${item["Họ và Tên"]}</td>
                <td>${item["Ngày Sinh"]}</td>
                <td>${item["Giới Tính"]}</td>
                <td>${item["Địa Chỉ"]}</td>
            `;
    } else {
      tr.innerHTML = `
                <td>${index + 1}</td>
                <td colspan="5" style="color: #666; font-style: italic;">${item["Dữ liệu"]}</td>
            `;
    }
    tbody.appendChild(tr);
  });
}

function exportExcel() {
  if (scannedData.length === 0) {
    alert("Chưa có dữ liệu trong danh sách để xuất Excel!");
    return;
  }
  const worksheet = XLSX.utils.json_to_sheet(scannedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachCCCD");
  XLSX.writeFile(workbook, "Danh_Sach_CCCD.xlsx");
}