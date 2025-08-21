// Payment.jsx (Refactored)
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { createPayment, resetPayment } from "../../features/payment/paymentSlice"; // Bỏ các action không cần thiết
import { motion } from "framer-motion";
import {
  Box,
  Container,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Button,
  Paper,
  Divider,
  CircularProgress,
  Grid
} from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Lấy thông tin order từ location state
  const locationState = location.state || {};
  const orderId = locationState.orderId ? String(locationState.orderId) : null;
  const totalPrice = locationState.totalPrice || 0;
  console.log(totalPrice)
  const comingFromOrderPage = Boolean(locationState.directPayment);

  // Mặc định là PayPal nếu đến từ trang order, ngược lại là COD
  const preferredMethod = comingFromOrderPage ? 'PayPal' : 'COD';
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(preferredMethod);

  const { payment, loading, error, success } = useSelector((state) => state.payment);

  // Xử lý khi API createPayment thành công hoặc thất bại
  useEffect(() => {
    // Nếu tạo payment thành công
    if (success && payment) {
      if (selectedPaymentMethod === 'PayPal') {
        // Nếu có paymentUrl, chuyển hướng người dùng đến PayPal
        if (payment.paymentUrl) {
          toast.info("Đang chuyển hướng đến cổng thanh toán PayPal...");
          window.location.href = payment.paymentUrl;
        } else {
          toast.error("Không nhận được liên kết thanh toán từ PayPal.");
        }
      } else if (selectedPaymentMethod === 'COD') {
        toast.success("Đơn hàng COD đã được tạo thành công!");
        // Chuyển đến trang kết quả với trạng thái thành công
        navigate('/payment-result', {
          state: { status: 'paid', orderId: orderId },
          replace: true
        });
      }
    }

    // Nếu có lỗi
    if (error) {
      toast.error(error);
      dispatch(resetPayment()); // Reset lại state payment
    }

    // Cleanup: Reset state khi component unmount
    return () => {
      dispatch(resetPayment());
    }
  }, [success, error, payment, selectedPaymentMethod, dispatch, navigate, orderId]);


  // Nếu không có orderId, quay về trang chủ
  useEffect(() => {
    if (!orderId) {
      toast.error("Không tìm thấy thông tin đơn hàng.");
      navigate("/", { replace: true });
    }
  }, [orderId, navigate]);


  // Hàm xử lý khi nhấn nút thanh toán
  const handlePayment = () => {
    if (!orderId) {
      toast.error("Không tìm thấy thông tin đơn hàng.");
      return;
    }

    dispatch(createPayment({
      orderId: orderId,
      method: selectedPaymentMethod,
      replaceExisting: comingFromOrderPage
    }));
  };

  // UI cho các lựa chọn thanh toán
  const renderPaymentMethods = () => {
    if (comingFromOrderPage) {
      // Nếu đến từ trang order, chỉ hiển thị PayPal và không cho thay đổi
      return (
        <Paper variant="outlined" sx={{ mb: 2, p: 2, borderRadius: 2, borderColor: '#0F52BA' }}>
          <FormControlLabel
            value="PayPal"
            control={<Radio checked disabled />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PaymentIcon sx={{ mr: 1, color: '#0F52BA' }} />
                <Typography>PayPal</Typography>
              </Box>
            }
          />
        </Paper>
      );
    }

    // Hiển thị đầy đủ lựa chọn
    return (
      <RadioGroup
        value={selectedPaymentMethod}
        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
      >
        <Paper variant="outlined" sx={{ mb: 2, p: 2, borderRadius: 2, borderColor: selectedPaymentMethod === 'COD' ? '#0F52BA' : 'divider' }}>
          <FormControlLabel value="COD" control={<Radio />} label="Thanh toán khi nhận hàng (COD)" />
        </Paper>
        <Paper variant="outlined" sx={{ mb: 2, p: 2, borderRadius: 2, borderColor: selectedPaymentMethod === 'PayPal' ? '#0F52BA' : 'divider' }}>
          <FormControlLabel value="PayPal" control={<Radio />} label="Thanh toán qua PayPal" />
        </Paper>
      </RadioGroup>
    );
  };

  // Render component
  if (!orderId) {
    return <CircularProgress />; // Hiển thị loading trong khi redirect
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#0F52BA' }}>
          Chọn phương thức thanh toán
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <FormControl component="fieldset" sx={{ width: '100%' }}>
                {renderPaymentMethods()}
              </FormControl>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handlePayment}
                disabled={loading}
                sx={{ mt: 3, py: 1.5, backgroundColor: '#0F52BA', fontWeight: 600 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Tiến hành thanh toán'}
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} md={5}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <Typography variant="h5" fontWeight={600} mb={3}>
                Tóm tắt đơn hàng
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>Mã đơn hàng:</Typography>
                <Typography fontWeight={500}>{orderId}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Tổng cộng:</Typography>
                <Typography variant="h6" fontWeight={700} color="#0F52BA">
                  ${Number(totalPrice).toFixed(2)}
                </Typography>
              </Box>
            </Paper>
            <Button
              variant="text"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)} // Quay lại trang trước
              sx={{ mt: 2, color: '#0F52BA' }}
            >
              Quay lại
            </Button>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default Payment;