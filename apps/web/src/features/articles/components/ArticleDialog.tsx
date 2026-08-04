import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArticleForm, type ArticleFormProps } from "./ArticleForm";

export interface ArticleDialogProps
  extends Omit<ArticleFormProps, "onCancel"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ArticleDialog({
  open,
  onOpenChange,
  ...formProps
}: ArticleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Article</DialogTitle>
          <DialogDescription>
            Update the article's details.
          </DialogDescription>
        </DialogHeader>
        {open && (
          <ArticleForm {...formProps} onCancel={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}
