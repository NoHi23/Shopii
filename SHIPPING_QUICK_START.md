# 🚀 Hướng dẫn nhanh - Shipping Demo

## ⚡ Khởi động nhanh

### 1. Chạy ứng dụng
```bash
# Terminal 1
cd Shopii/back-end && npm start

# Terminal 2  
cd Shopii/front-end && npm start
```

### 2. Truy cập demo
```
http://localhost:3000/shipping-demo
```

## 🎯 Các bước sử dụng cơ bản

### Bước 1: Tạo mã vận đơn
1. Click **"📋 Chọn từ danh sách Order Items"**
2. Chọn order item từ danh sách hiển thị
3. Click **"Tạo mã vận đơn"**
4. Copy **Tracking Number** và **Shipping Info ID** từ kết quả

**💡 Tip:** Order Item ID sẽ được tự động điền khi bạn chọn từ danh sách!

### Bước 2: Cập nhật trạng thái
1. Paste **Shipping Info ID** vào ô input
2. Chọn trạng thái từ dropdown
3. Thêm vị trí và ghi chú (tùy chọn)
4. Click **"Cập nhật trạng thái"**

### Bước 3: Tra cứu vận chuyển
1. Paste **Tracking Number** vào ô input
2. Click **"Tra cứu"**
3. Xem thông tin chi tiết

## 📋 Danh sách trạng thái

| Trạng thái | Mô tả | Màu sắc |
|------------|-------|---------|
| `pending` | Chờ xử lý | 🟡 Warning |
| `processing` | Đang xử lý | 🔵 Info |
| `shipping` | Đang vận chuyển | 🔵 Primary |
| `in_transit` | Trong quá trình vận chuyển | 🟣 Secondary |
| `out_for_delivery` | Đang giao hàng | 🔵 Info |
| `delivered` | Đã giao hàng | 🟢 Success |
| `failed` | Giao hàng thất bại | 🔴 Error |
| `returned` | Đã hoàn trả | 🔴 Error |

## 🔧 Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách khắc phục |
|-----|-------------|----------------|
| "Order item not found" | ID không đúng | Kiểm tra lại Order Item ID |
| "Not authorized" | Chưa đăng nhập | Đăng nhập với tài khoản seller |
| "Tracking number already exists" | Đã có mã vận đơn | Dùng order item khác |
| "Invalid status" | Trạng thái sai | Chọn từ dropdown |

## 💡 Tips nhanh

- **Copy-paste**: Sử dụng copy-paste để tránh lỗi nhập liệu
- **Auto-fill**: Sau khi tạo mã vận đơn, các ID sẽ tự động điền
- **Color coding**: Trạng thái có màu sắc để dễ nhận biết
- **JSON viewer**: Xem response API chi tiết trong phần kết quả

## 📱 Mobile friendly

Giao diện hoạt động tốt trên mobile:
- Responsive design
- Touch-friendly buttons
- Dễ scroll và navigate

## 🔄 Workflow mẫu

```
Tạo mã vận đơn → Cập nhật "processing" → Cập nhật "shipping" → 
Cập nhật "in_transit" → Cập nhật "out_for_delivery" → Cập nhật "delivered"
```

---

**Need help?** Xem file `SHIPPING_UI_GUIDE.md` để có hướng dẫn chi tiết hơn.
