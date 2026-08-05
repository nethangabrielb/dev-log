import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export function LandingHero() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-24 text-center sm:py-32">
      <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight text-text-primary sm:text-5xl">
        Built for developers who actually want to{" "}
        <span className="text-accent">know where their time goes.</span>
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-text-secondary">
        Log focused work, DSA practice, and reading with a start/stop timer, then
        review it all in auto-generated daily reports.
      </p>

      {!isLoading && (
        <div className="mt-10 flex items-center justify-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "h-10 px-6 bg-accent text-accent-fg hover:bg-accent-dim"
              )}
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "h-10 px-6 bg-accent text-accent-fg hover:bg-accent-dim"
                )}
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-10 px-6"
                )}
              >
                Login
              </Link>
            </>
          )}
        </div>
      )}
    </section>
  );
}
