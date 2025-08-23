# 🎯 Cách lấy Order Item ID - Đơn giản!

## ❓ Vấn đề
Bạn không biết Order Item ID ở đâu? Không sao! Chúng tôi đã tạo cách dễ dàng hơn.

## ✅ Giải pháp: Chọn từ danh sách

### Bước 1: Click nút "Chọn từ danh sách"
![Chọn từ danh sách](https://via.placeholder.com/400x100/4CAF50/FFFFFF?text=📋+Chọn+từ+danh+sách+Order+Items)

### Bước 2: Chọn Order Item
- Danh sách sẽ hiển thị tất cả order items của bạn
- Mỗi item hiển thị:
  - 🖼️ Hình ảnh sản phẩm
  - 📝 Tên sản phẩm
  - 👤 Tên người mua
  - 💰 Giá và số lượng
  - 🏷️ Trạng thái hiện tại
  - 🔢 ID ngắn gọn

### Bước 3: Click vào item muốn chọn
- Order Item ID sẽ được tự động điền
- Không cần nhập thủ công!

## 🎨 Giao diện danh sách

```
┌─────────────────────────────────────────────────────────┐
│ 📦 [Hình ảnh]  iPhone 15 Pro Max                        │
│    Buyer: Nguyễn Văn A                                  │
│    Order ID: 64f8a1b2c3d4e5f6                          │
│    Quantity: 1 | Price: $999                            │
│                                    [pending] [Đã có tracking] │
│                                    ID: a1b2c3d4         │
└─────────────────────────────────────────────────────────┘
```

## 🔍 Các trạng thái hiển thị

| Trạng thái | Màu sắc | Ý nghĩa |
|------------|---------|---------|
| `pending` | 🟡 | Chờ xử lý |
| `processing` | 🔵 | Đang xử lý |
| `shipping` | 🔵 | Đang vận chuyển |
| `delivered` | 🟢 | Đã giao hàng |
| `failed` | 🔴 | Giao hàng thất bại |
| `cancelled` | 🔴 | Đã hủy (tự động sau 30 phút) |

## ⚠️ Lưu ý quan trọng

### ✅ Có thể tạo tracking
- Items chưa có tracking number
- Border màu xám nhạt

### ⚠️ Đã có tracking
- Items đã có tracking number
- Border màu cam
- Chip "Đã có tracking"

## 🚀 Workflow hoàn chỉnh

1. **Truy cập demo**: `http://localhost:3000/shipping-demo`
2. **Đăng nhập**: Với tài khoản seller
3. **Chọn Order Item**: Click "📋 Chọn từ danh sách Order Items"
4. **Tạo tracking**: Click "Tạo mã vận đơn"
5. **Cập nhật trạng thái**: Sử dụng Shipping Info ID được tạo

## 💡 Tips

- **Refresh danh sách**: Nếu không thấy order items mới
- **Kiểm tra quyền**: Đảm bảo đã đăng nhập với tài khoản seller
- **Tạo đơn hàng**: Nếu chưa có order items nào

## 🔧 Nếu vẫn gặp vấn đề

### Order items hiển thị "cancelled"
- Đơn hàng bị hủy tự động sau 30 phút nếu chưa thanh toán
- **Giải pháp**: Click nút "🔄 Reset Cancelled Orders" để reset về pending
- Hoặc tạo đơn hàng mới

### Không có order items nào
1. Tạo sản phẩm mới
2. Tạo đơn hàng test
3. Hoặc sử dụng dữ liệu mẫu

### Không thể đăng nhập
1. Kiểm tra backend đã chạy chưa
2. Kiểm tra tài khoản seller
3. Xem console để debug

---

**🎉 Bây giờ việc lấy Order Item ID thật dễ dàng!**
