# 📦 Shipping System - Shopii

## 📋 Tổng quan

Hệ thống vận chuyển giả lập cho Shopii, cung cấp đầy đủ các chức năng quản lý vận chuyển từ tạo mã vận đơn đến theo dõi trạng thái giao hàng.

## 🚀 Khởi động nhanh

### 1. Cài đặt dependencies
```bash
# Backend
cd Shopii/back-end
npm install

# Frontend
cd Shopii/front-end  
npm install
```

### 2. Khởi động ứng dụng
```bash
# Terminal 1 - Backend
cd Shopii/back-end
npm start

# Terminal 2 - Frontend
cd Shopii/front-end
npm start
```

### 3. Truy cập demo
```
http://localhost:3000/shipping-demo
```

## 📚 Tài liệu

### 🎯 Cho người dùng cuối
- **[Quick Start Guide](SHIPPING_QUICK_START.md)** - Hướng dẫn nhanh để bắt đầu
- **[UI Guide](SHIPPING_UI_GUIDE.md)** - Hướng dẫn chi tiết sử dụng giao diện

### 🔧 Cho developer
- **[API Documentation](back-end/SHIPPING_API_README.md)** - Tài liệu API chi tiết
- **[Test Script](back-end/test-shipping-api.js)** - Script test API

## 🎨 Tính năng chính

### ✅ Đã hoàn thành
- [x] Tạo mã vận đơn tự động
- [x] Cập nhật trạng thái vận chuyển
- [x] Tra cứu vận chuyển (public)
- [x] Quản lý danh sách vận chuyển
- [x] Thống kê vận chuyển
- [x] Lịch sử trạng thái
- [x] Giao diện demo trực quan
- [x] Phân quyền seller/buyer
- [x] Validation và error handling
- [x] Responsive design

### 🔄 Workflow điển hình
```
Order Item → Tạo mã vận đơn → Cập nhật trạng thái → Tra cứu → Thống kê
```

## 🏗️ Kiến trúc hệ thống

### Backend (Node.js + Express)
```
src/
├── controllers/
│   └── shippingController.js    # Logic xử lý
├── routes/
│   └── shippingRoutes.js        # Định nghĩa routes
├── models/
│   └── ShippingInfo.js          # Schema database
└── routers/
    └── index.js                 # Router chính
```

### Frontend (React + Material-UI)
```
src/
├── components/
│   └── ShippingTest/
│       └── ShippingTest.jsx     # Component demo
├── pages/
│   └── ShippingDemo/
│       └── ShippingDemo.jsx     # Trang demo
├── services/
│   └── shippingService.js       # Service gọi API
└── App.js                       # Routing
```

## 🔌 API Endpoints

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/shipping/create-tracking` | Tạo mã vận đơn | ✅ |
| PUT | `/api/shipping/update-status/:id` | Cập nhật trạng thái | ✅ |
| GET | `/api/shipping/track/:number` | Tra cứu vận chuyển | ❌ |
| GET | `/api/shipping/seller-shipments` | Danh sách vận chuyển | ✅ |
| GET | `/api/shipping/seller-stats` | Thống kê | ✅ |

## 📊 Database Schema

### ShippingInfo Model
```javascript
{
  orderItemId: ObjectId,        // Reference to OrderItem
  trackingNumber: String,       // Unique tracking number
  status: String,               // Current status
  location: String,             // Current location
  notes: String,                // Additional notes
  carrier: String,              // Shipping carrier
  statusHistory: Array,         // Status change history
  estimatedArrival: Date,       // Estimated delivery date
  createdAt: Date,              // Creation timestamp
  updatedAt: Date               // Last update timestamp
}
```

## 🎯 Trạng thái vận chuyển

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

## 🧪 Testing

### Chạy test API
```bash
cd Shopii/back-end
node test-shipping-api.js
```

### Test thủ công
1. Truy cập `http://localhost:3000/shipping-demo`
2. Đăng nhập với tài khoản seller
3. Test các chức năng theo hướng dẫn

## 🔧 Troubleshooting

### Lỗi thường gặp
1. **"Order item not found"** - Kiểm tra Order Item ID
2. **"Not authorized"** - Đăng nhập với tài khoản seller
3. **"Tracking number already exists"** - Dùng order item khác
4. **Connection error** - Kiểm tra backend đã chạy chưa

### Debug
```bash
# Kiểm tra backend
curl http://localhost:9999/api/shipping/track/TEST

# Kiểm tra frontend console
# Mở Developer Tools (F12) → Console
```

## 📱 Mobile Support

- ✅ Responsive design
- ✅ Touch-friendly interface
- ✅ Mobile-optimized layout
- ✅ Cross-browser compatibility

## 🔒 Security

- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ CORS configuration

## 🚀 Deployment

### Environment Variables
```bash
# Backend (.env)
PORT=9999
MONGO_URI=mongodb://localhost:27017/shopii
JWT_SECRET=your-jwt-secret

# Frontend (.env)
REACT_APP_API_URL=http://localhost:9999
```

### Production Build
```bash
# Frontend
cd Shopii/front-end
npm run build

# Backend
cd Shopii/back-end
npm start
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

This project is part of the Shopii e-commerce platform.

## 📞 Support

- 📧 Email: support@shopii.com
- 📱 Phone: +84 123 456 789
- 🌐 Website: https://shopii.com

---

**Made with ❤️ for Shopii Team**
