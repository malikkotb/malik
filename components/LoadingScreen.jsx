import styles from "./LoadingScreen.module.css";

export default function LoadingScreen() {
  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.line} />
      </div>
    </div>
  );
}
