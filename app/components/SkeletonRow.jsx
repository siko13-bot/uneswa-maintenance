// src/components/SkeletonRow.jsx
import styles from "../styles/Skeleton.module.css";

export default function SkeletonRow({ columns = 5 }) {
  return (
    <div className={styles.skeletonRow}>
      {Array(columns)
        .fill()
        .map((_, i) => (
          <div key={i} className={styles.skeletonCell} />
        ))}
    </div>
  );
}
