// src/app/components/SkeletonStudentDashboard.jsx
import styles from "../styles/Dashboard.module.css";
import skeletonStyles from "../styles/Skeleton.module.css";

export default function SkeletonStudentDashboard() {
  return (
    <div>
      {/* Welcome heading */}
      <div
        className={skeletonStyles.bone}
        style={{ width: 240, height: 28, borderRadius: 6, marginBottom: 24 }}
      />

      {/* Report button */}
      <div
        className={skeletonStyles.bone}
        style={{ width: "100%", height: 52, borderRadius: 8, marginBottom: 28 }}
      />

      {/* Stat cards */}
      <div className={styles.statsContainer}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className={skeletonStyles.statCard}>
            <div
              className={skeletonStyles.bone}
              style={{
                width: "40%",
                height: 36,
                borderRadius: 6,
                margin: "0 auto 10px",
              }}
            />
            <div
              className={skeletonStyles.bone}
              style={{
                width: "60%",
                height: 14,
                borderRadius: 4,
                margin: "0 auto 6px",
              }}
            />
            <div
              className={skeletonStyles.bone}
              style={{
                width: "80%",
                height: 11,
                borderRadius: 3,
                margin: "0 auto",
              }}
            />
          </div>
        ))}
      </div>

      {/* Recent requests table */}
      <div className={skeletonStyles.tableCard}>
        <div
          className={skeletonStyles.bone}
          style={{ width: 150, height: 18, borderRadius: 4, marginBottom: 16 }}
        />
        {/* Header */}
        <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
          {[40, 200, 90, 80].map((w, i) => (
            <div
              key={i}
              className={skeletonStyles.bone}
              style={{ width: w, height: 13, borderRadius: 3 }}
            />
          ))}
        </div>
        {/* Rows */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className={skeletonStyles.tableRow}>
            {[40, 200, 90, 70].map((w, j) => (
              <div
                key={j}
                className={skeletonStyles.bone}
                style={{ width: w, height: 13, borderRadius: 3 }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Info cards */}
      <div className={styles.infoCardsRow} style={{ marginTop: 24 }}>
        {[...Array(2)].map((_, i) => (
          <div key={i} className={skeletonStyles.infoCard}>
            <div
              className={skeletonStyles.bone}
              style={{
                width: 100,
                height: 16,
                borderRadius: 4,
                marginBottom: 10,
              }}
            />
            <div
              className={skeletonStyles.bone}
              style={{
                width: "90%",
                height: 12,
                borderRadius: 3,
                marginBottom: 6,
              }}
            />
            <div
              className={skeletonStyles.bone}
              style={{ width: "70%", height: 12, borderRadius: 3 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
