import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SnippetForm, type SnippetFormProps } from "./SnippetForm";

export interface SnippetDialogProps
  extends Omit<SnippetFormProps, "onCancel"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SnippetDialog({
  open,
  onOpenChange,
  ...formProps
}: SnippetDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Snippet</DialogTitle>
          <DialogDescription>
            Update the snippet's details.
          </DialogDescription>
        </DialogHeader>
        {open && (
          <SnippetForm {...formProps} onCancel={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}
