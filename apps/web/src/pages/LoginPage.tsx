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
          "Invalid credentials. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
      <Card className="w-full max-w-md border border-border bg-card shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-center text-text-primary">
            Log in to Dev<span className="text-accent font-semibold">Log</span>
          </CardTitle>
          <CardDescription className="text-center text-sm text-text-secondary">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm rounded-md border border-danger/30 bg-danger/10 text-danger">
                {error}
              </div>
            )}
            <div className="space-y-2 text-left">
              <label
                htmlFor="email"
                className="text-sm font-medium leading-none text-text-primary"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register("email")}
                className="bg-bg-elevated border-border text-text-primary placeholder:text-text-muted focus-visible:ring-accent"
              />
              {errors.email && (
                <p className="text-xs text-danger">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2 text-left">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none text-text-primary"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className="bg-bg-elevated border-border text-text-primary placeholder:text-text-muted focus-visible:ring-accent"
              />
              {errors.password && (
                <p className="text-xs text-danger">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full font-medium bg-accent text-accent-fg hover:bg-accent/90 cursor-pointer"
            >
              {isSubmitting ? "Logging in..." : "Log in"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border py-4 bg-bg-surface rounded-b-xl">
          <p className="text-sm text-text-secondary">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-accent hover:underline"
            >
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
