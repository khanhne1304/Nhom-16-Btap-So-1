// src/components/OTPModal/OTPModal.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import styles from './OTPModal.module.css';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const OTP_LENGTH = 6;

export default function OTPModal({
  open,
  email,
  onClose,
  onVerified,           // (result) => void
  resendDelaySec = 60,  // thời gian chờ gửi lại
  type = 'register',    // 'register' hoặc 'logout'
}) {
  const [codes, setCodes] = useState(Array(OTP_LENGTH).fill(''));
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLeft, setResendLeft] = useState(resendDelaySec);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!open) return;
    setCodes(Array(OTP_LENGTH).fill(''));
    setErr('');
    setResendLeft(resendDelaySec);
    setTimeout(() => inputsRef.current?.[0]?.focus(), 50);
  }, [open, resendDelaySec]);

  // countdown gửi lại
  useEffect(() => {
    if (!open || resendLeft <= 0) return;
    const id = setInterval(() => setResendLeft(s => s - 1), 1000);
    return () => clearInterval(id);
  }, [open, resendLeft]);

  const value = useMemo(() => codes.join(''), [codes]);

  const onChange = (idx, ch) => {
    if (!/^\d?$/.test(ch)) return; // chỉ số
    setCodes(prev => {
      const copy = [...prev];
      copy[idx] = ch;
      return copy;
    });
    if (ch && idx < OTP_LENGTH - 1) inputsRef.current[idx + 1]?.focus();
  };

  const onKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !codes[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && idx > 0) inputsRef.current[idx - 1]?.focus();
    if (e.key === 'ArrowRight' && idx < OTP_LENGTH - 1) inputsRef.current[idx + 1]?.focus();
  };

  const onPaste = (e) => {
    const text = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!text) return;
    e.preventDefault();
    const arr = text.split('').concat(Array(OTP_LENGTH).fill('')).slice(0, OTP_LENGTH);
    setCodes(arr);
    const next = Math.min(text.length, OTP_LENGTH - 1);
    inputsRef.current[next]?.focus();
  };

  async function verifyOtp() {
    if (value.length !== OTP_LENGTH) {
      setErr(`Vui lòng nhập đủ ${OTP_LENGTH} số.`);
      return;
    }
    setErr('');
    setLoading(true);
    try {
      const endpoint = type === 'logout' ? 'verify-logout-otp' : 'verify-otp';
      const response = await axios.post(`${BASE_URL}/auth/${endpoint}`, { 
        email, 
        otp: value 
      });
      
      // Thêm otp vào result để frontend có thể sử dụng
      const result = { ...response.data, otp: value };
      onVerified?.(result);
      onClose?.();
    } catch (error) {
      setErr(error.response?.data?.message || error.message || 'Có lỗi xảy ra, thử lại.');
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    if (resendLeft > 0) return;
    setErr('');
    setLoading(true);
    try {
      const endpoint = type === 'logout' ? 'logout-otp' : 'resend-otp';
      await axios.post(`${BASE_URL}/auth/${endpoint}`, { email });
      setResendLeft(resendDelaySec);
    } catch (error) {
      setErr(error.response?.data?.message || error.message || 'Không thể gửi lại OTP.');
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-labelledby="otp_title">
      <div className={styles.modal}>
        <button className={styles.close} onClick={onClose} aria-label="Đóng">×</button>

        <h2 id="otp_title" className={styles.title}>Xác minh OTP</h2>
        <p className={styles.desc}>
          Chúng tôi đã gửi mã xác nhận (OTP) đến email <strong>{email}</strong>.
          Hãy nhập mã xác nhận để {type === 'logout' ? 'xác nhận đăng xuất' : 'hoàn thành đăng ký'}.
        </p>

        <div className={styles.otpWrap} onPaste={onPaste}>
          {Array.from({ length: OTP_LENGTH }).map((_, i) => (
            <input
              key={i}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              className={styles.otpInput}
              value={codes[i]}
              onChange={(e) => onChange(i, e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => onKeyDown(i, e)}
              ref={(el) => (inputsRef.current[i] = el)}
              aria-label={`Số OTP ${i + 1}`}
            />
          ))}
        </div>

        {err ? <div className={styles.error}>{err}</div> : null}

        <button
          className={styles.submit}
          onClick={verifyOtp}
          disabled={loading || value.length !== OTP_LENGTH}
        >
          {loading ? 'Đang xử lý...' : 'Xác nhận'}
        </button>

        <div className={styles.resend}>
          {resendLeft > 0 ? (
            <span>Gửi lại mã sau <strong>{resendLeft}s</strong></span>
          ) : (
            <button className={styles.resendBtn} onClick={resendOtp} disabled={loading}>
              Gửi lại mã OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
