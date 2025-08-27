import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import styles from './Home.module.css';
import ProductCard from '../../components/productCard/productCard';
import Footer from '../../components/HomePageItems/Footer/HomePageFooter';
import { fetchProducts } from '../../../services/products';
import { useAuth } from '../../../hooks/useAuth';

export default function Home() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ---- State danh sách sản phẩm từ API ----
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  // ---- Tìm kiếm & bộ lọc (đọc/ghi từ URL) ----
  const [keyword, setKeyword] = useState(searchParams.get('q') ?? '');
  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get('category') ?? '',
  );
  const [brandFilter, setBrandFilter] = useState(
    searchParams.get('brand') ?? '',
  );

  // Mỗi khi các filter thay đổi -> gọi API
  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      setErr('');
      try {
        const data = await fetchProducts({
          q: keyword.trim() || undefined,
          category: categoryFilter || undefined,
          brand: brandFilter || undefined,
          // sort, page, limit có thể bổ sung ở đây
        });
        if (!mounted) return;

        // data là mảng sản phẩm do controller .list trả về
        // Map dữ liệu cho ProductCard:
        // - image: lấy ảnh đầu tiên
        // - brand: p.brand?.name (do populate)
        // - category: p.category?.slug hoặc name
        // - price/oldPrice: hiện giá hiển thị là price.sale ?? price.base, oldPrice để render gạch
        const mapped = (data || []).map((p) => ({
          id: p._id,
          image: p.images?.[0]?.url || '',
          name: p.name,
          brand: p.brand?.name || '',
          model: p.sku, // nếu muốn hiển thị model -> dùng sku
          category: p.category?.slug || p.category?.name || '',
          price:
            p?.price?.sale != null && p?.price?.sale !== 0
              ? p.price.sale
              : p?.price?.base || 0,
          oldPrice:
            p?.price?.sale != null && p?.price?.sale !== 0
              ? p?.price?.base || null
              : null,
          href: `/products/${p.slug}`,
          // cho phần "giảm giá nhiều"
          _discount:
            p?.price?.sale != null && p?.price?.sale !== 0
              ? Math.round((1 - p.price.sale / p.price.base) * 100)
              : 0,
        }));

        setProducts(mapped);
      } catch (e) {
        if (!mounted) return;
        setErr(e.message || 'Có lỗi khi tải sản phẩm');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
    // gọi lại khi filter thay đổi
  }, [keyword, categoryFilter, brandFilter]);

  // ---- Gom brand theo category để hiển thị dropdown ----
  const brandsByCategory = useMemo(() => {
    return products.reduce((acc, p) => {
      const cat = p.category?.toLowerCase();
      const brand = p.brand?.toUpperCase();
      if (!cat || !brand) return acc;
      acc[cat] ??= new Set();
      acc[cat].add(brand);
      return acc;
    }, /** @type {Record<string, Set<string>>} */ ({}));
  }, [products]);

  const guitarBrands = useMemo(
    () => Array.from(brandsByCategory['guitar'] ?? []),
    [brandsByCategory],
  );
  const pianoBrands = useMemo(
    () => Array.from(brandsByCategory['piano'] ?? []),
    [brandsByCategory],
  );

  // ---- Tính % giảm & lấy TOP 3 từ dữ liệu API ----
  const discountedTop3 = useMemo(() => {
    return products
      .filter((p) => p.oldPrice && p.oldPrice > p.price)
      .sort((a, b) => b._discount - a._discount)
      .slice(0, 3)
      .map((p) => ({ ...p, name: `${p.name} • -${p._discount}%` }));
  }, [products]);

  // ---- Lọc hiển thị (client) theo từ khóa/brand/category (tuỳ chọn) ----
  // Lưu ý: vì đã filter ở server, bạn có thể bỏ đoạn này nếu muốn.
  const filteredProducts = useMemo(() => {
    let rs = [...products];

    if (categoryFilter) {
      rs = rs.filter(
        (p) => p.category?.toLowerCase() === categoryFilter.toLowerCase(),
      );
    }
    if (brandFilter) {
      rs = rs.filter(
        (p) => p.brand?.toLowerCase() === brandFilter.toLowerCase(),
      );
    }
    if (keyword.trim()) {
      const q = keyword.trim().toLowerCase();
      rs = rs.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          (p.model || '').toLowerCase().includes(q),
      );
    }

    return rs;
  }, [products, keyword, categoryFilter, brandFilter]);

  const submitSearch = () => {
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('q', keyword.trim());
    if (categoryFilter) params.set('category', categoryFilter);
    if (brandFilter) params.set('brand', brandFilter);
    setSearchParams(params);
    // useEffect sẽ chạy và gọi API
  };

  return (
    <div className={styles.home}>
      {/* HEADER */}
      <header className={styles.home__navbar}>
        <div className={styles.home__logo} onClick={() => navigate('/')}>
          🎸 MyMusic
        </div>

        {/* MENU */}
        <nav className={styles.home__menu}>
          {/* Guitar */}
          <div className={styles.home__menuItem}>
            <Link to='/products?category=guitar'>Guitar</Link>
            <div className={styles.home__submenu}>
              {guitarBrands.length ? (
                guitarBrands.map((b) => (
                  <Link
                    key={`g-${b}`}
                    to={`/products?category=guitar&brand=${encodeURIComponent(
                      b,
                    )}`}
                  >
                    {b}
                  </Link>
                ))
              ) : (
                <span className={styles.home__submenuEmpty}>
                  Chưa có thương hiệu
                </span>
              )}
            </div>
          </div>

          {/* Piano */}
          <div className={styles.home__menuItem}>
            <Link to='/products?category=piano'>Piano</Link>
            <div className={styles.home__submenu}>
              {pianoBrands.length ? (
                pianoBrands.map((b) => (
                  <Link
                    key={`p-${b}`}
                    to={`/products?category=piano&brand=${encodeURIComponent(
                      b,
                    )}`}
                  >
                    {b}
                  </Link>
                ))
              ) : (
                <span className={styles.home__submenuEmpty}>
                  Chưa có thương hiệu
                </span>
              )}
            </div>
          </div>

          {/* Mục tĩnh */}
          <div className={styles.home__menuItem}>
            <Link to='/'>Khóa học</Link>
          </div>
          <div className={styles.home__menuItem}>
            <Link to='/'>Công cụ</Link>
          </div>
        </nav>

        {/* SEARCH */}
        <div className={styles.home__searchBox}>
          <input
            type='text'
            placeholder='Tìm kiếm...'
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label='Lọc theo danh mục'
          >
            <option value=''>Tất cả danh mục</option>
            <option value='guitar'>Guitar</option>
            <option value='piano'>Piano</option>
          </select>
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            aria-label='Lọc theo thương hiệu'
          >
            <option value=''>Tất cả thương hiệu</option>
            {[...new Set(products.map((p) => p.brand))].map((b) => (
              <option key={b} value={b.toLowerCase()}>
                {b}
              </option>
            ))}
          </select>
          <button onClick={submitSearch}>Tìm</button>
        </div>

        {/* AUTH */}
        <div className={styles.home__authButtons}>
          {user ? (
            <div className={styles.home__userWrap}>
              <span className={styles.home__userText}>
                👋 Hello, {user.name || user.email}
              </span>
              <button className={styles.home__btn} onClick={handleLogout}>
                Đăng xuất
              </button>
            </div>
          ) : (
            <>
              <button
                className={styles.home__btn}
                onClick={() => navigate('/login')}
              >
                Đăng nhập
              </button>
              <button
                className={`${styles.home__btn} ${styles['home__btn--primary']}`}
                onClick={() => navigate('/register')}
              >
                Đăng ký
              </button>
            </>
          )}
        </div>
      </header>

      {/* CONTENT */}
      <main className={styles.home__content}>
        <div className={styles.home__container}>
          {/* Banner / hero */}
          <section className={styles.home__hero}>
            <div className={styles.home__heroText}>
              <h1>Nhạc cụ cho mọi người</h1>
              <p>Chọn đàn phù hợp và bắt đầu hành trình âm nhạc của bạn 🎶</p>
              <div className={styles.home__heroActions}>
                <Link
                  to='/products?category=guitar'
                  className={styles.home__cta}
                >
                  Mua Guitar
                </Link>
                <Link
                  to='/products?category=piano'
                  className={`${styles.home__cta} ${styles['home__cta--ghost']}`}
                >
                  Mua Piano
                </Link>
              </div>
            </div>
          </section>

          {/* Trạng thái tải / lỗi */}
          {loading && (
            <div className={styles.home__loading}>Đang tải sản phẩm…</div>
          )}
          {err && <div className={styles.home__error}>{err}</div>}

          {/* Sản phẩm chung */}
          {!loading && !err && (
            <section className={styles.home__section}>
              <h2 className={styles.home__sectionTitle}>Các sản phẩm</h2>
              {filteredProducts.length ? (
                <div className={styles.home__grid}>
                  {filteredProducts.map((p) => (
                    <ProductCard key={p.id} {...p} />
                  ))}
                </div>
              ) : (
                <div className={styles.home__empty}>
                  Không tìm thấy sản phẩm phù hợp.
                </div>
              )}
            </section>
          )}

          {/* Sản phẩm giảm giá nhiều */}
          {!loading && !err && (
            <section className={styles.home__section}>
              <h2
                className={`${styles.home__sectionTitle} ${styles.home__sectionTitleSale}`}
              >
                Các sản phẩm giảm giá nhiều
              </h2>
              <div className={`${styles.home__grid} ${styles.home__gridSale}`}>
                {discountedTop3.length ? (
                  discountedTop3.map((p) => (
                    <ProductCard key={`sale-${p.id}`} {...p} />
                  ))
                ) : (
                  <div className={styles.home__empty}>
                    Chưa có sản phẩm giảm giá.
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
