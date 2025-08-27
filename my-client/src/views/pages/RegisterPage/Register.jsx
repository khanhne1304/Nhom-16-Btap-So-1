import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import styles from './Register.module.css';
import OTPModal from '../../components/OTPModal/OTPModal';

export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser, verifyOTP: verifyRegisterOTP, login: loginUser, registerOTP } = useAuth();

  const [form, setForm] = useState({
    username: '',
    email: '',
    fullName: '',
    address: '',
    phone: '',
    password: '',
    confirm: '',
  });
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  // --- OTP Modal state ---
  const [showOTP, setShowOTP] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setOk('');

    if (!agree) {
      return setErr('Vui lòng đồng ý với điều khoản sử dụng');
    }

    if (form.password !== form.confirm) {
      return setErr('Mật khẩu xác nhận không khớp');
    }

    try {
      await registerUser({
        name: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
        address: form.address.trim(),
      });
      
      setPendingEmail(form.email.trim());
      setOk(`Chúng tôi đã gửi mã xác nhận tới email ${form.email.trim()}. Vui lòng kiểm tra hộp thư và nhập mã OTP.`);
      setShowOTP(true);
    } catch (error) {
      setErr(error.message || 'Đăng ký thất bại');
    }
  };

  // Được gọi khi OTPModal xác minh thành công
  const handleVerified = async (verifyResult) => {
    try {
      await verifyRegisterOTP({ email: form.email.trim(), otp: verifyResult?.otp || '' });
      setOk('Đăng ký & xác minh thành công!');
      setShowOTP(false);
      // Chuyển hướng đến profile sau khi đăng ký thành công
      setTimeout(() => navigate('/profile'), 400);
    } catch (e) {
      setErr(e.message || 'Xác minh OTP thất bại');
    }
  };

  const handleCloseOTP = () => {
    setShowOTP(false);
    setErr('');
  };

  return (
    <div className={styles.registerPage}>
      <div className={styles.register}>
        <div className={styles.register__card}>
          <Link to='/' className={styles.register__back}>
            <BackIcon className={styles.register__backIcon} />
            <span>Về trang chủ</span>
          </Link>

          <div className={styles.register__header}>
            <h1 className={styles.register__title}>Đăng ký tài khoản</h1>
            <p className={styles.register__subtitle}>
              Tạo tài khoản mới để trải nghiệm dịch vụ tốt nhất
            </p>
          </div>

          {/* Thông báo */}
          {err && <div className={styles.register__alertError}>{err}</div>}
          {ok && <div className={styles.register__alertSuccess}>{ok}</div>}

          <form className={styles.register__form} onSubmit={handleSubmit}>
            <div className={styles.register__row}>
              <div className={styles.register__field}>
                <label htmlFor='fullName' className={styles.register__label}>
                  Họ và tên
                </label>
                <input
                  id='fullName'
                  name='fullName'
                  type='text'
                  placeholder='Nhập họ và tên đầy đủ'
                  value={form.fullName}
                  onChange={onChange}
                  required
                />
              </div>

              <div className={styles.register__field}>
                <label htmlFor='username' className={styles.register__label}>
                  Tên đăng nhập
                </label>
                <input
                  id='username'
                  name='username'
                  type='text'
                  placeholder='Nhập tên đăng nhập'
                  value={form.username}
                  onChange={onChange}
                  required
                />
              </div>
            </div>

            <div className={styles.register__field}>
              <label htmlFor='email' className={styles.register__label}>
                Email
              </label>
              <input
                id='email'
                name='email'
                type='email'
                placeholder='Nhập email của bạn'
                value={form.email}
                onChange={onChange}
                required
              />
            </div>

            <div className={styles.register__row}>
              <div className={styles.register__field}>
                <label htmlFor='phone' className={styles.register__label}>
                  Số điện thoại
                </label>
                <input
                  id='phone'
                  name='phone'
                  type='tel'
                  placeholder='Nhập số điện thoại'
                  value={form.phone}
                  onChange={onChange}
                  required
                />
              </div>

              <div className={styles.register__field}>
                <label htmlFor='address' className={styles.register__label}>
                  Địa chỉ
                </label>
                <input
                  id='address'
                  name='address'
                  type='text'
                  placeholder='Nhập địa chỉ'
                  value={form.address}
                  onChange={onChange}
                  required
                />
              </div>
            </div>

            <div className={styles.register__row}>
              <div className={styles.register__field}>
                <label htmlFor='password' className={styles.register__label}>
                  Mật khẩu
                </label>
                <input
                  id='password'
                  name='password'
                  type='password'
                  placeholder='Nhập mật khẩu'
                  value={form.password}
                  onChange={onChange}
                  required
                />
              </div>

              <div className={styles.register__field}>
                <label htmlFor='confirm' className={styles.register__label}>
                  Xác nhận mật khẩu
                </label>
                <input
                  id='confirm'
                  name='confirm'
                  type='password'
                  placeholder='Nhập lại mật khẩu'
                  value={form.confirm}
                  onChange={onChange}
                  required
                />
              </div>
            </div>

            <div className={styles.register__checkbox}>
              <label>
                <input
                  type='checkbox'
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  required
                />
                <span>
                  Tôi đồng ý với{' '}
                  <Link to='/terms' className={styles.register__link}>
                    điều khoản sử dụng
                  </Link>{' '}
                  và{' '}
                  <Link to='/privacy' className={styles.register__link}>
                    chính sách bảo mật
                  </Link>
                </span>
              </label>
            </div>

            <button
              type='submit'
              className={styles.register__submit}
              disabled={registerOTP.loading}
            >
              {registerOTP.loading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
          </form>

          <div className={styles.register__footer}>
            <p className={styles.register__text}>
              Đã có tài khoản?{' '}
              <Link to='/login' className={styles.register__link}>
                Đăng nhập ngay
              </Link>
            </p>
          </div>

          <div className={styles.register__social}>
            <p className={styles.register__socialText}>Hoặc đăng ký với</p>
            <div className={styles.register__socialButtons}>
              <button className={styles.register__socialButton}>
                <GoogleIcon className={styles.register__socialIcon} />
                Google
              </button>
              <button className={styles.register__socialButton}>
                <FacebookIcon className={styles.register__socialIcon} />
                Facebook
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      <OTPModal
        open={showOTP}
        email={pendingEmail}
        onClose={handleCloseOTP}
        onVerified={handleVerified}
        type="register"
      />
    </div>
  );
}

