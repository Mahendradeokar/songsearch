import * as React from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Loader2 } from "lucide-react";

const playlistFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().min(1, "Description is required"),
});

export type PlaylistPayload = z.infer<typeof playlistFormSchema>;

type PlaylistFormProps = {
  defaultValues?: Partial<PlaylistPayload>;
  onSubmit: (values: PlaylistPayload) => Promise<void>;
  className?: string;
  children?: React.ReactNode;
  resetStrategy: "fieldAndStateReset" | "OnlyStateReset" | "none";
};

export function PlaylistForm({
  defaultValues,
  onSubmit,
  className,
  children,
  resetStrategy,
}: PlaylistFormProps) {
  const methods = useForm<PlaylistPayload>({
    resolver: zodResolver(playlistFormSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
    },
    mode: "onChange",
  });

  const { handleSubmit } = methods;

  const runResetStrategy = () => {
    switch (resetStrategy) {
      case "OnlyStateReset": {
        methods.reset(methods.getValues());
        return;
      }
      case "fieldAndStateReset": {
        methods.reset();
        return;
      }
      case "none":
      default: {
        return;
      }
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values);
          runResetStrategy();
        })}
        className={cn("space-y-4", className)}
        noValidate
      >
        {children}
      </form>
    </FormProvider>
  );
}

function PlaylistFormButton({
  children,
  className,
  ...props
}: React.PropsWithChildren<React.ComponentProps<typeof Button>>) {
  const {
    formState: { isSubmitting, isValid, isDirty },
  } = useFormContext<PlaylistPayload>();
  return (
    <Button
      type="submit"
      className={className}
      disabled={isSubmitting || props.disabled || !isValid || !isDirty}
      {...props}
    >
      {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : children}
    </Button>
  );
}

function PlaylistFormInput({
  name,
  label,
  ...props
}: {
  name: keyof PlaylistPayload;
  label: string;
} & Omit<React.ComponentProps<typeof Input>, "name" | "ref">) {
  const {
    register,
    formState: { isSubmitting, errors },
  } = useFormContext<PlaylistPayload>();
  const error = errors[name]?.message as string | undefined;
  return (
    <div className="space-y-0.5">
      <label htmlFor={name}>{label}</label>
      <Input id={name} {...register(name)} disabled={isSubmitting} {...props} />
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
}

PlaylistForm.Button = PlaylistFormButton;
PlaylistForm.Input = PlaylistFormInput;
