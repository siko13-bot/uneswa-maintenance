// src/components/Spinner.jsx
import styles from "../styles/Spinner.module.css";

export default function Spinner({ size = "medium", color = "#1e60a4" }) {
  const sizeMap = {
    small: "20px",
    medium: "40px",
    large: "60px",
  };

  return (
    <div className={styles.spinnerContainer}>
      <div
        className={styles.spinner}
        style={{
          width: sizeMap[size],
          height: sizeMap[size],
          borderTopColor: color,
        }}
      />
    </div>
  );
}

// Full-page loader component
export function FullPageLoader() {
  return (
    <div className={styles.fullPageLoader}>
      <Spinner size="large" />
      <p>Loading...</p>
    </div>
  );
}

// Button loader (inline)
export function ButtonSpinner() {
  return <div className={styles.buttonSpinner} />;
}
