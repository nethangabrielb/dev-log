import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ProjectForm, type ProjectFormProps } from "./ProjectForm";

export interface ProjectSheetProps
  extends Omit<ProjectFormProps, "onCancel"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectSheet({
  open,
  onOpenChange,
  ...formProps
}: ProjectSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>New Project</SheetTitle>
          <SheetDescription>
            Create a project to track time and tasks against.
          </SheetDescription>
        </SheetHeader>
        {open && (
          <div className="px-4">
            <ProjectForm {...formProps} onCancel={() => onOpenChange(false)} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
