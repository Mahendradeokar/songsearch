import { PlaylistForm } from "./playlist-form";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

type PlaylistFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: { name: string; description: string }) => Promise<void>;
  defaultValues?: { name: string; description: string };
  title: string;
};

export function PlaylistFormModal({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  title,
}: PlaylistFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md px-6 py-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>
        <div className="pt-2">
          <PlaylistForm
            defaultValues={defaultValues}
            onSubmit={async (values) => {
              await onSubmit(values);
              onOpenChange(false);
            }}
            resetStrategy="fieldAndStateReset"
          >
            <div className="space-y-4">
              <PlaylistForm.Input name="name" label="Name" />
              <PlaylistForm.Input name="description" label="Description" />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <PlaylistForm.Button>
                {defaultValues ? "Update" : "Create"}
              </PlaylistForm.Button>
            </div>
          </PlaylistForm>
        </div>
      </DialogContent>
    </Dialog>
  );
}
