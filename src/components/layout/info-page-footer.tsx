import Link from "next/link";

export function InfoPageFooter() {
  return (
    <footer className="mt-16 border-t border-border pt-8">
      <div className="flex min-h-5 items-center justify-between">
        <Link
          href="/privacy"
          className="text-sm text-muted-foreground/60 transition-colors hover:text-foreground"
        >
          Privacy
        </Link>

        <a
          href="https://chandumachineni.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground/60 transition-colors hover:text-foreground"
        >
          Made by <span className="font-medium">Chandu Machineni</span>
        </a>
      </div>
    </footer>
  );
}
