import { useForm, Controller } from "react-hook-form";
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
import { getApiErrorMessage } from "../lib/apiError";
import { GoogleLoginButton } from "../components/common/GoogleLoginButton";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";

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
    control,
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
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Registration failed. Please try again.")
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">
            Create your account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your details to register for Dev
            <span className="text-accent">Log</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm rounded-md border border-destructive/40 bg-destructive/10 text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2 text-left">
              <label
                htmlFor="username"
                className="text-sm font-medium leading-none"
              >
                Username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                {...register("username")}
              />
              {errors.username && (
                <p className="text-xs text-destructive">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2 text-left">
              <label
                htmlFor="email"
                className="text-sm font-medium leading-none"
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
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2 text-left">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none"
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
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2 text-left">
              <label
                htmlFor="timezone"
                className="text-sm font-medium leading-none"
              >
                Timezone
              </label>
              <Controller
                name="timezone"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.timezone && (
                <p className="text-xs text-destructive">
                  {errors.timezone.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-accent text-accent-fg hover:bg-accent-dim"
            >
              {isSubmitting ? "Creating account..." : "Register"}
            </Button>
          </form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-text-muted">or</span>
            </div>
          </div>
          <GoogleLoginButton />
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium hover:underline text-accent"
            >
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
