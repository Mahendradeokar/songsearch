import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { loginSchema } from "~/lib/validations/auth-validation";
import { login } from "~/lib/request/auth-requests";
import { toast } from "sonner";
import { setAuthToken } from "~/lib/utils";

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const navigate = useNavigate();

  const onSubmit = async (form: LoginForm) => {
    const { error, data } = await login(form);

    if (error) {
      const detail = error.detail ?? "Login failed";
      toast.error(detail);
      return;
    }

    setAuthToken(data.token);
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <div className="mt-2 text-muted-foreground text-sm">
            Welcome back! Please enter your credentials to access your playlists
            and discover new music.
          </div>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div>
              <Label htmlFor="email" className="mb-1 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                disabled={isSubmitting}
                autoComplete="email"
                required
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="password" className="mb-1 block">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                disabled={isSubmitting}
                autoComplete="current-password"
                required
              />
              {errors.password && (
                <p className="text-sm text-destructive mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>
          <div className="mt-6 text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="text-primary underline hover:no-underline"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
