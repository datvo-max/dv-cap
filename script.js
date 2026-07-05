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

    const config = {
        fps: 10,
        // Giảm kích thước khung quét một chút để người dùng đưa thẻ ra xa hơn, giúp lấy nét dễ hơn
        qrbox: { width: 220, height: 220 },
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
    };

    // ÉP ĐỘ PHÂN GIẢI CAO HƠN TẠI ĐÂY
    const cameraConstraints = {
        video: {
            facingMode: "environment",
            // Yêu cầu độ phân giải lý tưởng là 2K, nếu không được sẽ lùi về thấp hơn
            width: { ideal: 2560 },
            height: { ideal: 1440 }
        }
    };

    html5QrCode.start(cameraConstraints, config, (decodedText) => {
        const personData = parseCCCD(decodedText);
        scannedData.push(personData);

        updateTable();
        alert("Đã quét thành công: " + (personData["Họ và Tên"] || "Mã QR khác"));

        stopScanner();

    }).catch(err => {
        console.log("Lỗi khởi tạo camera:", err);
        // Nếu ép độ phân giải cao bị lỗi trên một số máy cũ, chúng ta sẽ lùi về cấu hình cơ bản
        console.log("Thử lại với cấu hình thấp...");
        retryScannerWithLowRes();
    });
}

// Hàm dự phòng nếu ép độ phân giải cao bị lỗi
function retryScannerWithLowRes() {
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    html5QrCode.start({ facingMode: "environment" }, config, (decodedText) => {
        const personData = parseCCCD(decodedText);
        scannedData.push(personData);
        updateTable();
        alert("Đã quét thành công: " + (personData["Họ và Tên"]));
        stopScanner();
    }).catch(err2 => {
        alert("Không thể mở camera: " + err2);
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