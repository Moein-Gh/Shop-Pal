import { useRef, useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { motion, AnimatePresence, useAnimationControls, type PanInfo } from "motion/react";
import { getCategoryStyle } from "../lib/categories";
import { cn } from "../lib/utils";
import { ResponsiveDialog } from "./ui/responsive-dialog";
import type { Item } from "../types";

interface SwipeableItemProps {
  item: Item;
  onCheck: () => void;
  onDelete: () => void;
  onNavigate: () => void;
}

export function SwipeableItem({ item, onCheck, onDelete, onNavigate }: SwipeableItemProps) {
  const controls = useAnimationControls();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [swipeHint, setSwipeHint] = useState<"check" | "delete" | null>(null);
  const didDrag = useRef(false);
  const style = getCategoryStyle(item.category || "Other");

  const handleDrag = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 8) didDrag.current = true;
    if (info.offset.x > 30) setSwipeHint("check");
    else if (info.offset.x < -30) setSwipeHint("delete");
    else setSwipeHint(null);
  };

  const handleDragEnd = async (_: unknown, info: PanInfo) => {
    setSwipeHint(null);
    if (info.offset.x < -80) {
      await controls.start({ x: -120, opacity: 0, transition: { duration: 0.2 } });
      controls.start({ x: 0, opacity: 1, transition: { duration: 0 } });
      setDeleteOpen(true);
    } else if (info.offset.x > 80) {
      await controls.start({ x: 40, transition: { duration: 0.12 } });
      controls.start({ x: 0, transition: { type: "spring", stiffness: 400, damping: 28 } });
      onCheck();
    } else {
      controls.start({ x: 0, transition: { type: "spring", stiffness: 400, damping: 28 } });
    }
    setTimeout(() => { didDrag.current = false; }, 200);
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 flex items-center justify-between px-5 rounded-2xl pointer-events-none">
          <motion.div
            className="flex items-center gap-2 text-emerald-500"
            animate={{ opacity: swipeHint === "check" ? 1 : 0, scale: swipeHint === "check" ? 1 : 0.7 }}
            transition={{ duration: 0.12 }}
          >
            <Check className="w-5 h-5" strokeWidth={2.5} />
          </motion.div>
          <motion.div
            className="flex items-center gap-2 text-red-500"
            animate={{ opacity: swipeHint === "delete" ? 1 : 0, scale: swipeHint === "delete" ? 1 : 0.7 }}
            transition={{ duration: 0.12 }}
          >
            <Trash2 className="w-5 h-5" />
          </motion.div>
        </div>

        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.3}
          animate={controls}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          className={cn(
            "relative flex items-center gap-3 bg-card rounded-2xl shadow-sm px-4 py-3.5 cursor-grab active:cursor-grabbing select-none",
            item.checked && "opacity-55",
          )}
        >
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              if (didDrag.current) return;
              onCheck();
            }}
            className={cn(
              "shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
              item.checked ? "bg-primary border-primary" : "border-border hover:border-primary",
            )}
          >
            <AnimatePresence>
              {item.checked && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <Check className="w-3 h-3 text-primary-foreground" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <button
            className="flex-1 text-left min-w-0"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              if (didDrag.current) return;
              onNavigate();
            }}
          >
            <p className={cn("text-sm font-medium truncate", item.checked && "line-through text-muted-foreground")}>
              {item.name}
              {item.quantity && (
                <span className="text-muted-foreground font-normal"> · {item.quantity}</span>
              )}
            </p>
          </button>

          <div className={cn("shrink-0 w-2 h-2 rounded-full", style.iconClass.replace("text-", "bg-"))} />
        </motion.div>
      </div>

      <ResponsiveDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete item?">
        <div className="px-1 pb-2">
          <p className="text-sm text-muted-foreground mb-5">
            Remove <span className="font-medium text-foreground">{item.name}</span> from the list?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { onDelete(); setDeleteOpen(false); }}
              className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </ResponsiveDialog>
    </>
  );
}
