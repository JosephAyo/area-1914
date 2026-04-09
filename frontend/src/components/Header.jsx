import styles from './Header.module.scss';

export function Header({ onHomeClick }) {
  return (
    <header className={styles.header}>
      <div
        className={styles.logo}
        onClick={onHomeClick}
        role="button"
        tabIndex={0}
      >
        The Nigerian History
        <span className={styles.pulseIcon}>Pulse</span>
      </div>
    </header>
  );
}
