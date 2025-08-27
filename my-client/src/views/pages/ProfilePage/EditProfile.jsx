import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import styles from './EditProfile.module.css';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, updateProfile, loading, error, clearError } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const [success, setSuccess] = useState('');

  // Cập nhật form khi user thay đổi
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setSuccess('');

    try {
      await updateProfile(formData);
      setSuccess('Cập nhật hồ sơ thành công!');
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err) {
      // Error is handled by Redux state
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  if (!user) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <p>Vui lòng đăng nhập để chỉnh sửa hồ sơ.</p>
          <Link to="/login" className={styles.loginLink}>Đăng nhập</Link>
        </div>
      </div>
    );
  }

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
          <div className={styles.header}>
            <h1 className={styles.title}>Chỉnh sửa hồ sơ</h1>
            <p className={styles.subtitle}>Cập nhật thông tin cá nhân của bạn</p>
          </div>

          {error && <div className={styles.alertError}>{error}</div>}
          {success && <div className={styles.alertSuccess}>{success}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="name" className={styles.label}>
                Họ và tên
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Nhập họ và tên"
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Nhập email"
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="phone" className={styles.label}>
                Số điện thoại
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="address" className={styles.label}>
                Địa chỉ
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={styles.textarea}
                placeholder="Nhập địa chỉ"
                rows="3"
              />
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                onClick={handleCancel}
                className={styles.btnSecondary}
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={loading}
              >
                {loading ? 'Đang cập nhật...' : 'Cập nhật'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
