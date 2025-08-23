# Shipping API Documentation

## Tổng quan
API vận chuyển giả lập cho hệ thống Shopii, cung cấp các chức năng tạo mã vận đơn và cập nhật trạng thái giao hàng.

## Base URL
```
http://localhost:9999/api/shipping
```

## Authentication
Tất cả API (trừ tra cứu vận chuyển) yêu cầu JWT token trong header:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 1. Tạo mã vận đơn mới
**POST** `/create-tracking`

Tạo mã vận đơn mới cho một order item.

**Request Body:**
```json
{
  "orderItemId": "64f8a1b2c3d4e5f6a7b8c9d0"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tracking number created successfully",
  "data": {
    "trackingNumber": "SHOPII12345678901234",
    "shippingInfo": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "orderItemId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "trackingNumber": "SHOPII12345678901234",
      "status": "pending",
      "carrier": "Shopii Express",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "orderItem": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "status": "processing"
    }
  }
}
```

### 2. Cập nhật trạng thái vận chuyển
**PUT** `/update-status/:shippingInfoId`

Cập nhật trạng thái vận chuyển và thêm vào lịch sử.

**Request Body:**
```json
{
  "status": "shipping",
  "location": "Hà Nội",
  "notes": "Đã giao cho đơn vị vận chuyển"
}
```

**Trạng thái hợp lệ:**
- `pending` - Chờ xử lý
- `processing` - Đang xử lý
- `shipping` - Đang vận chuyển
- `in_transit` - Trong quá trình vận chuyển
- `out_for_delivery` - Đang giao hàng
- `delivered` - Đã giao hàng
- `failed` - Giao hàng thất bại
- `returned` - Đã hoàn trả

**Response:**
```json
{
  "success": true,
  "message": "Shipping status updated successfully",
  "data": {
    "shippingInfo": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "status": "shipping",
      "location": "Hà Nội",
      "notes": "Đã giao cho đơn vị vận chuyển",
      "statusHistory": [
        {
          "status": "shipping",
          "location": "Hà Nội",
          "notes": "Đã giao cho đơn vị vận chuyển",
          "timestamp": "2024-01-15T10:35:00.000Z"
        }
      ]
    },
    "orderItem": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "status": "shipping"
    }
  }
}
```

### 3. Tra cứu vận chuyển (Public)
**GET** `/track/:trackingNumber`

Tra cứu thông tin vận chuyển theo mã vận đơn (không cần authentication).

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "trackingNumber": "SHOPII12345678901234",
    "status": "shipping",
    "location": "Hà Nội",
    "carrier": "Shopii Express",
    "statusHistory": [
      {
        "status": "pending",
        "timestamp": "2024-01-15T10:30:00.000Z"
      },
      {
        "status": "shipping",
        "location": "Hà Nội",
        "notes": "Đã giao cho đơn vị vận chuyển",
        "timestamp": "2024-01-15T10:35:00.000Z"
      }
    ],
    "orderItemId": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "orderId": {
        "buyerId": {
          "username": "buyer123",
          "fullname": "Nguyễn Văn A",
          "email": "buyer@example.com"
        }
      },
      "productId": {
        "title": "Sản phẩm A",
        "image": "product-image.jpg"
      }
    }
  }
}
```

### 4. Lấy danh sách vận chuyển của seller
**GET** `/seller-shipments`

Lấy danh sách tất cả vận chuyển của seller với phân trang.

**Query Parameters:**
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số item mỗi trang (default: 10)
- `status` (optional): Lọc theo trạng thái

**Response:**
```json
{
  "success": true,
  "data": {
    "shipments": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "trackingNumber": "SHOPII12345678901234",
        "status": "shipping",
        "orderItemId": {
          "orderId": {
            "buyerId": {
              "username": "buyer123",
              "fullname": "Nguyễn Văn A",
              "email": "buyer@example.com"
            }
          },
          "productId": {
            "title": "Sản phẩm A",
            "image": "product-image.jpg",
            "price": 100000
          }
        }
      }
    ],
    "pagination": {
      "current": 1,
      "pageSize": 10,
      "total": 25
    }
  }
}
```

### 5. Lấy thống kê vận chuyển của seller
**GET** `/seller-stats`

Lấy thống kê vận chuyển của seller.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalShipments": 25,
    "statusStats": {
      "pending": 5,
      "processing": 3,
      "shipping": 8,
      "delivered": 7,
      "failed": 1,
      "returned": 1
    },
    "summary": {
      "pending": 5,
      "processing": 3,
      "shipping": 8,
      "delivered": 7,
      "failed": 1,
      "returned": 1
    }
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid status. Must be one of: pending, processing, shipping, in_transit, out_for_delivery, delivered, failed, returned"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Not authorized to create tracking for this order"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Tracking number not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Cách sử dụng

### 1. Tạo mã vận đơn
```javascript
const response = await fetch('/api/shipping/create-tracking', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    orderItemId: '64f8a1b2c3d4e5f6a7b8c9d0'
  })
});
```

### 2. Cập nhật trạng thái
```javascript
const response = await fetch('/api/shipping/update-status/64f8a1b2c3d4e5f6a7b8c9d1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    status: 'delivered',
    location: 'TP.HCM',
    notes: 'Đã giao hàng thành công'
  })
});
```

### 3. Tra cứu vận chuyển
```javascript
const response = await fetch('/api/shipping/track/SHOPII12345678901234');
const data = await response.json();
```

## Demo
Truy cập `/shipping-demo` để test các API vận chuyển với giao diện trực quan.

## Lưu ý
- Mã vận đơn được tạo tự động với format: `SHOPII` + timestamp + random number
- Mỗi order item chỉ có thể có một shipping info
- Trạng thái order item sẽ được cập nhật tự động theo trạng thái vận chuyển
- Lịch sử trạng thái được lưu trữ trong `statusHistory`
