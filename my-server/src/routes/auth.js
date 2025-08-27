const express = require('express');
const router = express.Router();
const { sendOTPEmail } = require('../config/email');

// Mock users database (in a real app, this would be in a database)
let users = [
  {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: '123456', // In real app, this would be hashed
    phone: '',
    address: ''
  }
];

// Mock OTP storage (in real app, this would be in a database)
let pendingRegistrations = new Map(); // email -> { name, email, password, otp, createdAt }
let pendingLogouts = new Map(); // email -> { otp, createdAt }

// POST /api/auth/register - Send OTP to email
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    
    console.log('Register request body:', { name, email, phone, address });

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Vui lòng nhập đầy đủ thông tin' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Mật khẩu phải có ít nhất 6 ký tự' 
      });
    }

    // Check if email already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Email đã được sử dụng' 
      });
    }

    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store pending registration
    const pendingData = {
      name: name.trim(),
      email: email.trim(),
      password: password, // In real app, hash this password
      phone: phone || '',
      address: address || '',
      otp: otp,
      createdAt: Date.now()
    };
    
    console.log('Storing pending registration:', pendingData);
    pendingRegistrations.set(email, pendingData);

    // Gửi email OTP thực sự
    const emailSent = await sendOTPEmail(email, otp, name.trim(), 'register');
    
    if (emailSent) {
      res.json({ 
        message: 'Chúng tôi đã gửi mã xác nhận tới email của bạn',
        email: email
      });
    } else {
      // Nếu gửi email thất bại, xóa pending registration
      pendingRegistrations.delete(email);
      res.status(500).json({ 
        message: 'Không thể gửi email xác nhận. Vui lòng thử lại sau.' 
      });
    }

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// POST /api/auth/verify-otp - Verify OTP and complete registration
router.post('/verify-otp', (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validation
    if (!email || !otp) {
      return res.status(400).json({ 
        message: 'Vui lòng nhập email và mã OTP' 
      });
    }

    // Check if pending registration exists
    const pendingReg = pendingRegistrations.get(email);
    if (!pendingReg) {
      return res.status(400).json({ 
        message: 'Không tìm thấy yêu cầu đăng ký cho email này' 
      });
    }

    // Check OTP expiration (15 minutes)
    const now = Date.now();
    const otpAge = now - pendingReg.createdAt;
    if (otpAge > 15 * 60 * 1000) { // 15 minutes
      pendingRegistrations.delete(email);
      return res.status(400).json({ 
        message: 'Mã OTP đã hết hạn. Vui lòng đăng ký lại' 
      });
    }

    // Verify OTP
    if (pendingReg.otp !== otp) {
      return res.status(400).json({ 
        message: 'Mã OTP không đúng' 
      });
    }

    // Create new user
    const newUser = {
      id: String(users.length + 1),
      name: pendingReg.name,
      email: pendingReg.email,
      password: pendingReg.password,
      phone: pendingReg.phone || '',
      address: pendingReg.address || ''
    };
    
    console.log('Creating new user:', newUser);

    users.push(newUser);

    // Remove pending registration
    pendingRegistrations.delete(email);

    // Generate token
    const token = `mock_token_${newUser.id}_${Date.now()}`;

    res.json({
      message: 'Đăng ký thành công',
      token: token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        address: newUser.address
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Vui lòng nhập email và mật khẩu' 
      });
    }

    // Find user
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Email hoặc mật khẩu không đúng' 
      });
    }

    // Generate mock token (in real app, use JWT)
    const token = `mock_token_${user.id}_${Date.now()}`;

    res.json({
      message: 'Đăng nhập thành công',
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }

    const token = authHeader.split(' ')[1];
    
    // Simple token validation (in real app, verify JWT)
    const tokenParts = token.split('_');
    if (tokenParts.length < 3) {
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }

    const userId = tokenParts[2]; // Extract user ID from token
    
    // Find user
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Validation
    if (!name || !email) {
      return res.status(400).json({ 
        message: 'Họ tên và email là bắt buộc' 
      });
    }

    // Check if email is already used by another user
    const existingUser = users.find(u => u.email === email && u.id !== userId);
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Email đã được sử dụng bởi người dùng khác' 
      });
    }

    // Update user
    users[userIndex] = {
      ...users[userIndex],
      name: name.trim(),
      email: email.trim(),
      phone: phone || '',
      address: address || ''
    };

    const updatedUser = users[userIndex];

    res.json({
      message: 'Cập nhật hồ sơ thành công',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// POST /api/auth/resend-otp - Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({ 
        message: 'Vui lòng nhập email' 
      });
    }

    // Check if pending registration exists
    const pendingReg = pendingRegistrations.get(email);
    if (!pendingReg) {
      return res.status(400).json({ 
        message: 'Không tìm thấy yêu cầu đăng ký cho email này' 
      });
    }

    // Generate new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Update pending registration with new OTP
    pendingRegistrations.set(email, {
      ...pendingReg,
      otp: newOtp,
      createdAt: Date.now()
    });

    // Gửi email OTP mới thực sự
    const emailSent = await sendOTPEmail(email, newOtp, pendingReg.name, 'register');
    
    if (emailSent) {
      res.json({ 
        message: 'Đã gửi lại mã OTP',
        email: email
      });
    } else {
      res.status(500).json({ 
        message: 'Không thể gửi lại email OTP. Vui lòng thử lại sau.' 
      });
    }

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// POST /api/auth/logout-otp - Send OTP for logout
router.post('/logout-otp', async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({ 
        message: 'Vui lòng nhập email' 
      });
    }

    // Check if user exists
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ 
        message: 'Không tìm thấy tài khoản với email này' 
      });
    }

    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store pending logout
    pendingLogouts.set(email, {
      email: email,
      otp: otp,
      createdAt: Date.now()
    });

    console.log('Storing pending logout for:', email, 'OTP:', otp);
    console.log('All pending logouts after storing:', Array.from(pendingLogouts.entries()));

    // Gửi email OTP thực sự
    const emailSent = await sendOTPEmail(email, otp, user.name, 'logout');
    
    if (emailSent) {
      res.json({ 
        message: 'Chúng tôi đã gửi mã xác nhận tới gmail của bạn',
        email: email
      });
    } else {
      // Nếu gửi email thất bại, xóa pending logout
      pendingLogouts.delete(email);
      res.status(500).json({ 
        message: 'Không thể gửi email xác nhận. Vui lòng thử lại sau.' 
      });
    }

  } catch (error) {
    console.error('Logout OTP error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// POST /api/auth/verify-logout-otp - Verify OTP and logout
router.post('/verify-logout-otp', (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validation
    if (!email || !otp) {
      return res.status(400).json({ 
        message: 'Vui lòng nhập email và mã OTP' 
      });
    }

    // Check if pending logout exists
    const pendingLogout = pendingLogouts.get(email);
    console.log('Checking pending logout for email:', email);
    console.log('Pending logout data:', pendingLogout);
    console.log('All pending logouts:', Array.from(pendingLogouts.entries()));
    
    if (!pendingLogout) {
      return res.status(400).json({ 
        message: 'Không tìm thấy yêu cầu đăng xuất cho email này' 
      });
    }

    // Check OTP expiration (15 minutes)
    const now = Date.now();
    const otpAge = now - pendingLogout.createdAt;
    if (otpAge > 15 * 60 * 1000) { // 15 minutes
      pendingLogouts.delete(email);
      return res.status(400).json({ 
        message: 'Mã OTP đã hết hạn. Vui lòng thử lại' 
      });
    }

    // Verify OTP
    if (pendingLogout.otp !== otp) {
      return res.status(400).json({ 
        message: 'Mã OTP không đúng' 
      });
    }

    // Remove pending logout
    pendingLogouts.delete(email);

    res.json({
      message: 'Xác minh thành công. Bạn có thể đăng xuất.',
      success: true
    });

  } catch (error) {
    console.error('Verify logout OTP error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// GET /api/auth/debug-pending-logouts - Debug endpoint (chỉ dùng để test)
router.get('/debug-pending-logouts', (req, res) => {
  try {
    const pendingLogoutsArray = Array.from(pendingLogouts.entries());
    console.log('Debug: All pending logouts:', pendingLogoutsArray);
    
    res.json({
      message: 'Debug info for pending logouts',
      count: pendingLogouts.size,
      pendingLogouts: pendingLogoutsArray.map(([email, data]) => ({
        email,
        otp: data.otp,
        createdAt: new Date(data.createdAt).toISOString(),
        ageInMinutes: Math.floor((Date.now() - data.createdAt) / (1000 * 60))
      }))
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ message: 'Lỗi debug' });
  }
});

module.exports = router;
