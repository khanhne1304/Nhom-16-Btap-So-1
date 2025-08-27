import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './ProfileUser.module.css';
import OTPModal from '../../components/OTPModal/OTPModal';
import { useAuth } from '../../../hooks/useAuth';

export default function ProfileUser() {
  const navigate = useNavigate();
  const { 
    user, 
    logoutOTP, 
    sendLogoutOTP, 
    verifyLogoutOTP, 
    logout, 
    clearLogoutOTP 
  } = useAuth();

  // OTP state
  const [showOTP, setShowOTP] = useState(false);

  // mở OTP khi ấn logout
  const onClickLogout = async () => {
    if (showOTP || logoutOTP.loading) return; // Tránh gửi nhiều lần
    
    clearLogoutOTP();
    
    try {
      await sendLogoutOTP(user?.email || '');
      setShowOTP(true);
    } catch (error) {
      console.error('Logout OTP error:', error);
    }
  };

  // xác minh xong -> logout thật
  const handleVerified = async (verifyResult) => {
    try {
      await verifyLogoutOTP({ 
        email: user?.email || '', 
        otp: verifyResult?.otp || '' 
      });
      
      // Nếu verify thành công, logout
      logout();
      setShowOTP(false);
      navigate('/login');
    } catch (error) {
      console.error('Verify logout error:', error);
    }
  };

  // Kiểm tra nếu chưa đăng nhập
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className={styles.page}>
      <header className={styles.bar}>
        <Link to="/" className={styles.brand}>🎸 MyMusic</Link>
        <nav className={styles.nav}>
          <Link to="/products?category=guitar">Guitar</Link>
          <Link to="/products?category=piano">Piano</Link>
          <Link to="/">Khóa học</Link>
          <Link to="/">Công cụ</Link>
        </nav>
      </header>

      <main className={styles.wrap}>
        <section className={styles.card}>
          <h1 className={styles.title}>Hồ sơ của bạn</h1>

          {logoutOTP.error && <div className={styles.alertError}>{logoutOTP.error}</div>}

          <div className={styles.info}>
            <img
              className={styles.avatar}
              src={`https://ui-avatars.com/api/?background=000&color=ffd700&name=${encodeURIComponent(user?.name || user?.fullName || user?.email || 'U')}`}
              alt="avatar"
            />
            <div className={styles.fields}>
              <div className={styles.row}>
                <span className={styles.label}>Họ tên</span>
                <span className={styles.value}>{user?.name || user?.fullName || '—'}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.label}>Email</span>
                <span className={styles.value}>{user?.email || '—'}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.label}>SĐT</span>
                <span className={styles.value}>{user?.phone || '—'}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.label}>Địa chỉ</span>
                <span className={styles.value}>{user?.address || '—'}</span>
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => navigate('/profile/edit')}
            >
              Chỉnh sửa hồ sơ
            </button>
            <button
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={onClickLogout}
              disabled={logoutOTP.loading}
            >
              {logoutOTP.loading ? 'Đang xử lý...' : 'Đăng xuất'}
            </button>
          </div>

          <p className={styles.hint}>
            Lưu ý: khi đăng xuất, hệ thống sẽ yêu cầu xác minh OTP để đảm bảo an toàn.
          </p>
        </section>
      </main>

      {/* OTP cho thao tác logout */}
      <OTPModal
        open={showOTP}
        email={logoutOTP.pendingEmail}
        onClose={() => setShowOTP(false)}
        onVerified={handleVerified}
        resendDelaySec={45}
        type="logout"
      />
    </div>
  );
}
