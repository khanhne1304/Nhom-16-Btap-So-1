import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Register.module.css';

const BASE_URL =
  import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

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
      <path
        fill='#FFC107'
        d='M43.6 20.5h-1.9V20H24v8h11.3C33.9 31.6 29.5 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.6 5.8 29.6 4 24 4 16.1 4 9.3 8.3 6.3 14.7z'
      />
      <path
        fill='#FF3D00'
        d='M6.3 14.7l6.6 4.8C14.8 16 19 13 24 13c3 0 5.7 1.1 7.8 3l5.7-5.7C34.6 5.8 29.6 4 24 4 16.1 4 9.3 8.3 6.3 14.7z'
      />
      <path
        fill='#4CAF50'
        d='M24 44c5.4 0 10.4-2.1 14.1-5.5l-6.5-5.3C29.5 35 26.9 36 24 36c-5.5 0-9.9-3.5-11.4-8.3l-6.5 5.1C9.2 39.7 16 44 24 44z'
      />
      <path
        fill='#0c161fff'
        d='M43.6 20.5h-1.9V20H24v8h11.3c-1.3 3.1-4.5 7-11.3 7-5.5 0-10.1-3.7-11.7-8.7l-6.6 5.1C7.4 39 15 44 24 44c10.6 0 19.6-8.6 19.6-20 0-1.3-.1-2.7-.4-3.5z'
      />
    </svg>
  );
}
function BackIcon({ className }) {
  return (
    <svg className={className} viewBox='0 0 24 24' aria-hidden='true'>
      <path
        fill='currentColor'
        d='M20 11H7.83l4.58-4.59L11 5l-7 7 7 7 1.41-1.41L7.83 13H20v-2z'
      />
    </svg>
  );
}

export default function Register() {
  const navigate = useNavigate();

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
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  const onChange = (e) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const register = async ({ name, email, password }) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.message || 'Đăng ký thất bại');
      }

      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Register error:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Không thể kết nối đến server. Vui lòng thử lại sau.');
      }
      throw error;
    }
  };

  const login = async ({ email, password }) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.message || 'Đăng nhập thất bại');
      }

      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Login error:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Không thể kết nối đến server. Vui lòng thử lại sau.');
      }
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setOk('');

    if (!agree) return setErr('Bạn cần đồng ý Điều khoản & Điều kiện.');
    if (!form.email || !form.password || !form.fullName) {
      return setErr('Vui lòng nhập đầy đủ Họ tên, Email và Mật khẩu.');
    }
    if (form.password.length < 6) {
      return setErr('Mật khẩu tối thiểu 6 ký tự.');
    }
    if (form.password !== form.confirm) {
      return setErr('Mật khẩu nhập lại không khớp.');
    }

    setLoading(true);
    try {
      // 1) Đăng ký (dùng fullName làm name cho backend)
      await register({
        name: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      // 2) Đăng nhập tự động
      const loginData = await login({
        email: form.email.trim(),
        password: form.password,
      });

      // 3) Lưu token & điều hướng
      if (loginData?.token) {
        localStorage.setItem('token', loginData.token);
      }
      setOk('Đăng ký & đăng nhập thành công!');
      // tuỳ UX: chờ 500ms rồi chuyển trang
      setTimeout(() => navigate('/'), 500);
    } catch (error) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerPage}>
      <div className={styles.register}>
        <div className={styles.register__card}>
          <Link to='/' className={styles.register__back}>
            <BackIcon className={styles.register__backIcon} />
            <span>Về trang chủ</span>
          </Link>

          <h1 className={styles.register__title}>ĐĂNG KÝ TÀI KHOẢN</h1>

          {/* thông báo */}
          {err && <div className={styles.register__alertError}>{err}</div>}
          {ok && <div className={styles.register__alertSuccess}>{ok}</div>}

          <div className={styles.register__container}>
            {/* Form */}
            <form className={styles.register__form} onSubmit={handleSubmit}>
              <input
                type='text'
                name='username'
                placeholder='Tên tài khoản (tuỳ chọn)'
                value={form.username}
                onChange={onChange}
                autoComplete='username'
              />
              <input
                type='email'
                name='email'
                placeholder='Email'
                value={form.email}
                onChange={onChange}
                autoComplete='email'
                required
              />
              <input
                type='text'
                name='fullName'
                placeholder='Họ và tên'
                value={form.fullName}
                onChange={onChange}
                required
              />
              <input
                type='text'
                name='address'
                placeholder='Địa chỉ (tuỳ chọn)'
                value={form.address}
                onChange={onChange}
                autoComplete='street-address'
              />
              <input
                type='text'
                name='phone'
                placeholder='Số điện thoại (tuỳ chọn)'
                value={form.phone}
                onChange={onChange}
                autoComplete='tel'
              />
              <input
                type='password'
                name='password'
                placeholder='Mật khẩu'
                value={form.password}
                onChange={onChange}
                autoComplete='new-password'
                required
              />
              <input
                type='password'
                name='confirm'
                placeholder='Nhập lại mật khẩu'
                value={form.confirm}
                onChange={onChange}
                autoComplete='new-password'
                required
              />

              {/* Checkbox điều khoản */}
              <div className={styles.register__terms}>
                <input
                  id='agree'
                  type='checkbox'
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                <label htmlFor='agree'>
                  Đồng ý với <strong>Điều khoản</strong> và{' '}
                  <strong>Điều kiện</strong>
                </label>
              </div>

              <button
                type='submit'
                className={`${styles.register__btn} ${
                  !agree || loading ? styles['register__btn--disabled'] : ''
                }`}
                disabled={!agree || loading}
              >
                {loading ? 'Đang xử lý...' : 'Đăng ký'}
              </button>
            </form>

            {/* Divider dọc */}
            <div className={styles.register__divider} aria-hidden='true' />

            {/* Social (placeholder) */}
            <div className={styles.register__social}>
              <p className={styles.register__socialTitle}>Đăng ký bằng</p>
              <button
                type='button'
                className={`${styles.register__btnSocial} ${styles.facebook}`}
                disabled
              >
                <FacebookIcon className={styles.register__icon} />
                <span>Facebook (sắp có)</span>
              </button>
              <button
                type='button'
                className={`${styles.register__btnSocial} ${styles.google}`}
                disabled
              >
                <GoogleIcon className={styles.register__icon} />
                <span>Google (sắp có)</span>
              </button>
            </div>
          </div>

          {/* Footnote */}
          <div className={styles.register__footnote}>
            Đã có tài khoản?{' '}
            <Link to='/login' className={styles.register__link}>
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
