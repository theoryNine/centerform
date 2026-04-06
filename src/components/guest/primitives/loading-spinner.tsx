export function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <svg
        className="animate-spin"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(45,42,38,0.25)"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    </div>
  );
}
