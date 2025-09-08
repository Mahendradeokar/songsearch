import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { signupSchema } from "~/lib/validations/auth-validation";
import { signup } from "~/lib/request/auth-requests";
import { toast } from "sonner";

type SignupForm = z.infer<typeof signupSchema>;

export default function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const navigate = useNavigate();

  const onSubmit = async (form: SignupForm) => {
    const { error } = await signup(form);

    if (error) {
      const detail = error.detail ?? "Signup failed";
      toast.error(detail);
      return;
    }

    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <div className="mt-2 text-muted-foreground text-sm">
            Create your account to start building playlists and discovering new
            music!
          </div>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div>
              <Label htmlFor="name" className="mb-1 block">
                Name
              </Label>
              <Input
                id="name"
                {...register("name")}
                disabled={isSubmitting}
                autoComplete="name"
                required
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
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
                autoComplete="new-password"
                required
              />
              {errors.password && (
                <p className="text-sm text-destructive mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing up..." : "Sign Up"}
            </Button>
          </form>
          <div className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary underline hover:no-underline"
            >
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
