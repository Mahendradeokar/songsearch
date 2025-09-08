import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";

export function Loading(props: ComponentProps<"div">) {
  return (
    <div
      className={`flex justify-center items-center min-h-12 ${
        props.className ?? ""
      }`}
      {...props}
    >
      <Loader2 className="h-9 w-9 animate-spin" />
    </div>
  );
}
