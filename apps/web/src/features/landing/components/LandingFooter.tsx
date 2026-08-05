import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-bg-surface">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
        <span className="text-sm font-semibold tracking-tight text-text-primary">
          Dev<span className="font-bold text-accent">Log</span>
        </span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-secondary">
            Built by Nethan Gabriel B. Bagasbas
          </span>
          <Link
            to="https://github.com/nethangabrielb/dev-log"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            <ExternalLink className="h-4 w-4" />
            GitHub
          </Link>
        </div>
      </div>
    </footer>
  );
}
