import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SnippetForm, type SnippetFormProps } from "./SnippetForm";

export interface SnippetSheetProps
  extends Omit<SnippetFormProps, "onCancel"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SnippetSheet({
  open,
  onOpenChange,
  ...formProps
}: SnippetSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>New Snippet</SheetTitle>
          <SheetDescription>
            Add a snippet to your code library.
          </SheetDescription>
        </SheetHeader>
        {open && (
          <div className="px-4">
            <SnippetForm {...formProps} onCancel={() => onOpenChange(false)} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
