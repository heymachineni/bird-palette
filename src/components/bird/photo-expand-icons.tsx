export function ExpandPhotoIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      viewBox="0 0 24 24"
      width={16}
      height={16}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12V9c0-1.886 0-2.828-.586-3.414S16.886 5 15 5h-3m-7 7v3c0 1.886 0 2.828.586 3.414S7.114 19 9 19h3" />
    </svg>
  );
}

export function CollapsePhotoIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      viewBox="0 0 24 24"
      width={16}
      height={16}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13 4v3c0 1.886 0 2.828.586 3.414S15.114 11 17 11h3m-9 9v-3c0-1.886 0-2.828-.586-3.414S8.886 13 7 13H4" />
    </svg>
  );
}
