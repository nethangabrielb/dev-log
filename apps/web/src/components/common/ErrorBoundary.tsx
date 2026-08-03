import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div
          className="min-h-[300px] flex flex-col items-center justify-center p-6 text-center rounded-xl border my-4"
          style={{
            backgroundColor: "var(--devlog-bg-surface)",
            borderColor: "var(--devlog-border)",
            color: "var(--devlog-text-primary)",
          }}
        >
          <AlertTriangle
            className="h-8 w-8 mb-3"
            style={{ color: "var(--devlog-danger)" }}
          />
          <h3 className="text-base font-semibold mb-1">
            Something went wrong
          </h3>
          <p className="text-sm max-w-md mb-4 text-muted-foreground">
            {this.state.error?.message ||
              "An unexpected error occurred while rendering this page."}
          </p>
          <Button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="bg-accent text-accent-fg hover:bg-accent-dim"
          >
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
