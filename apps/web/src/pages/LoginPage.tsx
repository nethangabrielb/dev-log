import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  loginSchema,
  type LoginInput,
} from "../features/auth/schemas/auth.schema";
import { authApi } from "../api/auth.api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { keys } from "../lib/queryKeys";

export function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    try {
      await authApi.login(data);
      await queryClient.invalidateQueries({ queryKey: keys.auth.profile() });
      navigate("/");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Invalid credentials. Please try again."
      );
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: "var(--devlog-bg-base)",
        color: "var(--devlog-text-primary)",
      }}
    >
      <Card
        className="w-full max-w-md border rounded-xl"
        style={{
          backgroundColor: "var(--devlog-bg-surface)",
          borderColor: "var(--devlog-border)",
        }}
      >
        <CardHeader className="space-y-1">
          <CardTitle
            className="text-2xl font-bold tracking-tight text-center"
            style={{ color: "var(--devlog-text-primary)" }}
          >
            Log in to Dev
            <span style={{ color: "var(--devlog-accent)" }}>Log</span>
          </CardTitle>
          <CardDescription
            className="text-center text-sm"
            style={{ color: "var(--devlog-text-secondary)" }}
          >
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div
                className="p-3 text-sm rounded-md border"
                style={{
                  backgroundColor: "rgba(248, 113, 113, 0.1)",
                  borderColor: "var(--devlog-danger)",
                  color: "var(--devlog-danger)",
                }}
              >
                {error}
              </div>
            )}
            <div className="space-y-2 text-left">
              <label
                htmlFor="email"
                className="text-sm font-medium leading-none"
                style={{ color: "var(--devlog-text-primary)" }}
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs" style={{ color: "var(--devlog-danger)" }}>
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2 text-left">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none"
                style={{ color: "var(--devlog-text-primary)" }}
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs" style={{ color: "var(--devlog-danger)" }}>
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full font-medium transition-colors cursor-pointer border-0 shadow-none"
              style={{
                backgroundColor: "var(--devlog-accent)",
                color: "var(--devlog-accent-fg)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--devlog-accent-dim)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--devlog-accent)")
              }
            >
              {isSubmitting ? "Logging in..." : "Log in"}
            </Button>
          </form>
        </CardContent>
        <CardFooter
          className="flex justify-center border-t py-4 rounded-b-xl"
          style={{
            backgroundColor: "var(--devlog-bg-surface)",
            borderColor: "var(--devlog-border)",
          }}
        >
          <p className="text-sm" style={{ color: "var(--devlog-text-secondary)" }}>
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium hover:underline"
              style={{ color: "var(--devlog-accent)" }}
            >
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
