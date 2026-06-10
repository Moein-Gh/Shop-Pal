import { AnimatePresence, motion } from "motion/react";
import { Loader2, ShoppingCart, Plus, ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";
import { SwipeableItem } from "./SwipeableItem";
import type { Item } from "../types";
import { useState } from "react";

interface ItemListProps {
  activeListId: string | null;
  listsLoading: boolean;
  itemsLoading: boolean;
  items: Item[] | undefined;
  activeCategory: string | null;
  onCategoryFilter: (category: string | null) => void;
  onToggleCheck: (item: Item) => void;
  onDeleteItem: (id: string) => void;
  onNavigateItem: (id: string) => void;
  onCreateList: () => void;
}

export function ItemList({
  activeListId,
  listsLoading,
  itemsLoading,
  items,
  onToggleCheck,
  onDeleteItem,
  onNavigateItem,
  onCreateList,
}: ItemListProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggle = (category: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(category) ? next.delete(category) : next.add(category);
      return next;
    });

  const uncheckedItems = items?.filter((i) => !i.checked) ?? [];
  const checkedItems = items?.filter((i) => i.checked) ?? [];

  const grouped = uncheckedItems.reduce<Record<string, Item[]>>((acc, item) => {
    const key = item.category || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  if (!activeListId && listsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!activeListId && !listsLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col items-center justify-center text-center gap-5 py-16"
      >
        <div className="w-20 h-20 rounded-3xl bg-card shadow-sm border border-border flex items-center justify-center">
          <ShoppingCart className="w-9 h-9 text-muted-foreground/40" />
        </div>
        <div>
          <p className="font-semibold text-base">No lists yet</p>
          <p className="text-sm text-muted-foreground mt-1">Create your first shopping list to get started</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onCreateList}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create a list
        </motion.button>
      </motion.div>
    );
  }

  if (activeListId && itemsLoading) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading items…</span>
      </div>
    );
  }

  if (activeListId && !itemsLoading && items?.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-72 text-center gap-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-card shadow-sm flex items-center justify-center">
          <ShoppingCart className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <div>
          <p className="font-medium">List is empty</p>
          <p className="text-sm text-muted-foreground mt-1">Tap + to add your first item</p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      {Object.entries(grouped).map(([category, categoryItems]) => {
        const isCollapsed = collapsed.has(category);
        return (
          <div key={category} className="mb-6">
            <button
              onClick={() => toggle(category)}
              className="flex items-center gap-3 w-full mb-2 px-1 group"
            >
              <div className="flex-1 h-px bg-border" />
              <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground shrink-0 select-none">
                {category}
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 transition-transform duration-200",
                    isCollapsed && "-rotate-90",
                  )}
                />
              </span>
              <div className="flex-1 h-px bg-border" />
            </button>

            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2">
                    <AnimatePresence initial={false}>
                      {categoryItems.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.16 } }}
                          transition={{ duration: 0.18 }}
                        >
                          <SwipeableItem
                            item={item}
                            onCheck={() => onToggleCheck(item)}
                            onDelete={() => onDeleteItem(item.id)}
                            onNavigate={() => onNavigateItem(item.id)}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      <AnimatePresence>
        {checkedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-6"
          >
            <div
              className="my-4"
              style={{
                height: 1,
                background: "linear-gradient(to right, transparent, var(--color-border) 30%, var(--color-border) 70%, transparent)",
                opacity: 0.6,
              }}
            />
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Done · {checkedItems.length}
              </span>
            </div>
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {checkedItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.16 } }}
                    transition={{ duration: 0.18 }}
                  >
                    <SwipeableItem
                      item={item}
                      onCheck={() => onToggleCheck(item)}
                      onDelete={() => onDeleteItem(item.id)}
                      onNavigate={() => onNavigateItem(item.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
