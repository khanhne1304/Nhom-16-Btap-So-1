const nodemailer = require('nodemailer');

// Tạo transporter cho Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com', // Email Gmail của bạn
    pass: process.env.EMAIL_PASS || 'your-app-password' // App password từ Gmail
  }
});

// Hàm gửi email OTP
const sendOTPEmail = async (toEmail, otp, userName, type = 'register') => {
  try {
    const isLogout = type === 'logout';
    const subject = isLogout ? 'Xác nhận đăng xuất - MyMusic Store' : 'Mã xác nhận đăng ký - MyMusic Store';
    const actionText = isLogout ? 'xác nhận đăng xuất' : 'hoàn thành đăng ký';
    const purposeText = isLogout ? 'để xác nhận việc đăng xuất khỏi tài khoản' : 'để hoàn thành quá trình đăng ký tài khoản';
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: toEmail,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #ffd700; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; color: #000; font-size: 24px;">🎸 MyMusic Store</h1>
          </div>
          
          <div style="background: #fff; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Xin chào ${userName}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Bạn đã yêu cầu ${actionText}. Vui lòng sử dụng mã xác nhận dưới đây ${purposeText}:
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0; color: #333; font-size: 32px; letter-spacing: 5px; font-family: monospace;">
                ${otp}
              </h3>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              <strong>Lưu ý:</strong>
            </p>
            <ul style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              <li>Mã này có hiệu lực trong 15 phút</li>
              <li>Không chia sẻ mã này với bất kỳ ai</li>
              <li>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này</li>
            </ul>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; font-size: 14px;">
                Email này được gửi tự động, vui lòng không trả lời.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = {
  sendOTPEmail
};
