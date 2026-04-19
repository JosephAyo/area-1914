import styles from "./Header.module.scss";

interface HeaderProps {
  onHomeClick: () => void;
}

export function Header({ onHomeClick }: HeaderProps) {
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
