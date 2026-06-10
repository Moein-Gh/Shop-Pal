import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Plus, Settings2 } from "lucide-react";
import { cn } from "../lib/utils";
import type { UserList } from "../types/UserList";

interface ListHeaderProps {
  userLists: UserList[] | undefined;
  activeListId: string | null;
  listsLoading: boolean;
  listPickerOpen: boolean;
  onListPickerToggle: () => void;
  onListPickerClose: () => void;
  onSelectList: (id: string) => void;
  onNewList: () => void;
  onSettingsOpen: () => void;
}

export function ListHeader({
  userLists,
  activeListId,
  listsLoading,
  listPickerOpen,
  onListPickerToggle,
  onListPickerClose,
  onSelectList,
  onNewList,
  onSettingsOpen,
}: ListHeaderProps) {
  return (
    <div
      className="sticky top-0 z-50 backdrop-blur-sm"
      style={{ background: "color-mix(in srgb, var(--color-background) 92%, transparent)" }}
    >
      <div className="flex items-center px-4 max-w-lg mx-auto w-full pt-3 pb-3 gap-2">
        <div className="relative flex-1 min-w-0">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onListPickerToggle}
            className="flex items-center gap-2 min-w-0 max-w-full"
          >
            {listsLoading ? (
              <span className="text-lg font-semibold text-muted-foreground">My Lists</span>
            ) : (
              <>
                <span className="text-lg font-semibold truncate leading-tight">
                  {userLists?.find((ul) => ul.List.id === activeListId)?.List.name ?? "My Lists"}
                </span>
                {userLists && userLists.length > 0 && (
                  <motion.span
                    animate={{ rotate: listPickerOpen ? 180 : 0 }}
                    transition={{ duration: 0.18 }}
                    className="shrink-0 text-muted-foreground"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.span>
                )}
              </>
            )}
          </motion.button>

          <AnimatePresence>
            {listPickerOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onPointerDown={onListPickerClose}
                />
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-2 z-50 min-w-48 rounded-2xl bg-card border border-border shadow-xl overflow-hidden"
                >
                  {userLists?.map((ul) => (
                    <button
                      key={ul.List.id}
                      onClick={() => onSelectList(ul.List.id)}
                      className={cn(
                        "w-full text-left px-4 py-3 text-sm font-medium transition-colors first:pt-3.5 last:pb-3.5",
                        ul.List.id === activeListId
                          ? "text-primary bg-primary/5"
                          : "text-foreground hover:bg-muted/60",
                      )}
                    >
                      {ul.List.name}
                    </button>
                  ))}
                  <div className="border-t border-border">
                    <button
                      onClick={onNewList}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-primary hover:bg-primary/5 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      New list
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {activeListId && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onSettingsOpen}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground bg-muted/60 hover:text-foreground hover:bg-muted transition-colors"
          >
            <Settings2 className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      <div
        className="h-3 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, color-mix(in srgb, var(--color-background) 92%, transparent), transparent)" }}
      />
    </div>
  );
}
