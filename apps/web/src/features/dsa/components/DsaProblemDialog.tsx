import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DsaProblemForm,
  type DsaProblemFormProps,
} from "./DsaProblemForm";

export interface DsaProblemDialogProps
  extends Omit<DsaProblemFormProps, "onCancel"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DsaProblemDialog({
  open,
  onOpenChange,
  ...formProps
}: DsaProblemDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Problem</DialogTitle>
          <DialogDescription>
            Update the problem's details.
          </DialogDescription>
        </DialogHeader>
        {open && (
          <DsaProblemForm {...formProps} onCancel={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}
