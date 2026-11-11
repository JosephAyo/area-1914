import ui from "./LayoutSwitch.module.scss";
export function LayoutSwitch({
  value,
  onChange,
}: {
  value: "grid" | "list";
  onChange: (value: "grid" | "list") => void;
}) {
  return (
    <div className={ui.switch} role="group" aria-label="Subject layout">
      <button
        type="button"
        aria-label="Grid view"
        title="Grid view"
        aria-pressed={value === "grid"}
        onClick={() => onChange("grid")}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden="true"
        >
          <rect x="4" y="4" width="6" height="6" rx=".5" />
          <rect x="14" y="4" width="6" height="6" rx=".5" />
          <rect x="4" y="14" width="6" height="6" rx=".5" />
          <rect x="14" y="14" width="6" height="6" rx=".5" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="List view"
        title="List view"
        aria-pressed={value === "list"}
        onClick={() => onChange("list")}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M4 6h2m4 0h10M4 12h2m4 0h10M4 18h2m4 0h10" />
        </svg>
      </button>
    </div>
  );
}
