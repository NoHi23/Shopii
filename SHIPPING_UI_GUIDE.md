# Hướng dẫn sử dụng giao diện vận chuyển - Shopii

## 📋 Mục lục
1. [Tổng quan](#tổng-quan)
2. [Cách truy cập](#cách-truy-cập)
3. [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)
4. [Các tính năng chính](#các-tính-năng-chính)
5. [Troubleshooting](#troubleshooting)

## 🎯 Tổng quan

Giao diện vận chuyển của Shopii cung cấp các công cụ để:
- Tạo mã vận đơn cho đơn hàng
- Cập nhật trạng thái vận chuyển
- Tra cứu thông tin vận chuyển
- Xem thống kê và danh sách vận chuyển

## 🚀 Cách truy cập

### Bước 1: Khởi động ứng dụng
```bash
# Terminal 1 - Khởi động Backend
cd Shopii/back-end
npm start

# Terminal 2 - Khởi động Frontend  
cd Shopii/front-end
npm start
```

### Bước 2: Truy cập trang demo
Mở trình duyệt và truy cập:
```
http://localhost:3000/shipping-demo
```

### Bước 3: Đăng nhập (nếu cần)
Nếu bạn chưa đăng nhập, hãy đăng nhập với tài khoản seller để có thể sử dụng đầy đủ tính năng.

## 📖 Hướng dẫn sử dụng

### 1. Tạo mã vận đơn mới

#### Bước 1: Chuẩn bị dữ liệu
- Bạn cần có order items trong hệ thống
- Order Item phải thuộc về seller đang đăng nhập

#### Bước 2: Chọn Order Item
1. Trong phần **"Tạo mã vận đơn"**
2. Click nút **"📋 Chọn từ danh sách Order Items"**
3. Chọn order item từ danh sách hiển thị
4. Order Item ID sẽ được tự động điền

#### Bước 3: Tạo mã vận đơn
1. Click nút **"Tạo mã vận đơn"**

#### Bước 4: Kết quả
- Mã vận đơn sẽ được tạo tự động (format: `SHOPII` + timestamp + random)
- Thông tin chi tiết hiển thị trong phần **"Kết quả API"**
- Mã vận đơn và Shipping Info ID sẽ được tự động điền vào các form khác

**Ví dụ kết quả:**
```
Tracking Number: SHOPII12345678901234
Status: pending
Shipping Info ID: 64f8a1b2c3d4e5f6a7b8c9d1
```

### 2. Cập nhật trạng thái vận chuyển

#### Bước 1: Nhập Shipping Info ID
- Sử dụng ID từ kết quả tạo mã vận đơn
- Hoặc nhập ID thủ công nếu đã có

#### Bước 2: Chọn trạng thái
Các trạng thái có sẵn:
- **pending** - Chờ xử lý
- **processing** - Đang xử lý
- **shipping** - Đang vận chuyển
- **in_transit** - Trong quá trình vận chuyển
- **out_for_delivery** - Đang giao hàng
- **delivered** - Đã giao hàng
- **failed** - Giao hàng thất bại
- **returned** - Đã hoàn trả

#### Bước 3: Thêm thông tin (tùy chọn)
- **Vị trí**: Nhập địa điểm hiện tại của hàng hóa
- **Ghi chú**: Thêm thông tin bổ sung

#### Bước 4: Cập nhật
Click nút **"Cập nhật trạng thái"**

### 3. Tra cứu vận chuyển

#### Bước 1: Nhập mã vận đơn
- Nhập mã vận đơn vào ô input
- Ví dụ: `SHOPII12345678901234`

#### Bước 2: Tra cứu
Click nút **"Tra cứu"**

#### Bước 3: Xem kết quả
Thông tin hiển thị bao gồm:
- Trạng thái hiện tại
- Lịch sử trạng thái
- Thông tin người mua
- Thông tin sản phẩm

### 4. Xem thống kê vận chuyển

#### Bước 1: Lấy thống kê
Click nút **"Lấy thống kê"**

#### Bước 2: Xem kết quả
Thống kê hiển thị:
- Tổng số đơn vận chuyển
- Số lượng theo từng trạng thái
- Biểu đồ phân bố trạng thái

### 5. Xem danh sách vận chuyển

#### Bước 1: Lấy danh sách
Click nút **"Lấy danh sách vận chuyển"**

#### Bước 2: Xem kết quả
Danh sách hiển thị:
- Tên sản phẩm
- Mã vận đơn
- Trạng thái (với màu sắc)
- Thông tin người mua

## 🎨 Các tính năng chính

### 1. Giao diện trực quan
- **Cards layout**: Mỗi chức năng được chia thành card riêng biệt
- **Color coding**: Trạng thái được hiển thị với màu sắc khác nhau
- **Responsive design**: Hoạt động tốt trên mobile và desktop

### 2. Tự động điền thông tin
- Khi tạo mã vận đơn thành công, các ID sẽ được tự động điền
- Khi chọn order item từ danh sách, Order Item ID sẽ được tự động điền
- Giảm thiểu lỗi nhập liệu thủ công

### 3. Hiển thị kết quả chi tiết
- **JSON viewer**: Hiển thị response API đầy đủ
- **Thống kê trực quan**: Biểu đồ và số liệu dễ đọc
- **Danh sách có phân trang**: Dễ dàng xem nhiều đơn hàng

### 4. Xử lý lỗi thân thiện
- **Alert messages**: Thông báo lỗi rõ ràng
- **Validation**: Kiểm tra dữ liệu đầu vào
- **Loading states**: Hiển thị trạng thái đang xử lý

## 🔧 Troubleshooting

### Lỗi thường gặp và cách khắc phục

#### 1. "Order item not found"
**Nguyên nhân:** Order Item ID không tồn tại hoặc không thuộc về seller
**Cách khắc phục:**
- Sử dụng nút "Chọn từ danh sách Order Items" thay vì nhập thủ công
- Đảm bảo đã đăng nhập với tài khoản seller đúng
- Kiểm tra xem có order items nào trong hệ thống không

#### 2. "Not authorized"
**Nguyên nhân:** Không có quyền truy cập
**Cách khắc phục:**
- Đăng nhập lại với tài khoản seller
- Kiểm tra token authentication
- Đảm bảo order item thuộc về seller đang đăng nhập

#### 3. "Tracking number already exists"
**Nguyên nhân:** Order item đã có mã vận đơn
**Cách khắc phục:**
- Sử dụng order item khác
- Hoặc cập nhật trạng thái của shipping info hiện có

#### 4. "Invalid status"
**Nguyên nhân:** Trạng thái không hợp lệ
**Cách khắc phục:**
- Chọn trạng thái từ danh sách có sẵn
- Kiểm tra spelling của trạng thái

#### 5. Không thể kết nối API
**Nguyên nhân:** Backend chưa khởi động hoặc lỗi mạng
**Cách khắc phục:**
- Kiểm tra backend đã chạy chưa
- Kiểm tra URL API trong environment variables
- Kiểm tra console để xem lỗi chi tiết

### Kiểm tra trạng thái hệ thống

#### 1. Kiểm tra Backend
```bash
curl http://localhost:9999/api/shipping/track/TEST
```
Nếu trả về lỗi 404 là bình thường, nhưng nếu lỗi connection thì backend chưa chạy.

#### 2. Kiểm tra Frontend
Mở Developer Tools (F12) và xem tab Console để kiểm tra lỗi JavaScript.

#### 3. Kiểm tra Network
Trong Developer Tools, tab Network để xem các request API có thành công không.

## 📱 Sử dụng trên Mobile

Giao diện được thiết kế responsive và hoạt động tốt trên mobile:

### Tối ưu cho mobile:
- **Touch-friendly buttons**: Các nút đủ lớn để dễ chạm
- **Responsive layout**: Tự động điều chỉnh theo kích thước màn hình
- **Scroll-friendly**: Có thể scroll dễ dàng trên mobile

### Cách sử dụng trên mobile:
1. Mở trình duyệt mobile
2. Truy cập `http://localhost:3000/shipping-demo`
3. Sử dụng như trên desktop

## 🔄 Workflow điển hình

### Workflow 1: Xử lý đơn hàng mới
1. **Tạo mã vận đơn** cho order item
2. **Cập nhật trạng thái** thành "processing"
3. **Cập nhật trạng thái** thành "shipping" khi giao cho đơn vị vận chuyển
4. **Cập nhật trạng thái** thành "in_transit" khi hàng đang vận chuyển
5. **Cập nhật trạng thái** thành "out_for_delivery" khi đang giao hàng
6. **Cập nhật trạng thái** thành "delivered" khi giao hàng thành công

### Workflow 2: Xử lý đơn hàng có vấn đề
1. **Cập nhật trạng thái** thành "failed" nếu giao hàng thất bại
2. **Cập nhật trạng thái** thành "returned" nếu khách hàng trả hàng
3. Thêm **ghi chú** để giải thích lý do

### Workflow 3: Tra cứu và báo cáo
1. **Tra cứu vận chuyển** để kiểm tra trạng thái
2. **Xem thống kê** để báo cáo
3. **Xem danh sách** để quản lý nhiều đơn hàng

## 💡 Tips và Tricks

### 1. Sử dụng hiệu quả
- **Chọn từ danh sách**: Sử dụng nút "Chọn từ danh sách Order Items" thay vì nhập ID thủ công
- **Copy-paste ID**: Sử dụng copy-paste để tránh lỗi nhập liệu
- **Bookmark trang**: Bookmark để truy cập nhanh
- **Refresh định kỳ**: Refresh để cập nhật dữ liệu mới nhất

### 2. Quản lý dữ liệu
- **Lưu tracking number**: Lưu lại tracking number để tra cứu sau
- **Ghi chú chi tiết**: Thêm ghi chú để dễ theo dõi
- **Cập nhật thường xuyên**: Cập nhật trạng thái kịp thời

### 3. Troubleshooting nhanh
- **Clear cache**: Xóa cache nếu gặp lỗi
- **Check console**: Kiểm tra console để xem lỗi chi tiết
- **Restart app**: Khởi động lại app nếu cần

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy:
1. Kiểm tra phần Troubleshooting trước
2. Xem console log để tìm lỗi chi tiết
3. Kiểm tra network requests
4. Restart cả backend và frontend

---

**Lưu ý:** Đây là giao diện demo, trong môi trường production sẽ có thêm các tính năng bảo mật và validation chặt chẽ hơn.
