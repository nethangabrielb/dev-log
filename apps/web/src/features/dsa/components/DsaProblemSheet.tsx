import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DsaProblemForm,
  type DsaProblemFormProps,
} from "./DsaProblemForm";

export interface DsaProblemSheetProps
  extends Omit<DsaProblemFormProps, "onCancel"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DsaProblemSheet({
  open,
  onOpenChange,
  ...formProps
}: DsaProblemSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add Problem</SheetTitle>
          <SheetDescription>
            Record a new DSA problem to track.
          </SheetDescription>
        </SheetHeader>
        {open && (
          <div className="px-4">
            <DsaProblemForm {...formProps} onCancel={() => onOpenChange(false)} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
