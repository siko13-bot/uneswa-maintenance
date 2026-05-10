// src/app/page.js
import Link from "next/link";
import styles from "./styles/Dashboard.module.css";

export default function Home() {
  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.logoLg}>UNESWA Maintenance System</div>
        <h2>Select Role to Login</h2>
        <div className={styles.loginButtons}>
          <Link href="/student" className={styles.loginBtnStudent}>
            Login as Student
          </Link>
          <Link href="/admin" className={styles.loginBtnAdmin}>
            Login as Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
