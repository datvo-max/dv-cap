let scannedData = []; // Mảng lưu trữ dữ liệu
let html5QrCode = null; // Khởi tạo biến toàn cục cho trình quét

// Hàm phân tích chuỗi QR của CCCD
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

// KHỞI ĐỘNG CAMERA QUÉT TỰ ĐỘNG
// KHỞI ĐỘNG CAMERA QUÉT TỰ ĐỘNG
function startScanner() {
  document.getElementById('reader').style.display = 'block';
  document.getElementById('start-btn').style.display = 'none';
  document.getElementById('stop-btn').style.display = 'inline-block';

  // Khởi tạo thực thể duy nhất nếu chưa có
  if (!html5QrCode) {
    html5QrCode = new Html5Qrcode("reader");
  }

  // Cấu hình khung quét
  const config = {
    fps: 10,
    qrbox: { width: 230, height: 230 },
    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
  };

  // ĐÃ SỬA: Xóa phần ép độ phân giải để tránh lỗi OverconstrainedError trên trình duyệt.
  // Chỉ yêu cầu sử dụng camera sau (environment).
  const cameraConstraints = {
    facingMode: "environment"
  };

  html5QrCode.start(cameraConstraints, config, (decodedText) => {
    // Khi quét tự động thành công
    const personData = parseCCCD(decodedText);
    scannedData.push(personData);

    updateTable();
    alert("Đã quét thành công: " + (personData["Họ và Tên"] || "Mã QR"));

    stopScanner();
  }).catch(err => {
    console.error("Lỗi mở camera tự động:", err);
    // Hiển thị thẳng mã lỗi ra màn hình để bắt bệnh nếu vẫn thất bại
    alert("Lỗi mở camera: " + (err.name || err.message || err) + "\n\nVui lòng dùng chức năng 'Chụp Ảnh Thẻ' tạm thời.");
    stopScanner();
  });
}

// TẮT CAMERA QUÉT TỰ ĐỘNG
function stopScanner() {
  if (html5QrCode && html5QrCode.isScanning) {
    html5QrCode.stop().then(() => {
      document.getElementById('reader').style.display = 'none';
      document.getElementById('start-btn').style.display = 'inline-block';
      document.getElementById('stop-btn').style.display = 'none';
    }).catch(err => {
      console.error("Lỗi khi dừng camera:", err);
    });
  } else {
    document.getElementById('reader').style.display = 'none';
    document.getElementById('start-btn').style.display = 'inline-block';
    document.getElementById('stop-btn').style.display = 'none';
  }
}

// CHỨC NĂNG CHỤP ẢNH THỦ CÔNG & XỬ LÝ ẢNH
function scanImage(event) {
  if (event.target.files.length === 0) return;
  const file = event.target.files[0];

  if (!html5QrCode) {
    html5QrCode = new Html5Qrcode("reader");
  }

  // Nếu camera tự động đang chạy thì tắt đi để tránh xung đột tài nguyên phần cứng
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

// Hàm bổ trợ xử lý đọc mã từ file ảnh tĩnh
function processImageFile(file, event) {
  html5QrCode.scanFile(file, false)
    .then(decodedText => {
      const personData = parseCCCD(decodedText);
      scannedData.push(personData); // Thêm vào mảng dữ liệu

      updateTable(); // Cập nhật lại bảng hiển thị

      // THAY ĐỔI: Dùng confirm để hỏi người dùng có muốn quét tiếp không
      const tiepTuc = confirm("Đã thêm thành công: " + (personData["Họ và Tên"] || "Dữ liệu QR") + "\n\nTiếp tục chụp thẻ tiếp theo?");

      event.target.value = ""; // Xóa dữ liệu cũ trong thẻ input

      // Nếu người dùng chọn OK, tự động mở lại camera gốc
      if (tiepTuc) {
        // Thêm một độ trễ nhỏ (300ms) để trình duyệt kịp đóng hộp thoại confirm trước khi gọi camera, tránh xung đột trên một số dòng máy.
        setTimeout(() => {
          document.getElementById('file-input').click();
        }, 300);
      }
    })
    .catch(err => {
      console.error("Lỗi phân tích mã QR từ ảnh:", err);

      // Tương tự, nếu lỗi cũng hỏi xem có muốn chụp lại luôn không
      const thuLai = confirm("Không tìm thấy mã QR hợp lệ trong ảnh.\nMẹo: Hãy đưa máy sát thẻ và đợi ống kính lấy nét chữ thật rõ.\n\nBạn có muốn chụp lại ngay không?");

      event.target.value = "";

      if (thuLai) {
        setTimeout(() => {
          document.getElementById('file-input').click();
        }, 300);
      }
    });
}

// CẬP NHẬT GIAO DIỆN BẢNG HIỂN THỊ
function updateTable() {
  const tbody = document.getElementById('table-body');
  tbody.innerHTML = ""; // Xóa dữ liệu cũ trên màn hình

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

// XUẤT FILE EXCEL
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