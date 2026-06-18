import styles from "./Skeleton.module.scss";

import type { CSSProperties } from "react";

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({
  width = "100%",
  height = "1em",
  borderRadius,
  className,
  style,
}: SkeletonProps) {
  return (
    <div
      className={`${styles.block} ${className ?? ""}`}
      style={{
        width,
        height,
        ...(borderRadius ? { borderRadius } : {}),
        ...style,
      }}
    />
  );
}
