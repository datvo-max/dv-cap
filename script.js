let scannedData = []; // Mảng lưu trữ dữ liệu
let html5QrCode;

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

// Bắt đầu mở camera quét
function startScanner() {
    document.getElementById('reader').style.display = 'block';
    document.getElementById('start-btn').style.display = 'none';
    document.getElementById('stop-btn').style.display = 'inline-block';

    html5QrCode = new Html5Qrcode("reader");

    // Cấu hình an toàn, tương thích mọi trình duyệt
    const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 }
    };

    // Chỉ yêu cầu dùng camera sau, không ép tính năng nâng cao gây lỗi
    const cameraConstraints = {
        facingMode: "environment"
    };

    html5QrCode.start(cameraConstraints, config, (decodedText) => {
        // Khi quét thành công
        const personData = parseCCCD(decodedText);
        scannedData.push(personData);

        updateTable();
        alert("Đã quét thành công: " + (personData["Họ và Tên"] || "Mã QR khác"));

        stopScanner();

    }).catch(err => {
        console.log("Lỗi khởi tạo camera:", err);
        // Hiển thị trực tiếp mã lỗi để dễ kiểm tra
        alert("Không thể mở camera. Chi tiết lỗi: " + err);
    });
}

// Đóng camera
function stopScanner() {
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            document.getElementById('reader').style.display = 'none';
            document.getElementById('start-btn').style.display = 'inline-block';
            document.getElementById('stop-btn').style.display = 'none';
        }).catch(err => {
            console.log("Lỗi khi tắt camera: ", err);
        });
    }
}

// Cập nhật giao diện bảng
function updateTable() {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = ""; // Xóa cũ

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
                <td colspan="5">${item["Dữ liệu"]}</td>
            `;
        }
        tbody.appendChild(tr);
    });
}

// Xuất file Excel
function exportExcel() {
    if (scannedData.length === 0) {
        alert("Chưa có dữ liệu để xuất Excel!");
        return;
    }
    const worksheet = XLSX.utils.json_to_sheet(scannedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachCCCD");
    XLSX.writeFile(workbook, "Danh_Sach_CCCD.xlsx");
}