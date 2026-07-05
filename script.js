// KHỞI TẠO DỮ LIỆU TỪ LOCAL STORAGE HOẶC MẢNG TRỐNG
let scannedData = JSON.parse(localStorage.getItem('cccd_data')) || [];
let html5QrCode = null;
let currentScanMode = '';

// ==========================================
// 1. TẠO GIAO DIỆN BẢNG THÔNG BÁO TÙY CHỈNH
// ==========================================
function createCustomModal() {
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

  const overlay = document.createElement('div');
  overlay.className = 'scan-modal-overlay';
  overlay.id = 'scan-modal-overlay';
  overlay.innerHTML = `
        <div class="scan-modal">
            <h3 id="modal-title">Thông báo</h3>
            <p id="modal-message">Nội dung</p>
            <div class="scan-modal-btns">
                <button class="btn-close" onclick="closeModal()">Đóng</button>
                <button class="btn-continue" onclick="continueScanning()">Tiếp tục</button>
            </div>
        </div>
    `;
  document.body.appendChild(overlay);
}

createCustomModal();

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
  if (currentScanMode === 'manual') {
    document.getElementById('file-input').click();
  } else if (currentScanMode === 'auto') {
    startScanner();
  }
}

// ==========================================
// 2. CÁC HÀM XỬ LÝ DỮ LIỆU & QUÉT QR
// ==========================================

// Hàm lưu dữ liệu vào bộ nhớ thiết bị
function saveData() {
  localStorage.setItem('cccd_data', JSON.stringify(scannedData));
}

// Hàm xóa toàn bộ dữ liệu (Có cảnh báo)
function clearData() {
  if (scannedData.length === 0) {
    alert("Danh sách đang trống!");
    return;
  }
  const xacNhan = confirm("⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa toàn bộ danh sách không?\nDữ liệu đã xóa sẽ không thể khôi phục!");

  if (xacNhan) {
    scannedData = []; // Xóa mảng
    saveData();       // Lưu mảng rỗng vào bộ nhớ
    updateTable();    // Cập nhật lại giao diện
  }
}

function parseCCCD(qrText) {
  const parts = qrText.split('|').slice(0,7);
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
  currentScanMode = 'auto';
  document.getElementById('reader').style.display = 'block';
  document.getElementById('start-btn').style.display = 'none';
  document.getElementById('stop-btn').style.display = 'inline-block';

  if (!html5QrCode) { html5QrCode = new Html5Qrcode("reader"); }
  if (html5QrCode.isScanning) return;

  const config = { fps: 10, qrbox: { width: 230, height: 230 }, formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE] };
  const cameraConstraints = { facingMode: "environment" };

  html5QrCode.start(cameraConstraints, config, (decodedText) => {
    const personData = parseCCCD(decodedText);
    scannedData.push(personData);
    saveData(); // LƯU DỮ LIỆU NGAY KHI QUÉT XONG
    updateTable();

    stopScanner();
    showModal("Quét tự động thành công!", "Đã thêm: " + (personData["Họ và Tên"] || "Mã QR") + "\n\nBạn có muốn quét thẻ tiếp theo?", true);
  }).catch(err => {
    if (typeof err === 'string' && err.includes('NotFound')) return;
    console.error(err);
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
  currentScanMode = 'manual';
  if (event.target.files.length === 0) return;
  const file = event.target.files[0];

  if (!html5QrCode) { html5QrCode = new Html5Qrcode("reader"); }

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
      saveData(); // LƯU DỮ LIỆU NGAY KHI QUÉT XONG
      updateTable();

      showModal("Xử lý ảnh thành công!", "Đã thêm: " + (personData["Họ và Tên"] || "Mã QR") + "\n\nBạn có muốn chụp thẻ tiếp theo?", true);
      event.target.value = "";
    })
    .catch(err => {
      showModal("Chưa nhận diện được!", "Không tìm thấy mã QR hợp lệ trong ảnh.\n\nLưu ý: Hãy đưa máy sát thẻ và đợi lấy nét rõ.\n\nBạn có muốn chụp lại ngay?", false);
      event.target.value = "";
    });
}

// ==========================================
// 3. GIAO DIỆN & XUẤT FILE
// ==========================================
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

  // CẬP NHẬT BỘ ĐẾM HIỂN THỊ
  const countElement = document.getElementById('total-count');
  if (countElement) {
    countElement.innerText = scannedData.length;
  }
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

// GỌI HÀM UPDATE BẢNG NGAY KHI LOAD TRANG ĐỂ HIỂN THỊ DỮ LIỆU CŨ TỪ LOCAL STORAGE
updateTable();

// ==========================================
// HỆ THỐNG TOAST THÔNG BÁO LIÊN TỤC
// ==========================================
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerText = message;
  container.appendChild(toast);

  // Tự động xóa khỏi màn hình sau 3 giây
  setTimeout(() => {
    if (container.contains(toast)) {
      container.removeChild(toast);
    }
  }, 3000);
}

// ==========================================
// CHỨC NĂNG NHẬN DỮ LIỆU TỪ MÁY QUÉT CẦM TAY (PC/LAPTOP)
// ==========================================
let isDeviceScannerActive = false;
let scanBuffer = "";
let scanTimeout = null;

function toggleDeviceScanner() {
  const btn = document.getElementById('device-btn');
  isDeviceScannerActive = !isDeviceScannerActive;

  if (isDeviceScannerActive) {
    btn.innerText = "Đang Nhận QR... (Bấm Dừng)";
    btn.classList.add('active');
    showToast("Đã bật nhận dữ liệu. Dùng súng quét mã bắn trực tiếp vào thẻ!", "success");
  } else {
    btn.innerText = "Nhận Từ Máy Quét (PC)";
    btn.classList.remove('active');
    scanBuffer = "";
    showToast("Đã tắt chế độ nhận từ máy quét.", "warning");
  }
}

// Lắng nghe tín hiệu từ máy quét mã vạch toàn màn hình
document.addEventListener('keydown', function (event) {
  if (!isDeviceScannerActive) return;

  // Máy quét luôn gửi phím Enter khi kết thúc chuỗi mã
  if (event.key === 'Enter') {
    if (scanBuffer.trim() !== "") {
      processDeviceData(scanBuffer.trim());
    }
    scanBuffer = ""; // Xóa bộ đệm chuẩn bị cho thẻ tiếp theo
    return;
  }

  // Bỏ qua các phím điều khiển (Shift, Ctrl, Alt...)
  if (event.key.length === 1) {
    scanBuffer += event.key;
  }

  // Reset bộ đệm nếu ngắt quãng quá 500ms (Tránh việc vô tình gõ phím ngoài ý muốn)
  clearTimeout(scanTimeout);
  scanTimeout = setTimeout(() => {
    scanBuffer = "";
  }, 500);
});

function processDeviceData(qrText) {
  const personData = parseCCCD(qrText);

  if (personData["Số CCCD"]) {
    scannedData.push(personData);
    saveData();
    updateTable();
    // Thông báo Toast thành công (không làm gián đoạn luồng làm việc)
    showToast(`✅ Đã thêm: ${personData["Họ và Tên"]}`, 'success');
  } else {
    // Thông báo Toast thất bại
    showToast(`❌ Lỗi: Mã QR không hợp lệ!`, 'error');
  }
}