function FacebookIcon({ className }) {
  return (
    <svg className={className} viewBox='0 0 24 24' aria-hidden='true'>
      <path
        fill='currentColor'
        d='M22 12a10 10 0 1 0-11.5 9.9v-7h-2v-2.9h2v-2.2c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2v1.9h2.2l-.4 2.9h-1.8v7A10 10 0 0 0 22 12z'
      />
    </svg>
  );
}

function GoogleIcon({ className }) {
  return (
    <svg className={className} viewBox='0 0 48 48' aria-hidden='true'>
      <path fill='#FFC107' d='M43.6 20.5h-1.9V20H24v8h11.3C33.9 31.6 29.5 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.6 5.8 29.6 4 24 4 16.1 4 9.3 8.3 6.3 14.7z' />
      <path fill='#FF3D00' d='M6.3 14.7l6.6 4.8C14.8 16 19 13 24 13c3 0 5.7 1.1 7.8 3l5.7-5.7C34.6 5.8 29.6 4 24 4 16.1 4 9.3 8.3 6.3 14.7z' />
      <path fill='#4CAF50' d='M24 44c5.4 0 10.4-2.1 14.1-5.5l-6.5-5.3C29.5 35 26.9 36 24 36c-5.5 0-9.9-3.5-11.4-8.3l-6.5 5.1C9.2 39.7 16 44 24 44z' />
      <path fill='#0c161fff' d='M43.6 20.5h-1.9V20H24v8h11.3c-1.3 3.1-4.5 7-11.3 7-5.5 0-10.1-3.7-11.7-8.7l-6.6 5.1C7.4 39 15 44 24 44c10.6 0 19.6-8.6 19.6-20 0-1.3-.1-2.7-.4-3.5z' />
    </svg>
  );
}

function BackIcon({ className }) {
  return (
    <svg className={className} viewBox='0 0 24 24' aria-hidden='true'>
      <path fill='currentColor' d='M20 11H7.83l4.58-4.59L11 5l-7 7 7 7 1.41-1.41L7.83 13H20v-2z' />
    </svg>
  );
}
