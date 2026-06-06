// src/app/components/SkeletonAdminDashboard.jsx
import styles from "../styles/Dashboard.module.css";
import skeletonStyles from "../styles/Skeleton.module.css";

export default function SkeletonAdminDashboard() {
  return (
    <div>
      {/* Page title + export button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div
          className={skeletonStyles.bone}
          style={{ width: 200, height: 28, borderRadius: 6 }}
        />
        <div
          className={skeletonStyles.bone}
          style={{ width: 140, height: 36, borderRadius: 8 }}
        />
      </div>

      {/* Stat cards */}
      <div className={styles.adminStatsRow}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className={skeletonStyles.statCard}>
            <div
              className={skeletonStyles.bone}
              style={{
                width: "60%",
                height: 14,
                borderRadius: 4,
                marginBottom: 14,
              }}
            />
            <div
              className={skeletonStyles.bone}
              style={{ width: "40%", height: 36, borderRadius: 6 }}
            />
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className={styles.dashboardGrid}>
        {/* Left: table */}
        <div className={styles.leftColumn}>
          <div className={skeletonStyles.tableCard}>
            <div
              className={skeletonStyles.bone}
              style={{
                width: 180,
                height: 18,
                borderRadius: 4,
                marginBottom: 20,
              }}
            />
            {/* Table header */}
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              {[40, 80, 70, 70, 90, 120, 70, 60].map((w, i) => (
                <div
                  key={i}
                  className={skeletonStyles.bone}
                  style={{
                    width: w,
                    height: 13,
                    borderRadius: 3,
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
            {/* Table rows */}
            {[...Array(5)].map((_, i) => (
              <div key={i} className={skeletonStyles.tableRow}>
                {[40, 80, 70, 70, 80, 120, 70, 50].map((w, j) => (
                  <div
                    key={j}
                    className={skeletonStyles.bone}
                    style={{
                      width: w,
                      height: 13,
                      borderRadius: 3,
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Right: charts */}
        <div className={styles.rightColumn}>
          <div className={skeletonStyles.chartCard}>
            <div
              className={skeletonStyles.bone}
              style={{
                width: 160,
                height: 16,
                borderRadius: 4,
                marginBottom: 16,
              }}
            />
            <div
              className={skeletonStyles.bone}
              style={{
                width: 160,
                height: 160,
                borderRadius: "50%",
                margin: "0 auto 16px",
              }}
            />
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={skeletonStyles.bone}
                style={{
                  width: "70%",
                  height: 12,
                  borderRadius: 3,
                  margin: "0 auto 8px",
                }}
              />
            ))}
          </div>
          <div className={skeletonStyles.chartCard}>
            <div
              className={skeletonStyles.bone}
              style={{
                width: 130,
                height: 16,
                borderRadius: 4,
                marginBottom: 16,
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 10,
                height: 130,
                padding: "0 8px",
              }}
            >
              {[60, 100, 45].map((h, i) => (
                <div
                  key={i}
                  className={skeletonStyles.bone}
                  style={{ flex: 1, height: h, borderRadius: "4px 4px 0 0" }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
