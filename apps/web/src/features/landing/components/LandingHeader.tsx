import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export function LandingHeader() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg-surface">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
        <Link
          to="/"
          className="text-lg font-semibold tracking-tight text-text-primary"
        >
          Dev<span className="font-bold text-accent">Log</span>
        </Link>

        <div className="flex items-center gap-3">
          {!isLoading &&
            (isAuthenticated ? (
              <>
                <span className="hidden max-w-48 truncate text-sm text-text-secondary sm:inline">
                  {user?.email}
                </span>
                <Link
                  to="/dashboard"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Go to Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" }),
                    "bg-accent text-accent-fg hover:bg-accent-dim"
                  )}
                >
                  Sign Up
                </Link>
              </>
            ))}
        </div>
      </div>
    </header>
  );
}
