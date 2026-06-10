import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useGetItemsByList, useEditItem } from "../api/hooks";
import { useAtomValue } from "jotai";
import { activeListIdAtom } from "../atoms/lists";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import type { Item } from "../types";

export default function ItemDetailPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const activeListId = useAtomValue(activeListIdAtom);

  const { data: items } = useGetItemsByList(activeListId);
  const item = items?.find((i) => i.id === itemId);

  const [form, setForm] = useState({ name: "", quantity: "", category: "", note: "" });
  const [saved, setSaved] = useState(false);
  const editItem = useEditItem();

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name,
        quantity: item.quantity ?? "",
        category: item.category ?? "",
        note: item.note ?? "",
      });
    }
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemId) return;
    await editItem.mutateAsync({
      itemId,
      item: {
        name: form.name,
        quantity: form.quantity || undefined,
        category: form.category || undefined,
        note: form.note || undefined,
      },
    });
    setSaved(true);
  };

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="flex items-center gap-3 px-4 h-14 max-w-lg mx-auto w-full">
          <button
            onClick={() => navigate(-1)}
            className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-foreground truncate flex-1">{item.name}</h1>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 max-w-lg mx-auto w-full px-4 pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="detail-name">Name *</Label>
            <Input
              id="detail-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="detail-quantity">Quantity</Label>
              <Input
                id="detail-quantity"
                name="quantity"
                placeholder="e.g. 2 liters"
                value={form.quantity}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="detail-category">Category</Label>
              <Input
                id="detail-category"
                name="category"
                placeholder="e.g. Dairy"
                value={form.category}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="detail-note">Note</Label>
            <Input
              id="detail-note"
              name="note"
              placeholder="Any extra detail..."
              value={form.note}
              onChange={handleChange}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Added by {item.creatorUserId}
          </p>

          {editItem.error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              Failed to save. Please try again.
            </p>
          )}

          <Button type="submit" className="w-full" disabled={editItem.isPending}>
            {editItem.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saved ? "Saved!" : "Save changes"}
          </Button>
        </form>
      </div>
    </div>
  );
}
