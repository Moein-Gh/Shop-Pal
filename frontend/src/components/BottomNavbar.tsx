import { List, Plus, Sparkles, User } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

interface BottomNavbarProps {
  activeTab: "lists" | "profile";
  onTabChange: (tab: "lists" | "profile") => void;
  onAddClick: () => void;
  onChatClick: () => void;
  chatOpen?: boolean;
  pendingInvitations?: number;
}

export function BottomNavbar({ activeTab, onTabChange, onAddClick, onChatClick, chatOpen = false, pendingInvitations = 0 }: BottomNavbarProps) {
  return (
    <div className="fixed bottom-5 inset-x-0 z-40 flex justify-center pointer-events-none">
      <div
        className="flex items-center gap-1 px-2 h-14 rounded-full pointer-events-auto border border-border/70"
        style={{
          background: "color-mix(in srgb, var(--color-card) 96%, transparent)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.6) inset",
        }}
      >
        {/* Lists */}
        <motion.button
          whileTap={{ scale: 0.82 }}
          onClick={() => onTabChange("lists")}
          className={cn(
            "flex items-center justify-center w-12 h-10 rounded-full transition-colors",
            activeTab === "lists" ? "text-primary bg-primary/8" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <List className="w-5.5 h-5.5" />
        </motion.button>

        {/* Add */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={onAddClick}
          className="flex items-center justify-center w-12 h-10 rounded-full bg-primary text-primary-foreground mx-1"
          style={{ boxShadow: "0 2px 10px rgba(99,102,241,0.35)" }}
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </motion.button>

        {/* AI Chat */}
        <motion.button
          whileTap={{ scale: 0.82 }}
          onClick={onChatClick}
          className={cn(
            "flex items-center justify-center w-12 h-10 rounded-full transition-colors",
            chatOpen ? "text-primary bg-primary/8" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Sparkles className="w-5 h-5" />
        </motion.button>

        {/* Profile */}
        <motion.button
          whileTap={{ scale: 0.82 }}
          onClick={() => onTabChange("profile")}
          className={cn(
            "relative flex items-center justify-center w-12 h-10 rounded-full transition-colors",
            activeTab === "profile" ? "text-primary bg-primary/8" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <User className="w-5.5 h-5.5" />
          {pendingInvitations > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none"
            >
              {pendingInvitations > 9 ? "9+" : pendingInvitations}
            </motion.span>
          )}
        </motion.button>
      </div>
    </div>
  );
}
