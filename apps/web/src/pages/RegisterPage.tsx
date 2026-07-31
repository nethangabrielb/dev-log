import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import {
  registerSchema,
  type RegisterInput,
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
import { Select } from "../components/ui/select";

const TIMEZONES = [
  { value: "Asia/Manila", label: "Asia/Manila (PHT, UTC+8)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (SGT, UTC+8)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST, UTC+9)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST, UTC+0)" },
  { value: "Europe/Paris", label: "Europe/Paris (CET/CEST, UTC+1)" },
  { value: "America/New_York", label: "America/New_York (EST/EDT, UTC-5)" },
  { value: "America/Chicago", label: "America/Chicago (CST/CDT, UTC-6)" },
  {
    value: "America/Los_Angeles",
    label: "America/Los_Angeles (PST/PDT, UTC-8)",
  },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST/AEDT, UTC+10)" },
  { value: "UTC", label: "UTC" },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      timezone: "Asia/Manila",
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setError(null);
    try {
      await authApi.register(data);
      navigate("/login");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
      <Card className="w-full max-w-md border border-border bg-card shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-center text-text-primary">
            Create your account
          </CardTitle>
          <CardDescription className="text-center text-sm text-text-secondary">
            Enter your details to register for Dev
            <span className="text-accent font-semibold">Log</span>
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
                htmlFor="username"
                className="text-sm font-medium leading-none text-text-primary"
              >
                Username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                {...register("username")}
                className="bg-bg-elevated border-border text-text-primary placeholder:text-text-muted focus-visible:ring-accent"
              />
              {errors.username && (
                <p className="text-xs text-danger">{errors.username.message}</p>
              )}
            </div>

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
                <p className="text-xs text-danger">{errors.email.message}</p>
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
                <p className="text-xs text-danger">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2 text-left">
              <label
                htmlFor="timezone"
                className="text-sm font-medium leading-none text-text-primary"
              >
                Timezone
              </label>
              <Select
                id="timezone"
                {...register("timezone")}
                className="bg-bg-elevated border-border text-text-primary focus-visible:ring-accent"
              >
                {TIMEZONES.map((tz) => (
                  <option
                    key={tz.value}
                    value={tz.value}
                    className="bg-bg-elevated text-text-primary"
                  >
                    {tz.label}
                  </option>
                ))}
              </Select>
              {errors.timezone && (
                <p className="text-xs text-danger">{errors.timezone.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full font-medium bg-accent text-accent-fg hover:bg-accent/90 cursor-pointer"
            >
              {isSubmitting ? "Creating account..." : "Register"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border py-4 bg-bg-surface rounded-b-xl">
          <p className="text-sm text-text-secondary">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-accent hover:underline"
            >
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
