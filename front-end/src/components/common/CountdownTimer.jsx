import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Alert, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningIcon from '@mui/icons-material/Warning';
import { motion } from 'framer-motion';

const CountdownTimer = ({ 
  initialTime = 300, // 5 phút = 300 giây
  onTimeExpired,
  orderId,
  showWarning = true,
  isPaymentCompleted = false,
  onExpiredStateChange
}) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    // Lấy thời gian bắt đầu từ localStorage hoặc tạo mới
    const startTimeKey = `payment_start_time_${orderId}`;
    const startTime = localStorage.getItem(startTimeKey);
    
    if (startTime) {
      const elapsed = Math.floor((Date.now() - parseInt(startTime)) / 1000);
      const remaining = Math.max(initialTime - elapsed, 0);
      return remaining;
    } else {
      // Lưu thời gian bắt đầu vào localStorage
      localStorage.setItem(startTimeKey, Date.now().toString());
      return initialTime;
    }
  });
  const [isExpired, setIsExpired] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      if (onTimeExpired) {
        onTimeExpired();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeExpired]);

  // Thông báo trạng thái hết hạn cho component cha
  useEffect(() => {
    if (onExpiredStateChange) {
      onExpiredStateChange(isExpired);
    }
  }, [isExpired, onExpiredStateChange]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeLeft <= 60) return '#d32f2f'; // Đỏ khi còn 1 phút
    if (timeLeft <= 120) return '#f57c00'; // Cam khi còn 2 phút
    return '#FFFFFF'; // Trắng
  };

  const getWarningMessage = () => {
    if (timeLeft <= 60) return 'Thời gian thanh toán sắp hết!';
    if (timeLeft <= 120) return 'Còn ít thời gian để hoàn thành thanh toán!';
    return 'Vui lòng hoàn thành thanh toán trong thời gian quy định.';
  };

  const handleCancelOrder = () => {
    // Chỉ chuyển hướng về giỏ hàng, việc hủy đơn hàng sẽ được xử lý bởi Payment.jsx
    navigate('/cart', { replace: true });
  };

  // Nếu thanh toán đã hoàn thành, không hiển thị timer
  if (isPaymentCompleted) {
    return null;
  }

  if (isExpired) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 3,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
            color: 'white',
            textAlign: 'center'
          }}
        >
          <WarningIcon sx={{ fontSize: 48, mb: 2, color: 'white' }} />
          <Typography variant="h5" fontWeight={600} mb={2}>
            Hết thời gian thanh toán!
          </Typography>
                     <Typography variant="body1" mb={3}>
             Đơn hàng của bạn đã bị hủy tự động do không hoàn thành thanh toán trong thời gian quy định (5 phút).
           </Typography>
          <Button
            variant="contained"
            onClick={handleCancelOrder}
            sx={{
              backgroundColor: 'white',
              color: '#d32f2f',
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            Quay về giỏ hàng
          </Button>
          <Typography 
            variant="body2" 
            sx={{ mt: 2, opacity: 0.8, fontStyle: 'italic' }}
          >
            Đơn hàng sẽ được hủy tự động và sản phẩm sẽ được trả về giỏ hàng
          </Typography>
        </Paper>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          mb: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTimeIcon sx={{ mr: 1, fontSize: 24 }} />
            <Typography variant="h6" fontWeight={600}>
              Thời gian thanh toán
            </Typography>
          </Box>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              color: getTimeColor(),
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              fontFamily: 'monospace'
            }}
          >
            {formatTime(timeLeft)}
          </Typography>
        </Box>

                 {showWarning && timeLeft <= 120 && (
          <Alert
            severity={timeLeft <= 60 ? "error" : "warning"}
            sx={{
              mt: 2,
              backgroundColor: timeLeft <= 60 ? 'rgba(211, 47, 47, 0.1)' : 'rgba(245, 124, 0, 0.1)',
              color: 'white',
              border: `1px solid ${timeLeft <= 60 ? '#d32f2f' : '#f57c00'}`
            }}
            icon={<WarningIcon />}
          >
            <Typography variant="body2" fontWeight={500}>
              {getWarningMessage()}
            </Typography>
          </Alert>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Vui lòng hoàn thành thanh toán trong thời gian quy định để tránh việc đơn hàng bị hủy tự động.
          </Typography>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default CountdownTimer;
