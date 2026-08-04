import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ArticleForm, type ArticleFormProps } from "./ArticleForm";

export interface ArticleSheetProps
  extends Omit<ArticleFormProps, "onCancel"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ArticleSheet({
  open,
  onOpenChange,
  ...formProps
}: ArticleSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>New Article</SheetTitle>
          <SheetDescription>
            Add an article to your reading list.
          </SheetDescription>
        </SheetHeader>
        {open && (
          <div className="px-4">
            <ArticleForm {...formProps} onCancel={() => onOpenChange(false)} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
