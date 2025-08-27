import { Link } from "react-router-dom";
import styles from "./HomePageFooter.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footer__container}>
        {/* Hàng cột trên */}
        <div className={styles.footer__cols}>
          <div className={styles.footer__col}>
            <h4 className={styles.footer__title}>THÔNG TIN ABC</h4>
            <ul className={styles.footer__list}>
              <li><Link to="/about">Giới thiệu công ty</Link></li>
              <li><Link to="/showrooms">Hệ thống showroom, đại lý</Link></li>
              <li><Link to="/contact">Liên hệ / Góp ý</Link></li>
              <li><Link to="/installment">Mua trả góp</Link></li>
              <li><Link to="/loyalty">Chương trình Khách hàng thân thiết</Link></li>
              <li><Link to="/terms">Điều khoản sử dụng website</Link></li>
              <li><Link to="/careers" className={styles.footer__highlight}>Tuyển dụng</Link></li>
            </ul>
          </div>

          <div className={styles.footer__col}>
            <h4 className={styles.footer__title}>HƯỚNG DẪN CHUNG</h4>
            <ul className={styles.footer__list}>
              <li><Link to="/shipping-returns">Giao hàng - Đổi trả</Link></li>
              <li><Link to="/how-to-buy">Hướng dẫn mua hàng</Link></li>
              <li><Link to="/payment-security">Thanh toán &amp; Bảo mật</Link></li>
              <li><Link to="/warranty-policy">Chính sách bảo hành</Link></li>
              <li><Link to="/piano-maintenance">Bảo trì đàn piano</Link></li>
              <li><Link to="/warranty">Tra cứu - Kích hoạt bảo hành</Link></li>
            </ul>
          </div>

          <div className={styles.footer__col}>
            <h4 className={styles.footer__title}>HỖ TRỢ KHÁCH HÀNG</h4>
            <ul className={styles.footer__list}>
              <li>
                Gọi mua hàng:{" "}
                <a className={styles.footer__hotline} href="tel:18009876">1800 9876</a> (Miễn phí)
              </li>
              <li>
                Khiếu nại, Bảo hành:{" "}
                <a className={styles.footer__hotline} href="tel:0972066123">0972066123</a>
              </li>
              <li>Thời gian phục vụ: 8h–22h</li>
              <li>
                Email:{" "}
                <a href="mailto:22110348@student.hcmute.edu.vn">
                  22110348@student.hcmute.edu.vn
                </a>
              </li>
            </ul>
          </div>

          <div className={styles.footer__col}>
            <h4 className={styles.footer__title}>SOCIAL</h4>
            <div className={styles.footer__social}>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className={`${styles.footer__socialIcon} ${styles.fb}`}
              >
                <span aria-hidden="true">f</span>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className={`${styles.footer__socialIcon} ${styles.yt}`}
              >
                <span aria-hidden="true">▶</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className={`${styles.footer__socialIcon} ${styles.ig}`}
              >
                <span aria-hidden="true">⌾</span>
              </a>
              <a
                href="https://zalo.me"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Zalo"
                className={`${styles.footer__socialIcon} ${styles.za}`}
              >
                <span aria-hidden="true">Z</span>
              </a>
            </div>
          </div>
        </div>

        <hr className={styles.footer__divider} />

        {/* Hàng dưới */}
        <div className={styles.footer__bottom}>
          <div className={styles.footer__company}>
            <h5 className={styles.footer__companyTitle}>
              CÔNG TY CỔ PHẦN ABC
            </h5>
            <p>GPKD số 12345678 do Sở Kế hoạch Đầu tư TPHCM cấp ngày 01/01/2007</p>
            <p>
              Địa chỉ: Số 1, Võ Văn Ngân, Phường Linh Chiểu, TP Thủ Đức, TP HCM
            </p>
            <p>
              Điện thoại:{" "}
              <a className={styles.footer__hotline} href="tel:18009876">1800 9876</a>
              &nbsp;–&nbsp;
              Hotline:{" "}
              <a className={styles.footer__hotline} href="tel:0972066123">0972066123</a>
            </p>
            <p>
              Website:{" "}
              <a
                href="https://myapp.vn"
                target="_blank"
                rel="noopener noreferrer"
              >
                myapp.vn
              </a>
            </p>
          </div>

          <div className={styles.footer__payments}>
            <h5 className={styles.footer__chipTitle}>CÁCH THỨC THANH TOÁN</h5>
            <div className={styles.footer__chips}>
              <span className={styles.chip}>VISA</span>
              <span className={styles.chip}>MasterCard</span>
              <span className={styles.chip}>COD</span>
              <span className={styles.chip}>napas</span>
              <span className={styles.chip}>123Pay</span>
            </div>

            <h5 className={styles.footer__chipTitle}>CHỨNG NHẬN</h5>
            <div className={styles.footer__chips}>
              <span className={styles.chip}>Bộ Công Thương</span>
              <span className={styles.chip}>DMCA</span>
              <span className={styles.chip}>PROTECTED</span>
            </div>
          </div>
        </div>

        <div className={styles.footer__copy}>
          © {new Date().getFullYear()} MyMusic. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
