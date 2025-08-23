import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Grid,
  Alert,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  CardMedia
} from '@mui/material';
import {
  createTrackingNumber,
  updateShippingStatus,
  getSellerShipments,
  getShippingStats,
  getSellerOrderItems,
  resetCancelledOrders,
  debugShippingInfo
} from '../../services/shippingService';

const ShippingTest = () => {
  const { token, user } = useSelector(state => state.auth);
  const [orderItemId, setOrderItemId] = useState('');
  const [shippingInfoId, setShippingInfoId] = useState('');
  const [status, setStatus] = useState('pending');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [shipments, setShipments] = useState([]);
  const [stats, setStats] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [showOrderItemsModal, setShowOrderItemsModal] = useState(false);

  const statusOptions = [
    'pending',
    'processing',
    'shipping',
    'in_transit',
    'out_for_delivery',
    'delivered',
    'failed',
    'returned'
  ];

  // Tạo mã vận đơn
  const handleCreateTracking = async () => {
    try {
      setError('');
      const response = await createTrackingNumber(orderItemId, token);
      setResult(response);
      setShippingInfoId(response.data.shippingInfo._id);
    } catch (err) {
      setError(err.message);
    }
  };

  // Cập nhật trạng thái
  const handleUpdateStatus = async () => {
    try {
      setError('');
      const updateData = { status };
      if (location) updateData.location = location;
      if (notes) updateData.notes = notes;
      
      const response = await updateShippingStatus(shippingInfoId, updateData, token);
      setResult(response);
    } catch (err) {
      setError(err.message);
    }
  };



  // Lấy danh sách vận chuyển
  const handleGetShipments = async () => {
    try {
      setError('');
      const response = await getSellerShipments({ page: 1, limit: 10 }, token);
      setShipments(response.data.shipments);
      setResult(response);
    } catch (err) {
      setError(err.message);
    }
  };

  // Lấy thống kê
  const handleGetStats = async () => {
    try {
      setError('');
      const response = await getShippingStats(token);
      setStats(response.data);
      setResult(response);
    } catch (err) {
      setError(err.message);
    }
  };

  // Lấy danh sách order items
  const handleGetOrderItems = async () => {
    try {
      setError('');
      const response = await getSellerOrderItems({ page: 1, limit: 20 }, token);
      setOrderItems(response.data.orderItems);
      setShowOrderItemsModal(true);
      setResult(response);
    } catch (err) {
      setError(err.message);
    }
  };

  // Chọn order item
  const handleSelectOrderItem = (orderItem) => {
    setOrderItemId(orderItem._id);
    setShowOrderItemsModal(false);
  };

  // Reset cancelled orders
  const handleResetCancelledOrders = async () => {
    try {
      setError('');
      const response = await resetCancelledOrders(token);
      setResult(response);
      // Refresh order items list
      if (showOrderItemsModal) {
        handleGetOrderItems();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Debug shipping info
  const handleDebugShippingInfo = async () => {
    try {
      setError('');
      const response = await debugShippingInfo(token);
      setResult(response);
      
      // Auto-fill shipping info ID if there's only one
      if (response.data && response.data.shippingInfos && response.data.shippingInfos.length === 1) {
        setShippingInfoId(response.data.shippingInfos[0]._id);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      processing: 'info',
      shipping: 'primary',
      in_transit: 'secondary',
      out_for_delivery: 'info',
      delivered: 'success',
      failed: 'error',
      returned: 'error',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Shipping API Test
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Tạo mã vận đơn */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tạo mã vận đơn
              </Typography>
              <TextField
                fullWidth
                label="Order Item ID"
                value={orderItemId}
                onChange={(e) => setOrderItemId(e.target.value)}
                sx={{ mb: 2 }}
                helperText="Nhập Order Item ID hoặc chọn từ danh sách bên dưới"
              />
              <Button
                variant="outlined"
                onClick={handleGetOrderItems}
                fullWidth
                sx={{ mb: 2 }}
              >
                📋 Chọn từ danh sách Order Items
              </Button>
              <Button
                variant="contained"
                onClick={handleCreateTracking}
                disabled={!orderItemId}
                fullWidth
              >
                Tạo mã vận đơn
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Cập nhật trạng thái */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cập nhật trạng thái
              </Typography>
              <TextField
                fullWidth
                label="Shipping Info ID"
                value={shippingInfoId}
                onChange={(e) => setShippingInfoId(e.target.value)}
                sx={{ mb: 2 }}
                helperText="Nhập Shipping Info ID hoặc sử dụng debug để tự động điền"
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  label="Trạng thái"
                >
                  {statusOptions.map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Vị trí (tùy chọn)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Ghi chú (tùy chọn)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                onClick={handleUpdateStatus}
                disabled={!shippingInfoId}
                fullWidth
              >
                Cập nhật trạng thái
              </Button>
            </CardContent>
          </Card>
        </Grid>



        {/* Thống kê */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thống kê vận chuyển
              </Typography>
              <Button
                variant="contained"
                onClick={handleGetStats}
                fullWidth
                sx={{ mb: 2 }}
              >
                Lấy thống kê
              </Button>
              <Button
                variant="outlined"
                onClick={handleGetShipments}
                fullWidth
                sx={{ mb: 2 }}
              >
                Lấy danh sách vận chuyển
              </Button>
              <Button
                variant="outlined"
                color="warning"
                onClick={handleResetCancelledOrders}
                fullWidth
                sx={{ mb: 2 }}
              >
                🔄 Reset Cancelled Orders
              </Button>
              <Button
                variant="outlined"
                color="info"
                onClick={handleDebugShippingInfo}
                fullWidth
                sx={{ mb: 2 }}
              >
                🔍 Debug Shipping Info
              </Button>
              {result?.data?.shippingInfos && result.data.shippingInfos.length > 0 && (
                <Button
                  variant="outlined"
                  color="success"
                  onClick={() => setShippingInfoId(result.data.shippingInfos[0]._id)}
                  fullWidth
                >
                  📋 Copy Shipping Info ID: {result.data.shippingInfos[0]._id.slice(-8)}
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Kết quả */}
      {result && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Kết quả API
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <pre style={{ overflow: 'auto', maxHeight: '400px' }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </Paper>
          </CardContent>
        </Card>
      )}

      {/* Thống kê */}
      {stats && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Thống kê vận chuyển
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Typography variant="h4" color="primary">
                  {stats.totalShipments}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tổng đơn vận chuyển
                </Typography>
              </Grid>
              {Object.entries(stats.summary).map(([key, value]) => (
                <Grid item xs={12} md={3} key={key}>
                  <Typography variant="h4" color={`${getStatusColor(key)}.main`}>
                    {value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {key}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Danh sách vận chuyển */}
      {shipments.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Danh sách vận chuyển
            </Typography>
            <List>
              {shipments.map((shipment, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box>
                          <Typography variant="subtitle1">
                            {shipment.orderItemId?.productId?.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Tracking: {shipment.trackingNumber}
                          </Typography>
                          <Chip
                            label={shipment.status}
                            color={getStatusColor(shipment.status)}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2">
                          Buyer: {shipment.orderItemId?.orderId?.buyerId?.fullname}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < shipments.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Modal chọn Order Item */}
      <Dialog
        open={showOrderItemsModal}
        onClose={() => setShowOrderItemsModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          📋 Chọn Order Item để tạo mã vận đơn
        </DialogTitle>
        <DialogContent>
          {orderItems.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Không có order items nào. Hãy tạo đơn hàng trước!
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {orderItems.map((item) => (
                <Grid item xs={12} key={item._id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: item.hasShippingInfo ? '2px solid #ff9800' : '1px solid #e0e0e0',
                      '&:hover': { borderColor: '#1976d2' }
                    }}
                    onClick={() => handleSelectOrderItem(item)}
                  >
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={2}>
                          {item.productId?.image ? (
                            <CardMedia
                              component="img"
                              image={item.productId.image}
                              alt={item.productId.title}
                              sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
                            />
                          ) : (
                            <Avatar sx={{ width: 60, height: 60 }}>
                              📦
                            </Avatar>
                          )}
                        </Grid>
                        <Grid item xs={7}>
                          <Typography variant="h6" noWrap>
                            {item.productId?.title || 'Sản phẩm không tên'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Buyer: {item.orderId?.buyerId?.fullname || 'Không xác định'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Order ID: {item.orderId?._id || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Quantity: {item.quantity} | Price: ${item.price}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Box sx={{ textAlign: 'right' }}>
                            <Chip
                              label={item.status}
                              color={getStatusColor(item.status)}
                              size="small"
                              sx={{ mb: 1 }}
                            />
                            {item.hasShippingInfo && (
                              <Chip
                                label="Đã có tracking"
                                color="warning"
                                size="small"
                                variant="outlined"
                              />
                            )}
                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                              ID: {item._id.slice(-8)}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowOrderItemsModal(false)}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShippingTest;
