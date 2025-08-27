import React from "react";
import styles from "./productCard.module.css";

/**
 * ProductCard
 * @param {Object} props
 * @param {string} props.image
 * @param {string} props.name
 * @param {string} [props.brand]
 * @param {string} [props.model]
 * @param {number|string} props.price
 * @param {number} [props.oldPrice]
 * @param {string} [props.href]
 * @param {function} [props.onView]
 */
export default function ProductCard({
  image,
  name,
  brand,
  model,
  price,
  oldPrice,
  href,
  onView,
}) {
  const formatVND = (v) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(v);

  const displayPrice = typeof price === "number" ? formatVND(price) : price;

  return (
    <article className={styles.productCard}>
      {/* Ảnh */}
      <div className={styles.productCard__media}>
        <img src={image} alt={name} loading="lazy" />
      </div>

      {/* Thanh thông tin dưới */}
      <div className={styles.productCard__footer}>
        <div className={styles.productCard__info}>
          {!!(brand || model) && (
            <div className={styles.productCard__title}>
              {brand?.toUpperCase()} {model}
            </div>
          )}

          <div className={styles.productCard__prices}>
            <span className={styles.productCard__price}>{displayPrice}</span>
            {oldPrice ? (
              <span className={styles.productCard__oldPrice}>
                {formatVND(oldPrice)}
              </span>
            ) : null}
          </div>
        </div>

        {href ? (
          <a
            href={href}
            className={styles.productCard__cta}
            onClick={onView}
            aria-label={`Xem thêm ${name}`}
          >
            Xem thêm
          </a>
        ) : (
          <button
            type="button"
            className={styles.productCard__cta}
            onClick={onView}
            aria-label={`Xem thêm ${name}`}
          >
            Xem thêm
          </button>
        )}
      </div>
    </article>
  );
}
