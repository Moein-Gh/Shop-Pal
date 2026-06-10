import { useState } from "react";
import { Loader2 } from "lucide-react";
import { ResponsiveDialog } from "./ui/responsive-dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useCreateList } from "../api/hooks";

interface AddListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (listId: string) => void;
}

export function AddListDialog({ open, onOpenChange, onCreated }: AddListDialogProps) {
  const [name, setName] = useState("");
  const createList = useCreateList();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const list = await createList.mutateAsync(name);
    setName("");
    onOpenChange(false);
    onCreated?.(list.id);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title="New list">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="list-name">Name *</Label>
          <Input
            id="list-name"
            placeholder="e.g. Weekly groceries"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>

        {createList.error && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
            Failed to create list. Please try again.
          </p>
        )}

        <Button type="submit" className="w-full" disabled={createList.isPending}>
          {createList.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Create list
        </Button>
      </form>
    </ResponsiveDialog>
  );
}
