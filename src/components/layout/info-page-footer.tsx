import Link from "next/link";

export function InfoPageFooter() {
  return (
    <footer className="mt-16 border-t border-border pt-8">
      <div className="flex items-center gap-4">
        <Link
          href="/privacy"
          className="text-sm text-muted-foreground/60 transition-colors hover:text-foreground"
        >
          Privacy
        </Link>
        <Link
          href="/terms"
          className="text-sm text-muted-foreground/60 transition-colors hover:text-foreground"
        >
          Terms
        </Link>
      </div>
    </footer>
  );
}
