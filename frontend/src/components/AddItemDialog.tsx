import { useState } from "react";
import { Loader2 } from "lucide-react";
import { ResponsiveDialog } from "./ui/responsive-dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAddItem } from "../api/hooks";

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string;
}

export function AddItemDialog({ open, onOpenChange, listId }: AddItemDialogProps) {
  const [form, setForm] = useState({ name: "", quantity: "", category: "", note: "" });
  const addItem = useAddItem();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addItem.mutateAsync({
      listId,
      name: form.name,
      quantity: form.quantity || undefined,
      category: form.category || undefined,
      note: form.note || undefined,
    });
    setForm({ name: "", quantity: "", category: "", note: "" });
    onOpenChange(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title="Add item">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="item-name">Name *</Label>
          <Input
            id="item-name"
            name="name"
            placeholder="e.g. Milk"
            value={form.name}
            onChange={handleChange}
            required
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="item-quantity">Quantity</Label>
            <Input
              id="item-quantity"
              name="quantity"
              placeholder="e.g. 2 liters"
              value={form.quantity}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="item-category">Category</Label>
            <Input
              id="item-category"
              name="category"
              placeholder="e.g. Dairy"
              value={form.category}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="item-note">Note</Label>
          <Input
            id="item-note"
            name="note"
            placeholder="Any extra detail..."
            value={form.note}
            onChange={handleChange}
          />
        </div>

        {addItem.error && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
            Failed to add item. Please try again.
          </p>
        )}

        <Button type="submit" className="w-full" disabled={addItem.isPending}>
          {addItem.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Add item
        </Button>
      </form>
    </ResponsiveDialog>
  );
}
