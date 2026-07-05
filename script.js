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

// HÀM PHÂN TÍCH VÀ NHẬN DIỆN LOẠI THẺ
function parseCCCD(qrText) {
  const cleanText = qrText.trim();
  const parts = cleanText.split('|');

  if (parts.length >= 6) {
    const loaiThe = parts.length > 7 ? "Thẻ Căn cước" : "Căn cước công dân";

    return {
      "Loại Thẻ": loaiThe,
      "Số CCCD": parts[0] || "",
      "CMND Cũ": parts[1] || "",
      "Họ và Tên": parts[2] || "",
      "Ngày Sinh": parts[3] || "",
      "Giới Tính": parts[4] || "",
      "Địa Chỉ": parts[5] || "",
      "Ngày Cấp": parts[6] || "",
      // ĐẶT TÊN CHÍNH XÁC CHO 3 TRƯỜNG THÔNG TIN CỦA THẺ MỚI
      "Họ Tên Vợ/Chồng": parts[7] || "",
      "Họ Tên Cha": parts[8] || "",
      "Họ Tên Mẹ": parts[9] || ""
    };
  } else {
    return { "Dữ liệu": cleanText };
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
// HÀM CẬP NHẬT BẢNG HIỂN THỊ
function updateTable() {
  const tbody = document.getElementById('table-body');
  tbody.innerHTML = "";

  scannedData.forEach((item, index) => {
    const tr = document.createElement('tr');

    if (item["Số CCCD"]) {
      const badgeColor = item["Loại Thẻ"] === "Thẻ Mới" ? "#28a745" : "#6c757d";
      const badgeHtml = `<span style="background-color: ${badgeColor}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">${item["Loại Thẻ"]}</span>`;

      tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${badgeHtml}</td>
                <td>${item["Số CCCD"]}</td>
                <td>${item["CMND Cũ"]}</td>
                <td>${item["Họ và Tên"]}</td>
                <td>${item["Ngày Sinh"]}</td>
                <td>${item["Giới Tính"]}</td>
                <td>${item["Địa Chỉ"]}</td>
                <td>${item["Ngày Cấp"]}</td>
                <!-- HIỂN THỊ DỮ LIỆU LÊN BẢNG -->
                <td>${item["Họ Tên Vợ/Chồng"]}</td>
                <td>${item["Họ Tên Cha"]}</td>
                <td>${item["Họ Tên Mẹ"]}</td>
            `;
    } else {
      tr.innerHTML = `
                <td>${index + 1}</td>
                <td colspan="12" style="color: #666; font-style: italic;">${item["Dữ liệu"]}</td>
            `;
    }
    tbody.appendChild(tr);
  });

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
// CHỨC NĂNG NHẬN DỮ LIỆU TỪ MÁY QUÉT CẦM TAY (PC/LAPTOP) - BẢN TRỰC QUAN
// ==========================================
let isDeviceScannerActive = false;
let scannerInput = null;

function setupHiddenInput() {
  if (!document.getElementById('scanner-hidden-input')) {
    scannerInput = document.createElement('input');
    scannerInput.type = 'text';
    scannerInput.id = 'scanner-hidden-input';

    // Giữ ô nhập thật tàng hình
    scannerInput.style.position = 'absolute';
    scannerInput.style.opacity = '0';
    scannerInput.style.left = '-9999px';
    document.body.appendChild(scannerInput);

    // LẮNG NGHE SỰ KIỆN 1: Bắt phím Enter chốt sổ
    scannerInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        let qrText = scannerInput.value.trim();

        if (qrText !== "") {
          processDeviceData(qrText);
        }

        // Dọn dẹp dữ liệu ở cả 2 ô sau khi quét xong
        scannerInput.value = "";
        document.getElementById('scanner-display').value = "";
      }
    });

    // LẮNG NGHE SỰ KIỆN 2: Phản chiếu ký tự ngay lập tức lên màn hình (Tính năng mới)
    scannerInput.addEventListener('input', function () {
      document.getElementById('scanner-display').value = scannerInput.value;
    });

    // Kéo con trỏ chuột về nếu lỡ click ra ngoài
    document.addEventListener('click', function () {
      if (isDeviceScannerActive) {
        scannerInput.focus();
      }
    });
  }
}

function toggleDeviceScanner() {
  setupHiddenInput();
  const btn = document.getElementById('device-btn');
  const displayContainer = document.getElementById('scanner-display-container');
  const displayBox = document.getElementById('scanner-display');

  isDeviceScannerActive = !isDeviceScannerActive;

  if (isDeviceScannerActive) {
    btn.innerText = "Đang Nhận QR... (Bấm Dừng)";
    btn.classList.add('active');

    // Hiện khung trực quan
    displayContainer.style.display = 'block';

    scannerInput.value = "";
    displayBox.value = "";
    scannerInput.focus();

    showToast("Sẵn sàng! Dữ liệu sẽ hiển thị trong khung viền tím.", "success");
  } else {
    btn.innerText = "Nhận Từ Máy Quét (PC)";
    btn.classList.remove('active');

    // Ẩn khung trực quan đi cho gọn
    displayContainer.style.display = 'none';

    scannerInput.blur();
    showToast("Đã tắt chế độ nhận từ máy quét.", "warning");
  }
}

function processDeviceData(qrText) {
  const personData = parseCCCD(qrText);

  if (personData["Số CCCD"]) {
    scannedData.push(personData);
    saveData();
    updateTable();
    showToast(`✅ Đã thêm: ${personData["Họ và Tên"]}`, 'success');
  } else {
    showToast(`❌ Lỗi: Mã QR không hợp lệ!`, 'error');
  }
}