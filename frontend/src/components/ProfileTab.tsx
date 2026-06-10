import { AnimatePresence, motion } from "motion/react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useGetInvitations, useAcceptInvitation, useDeclineInvitation } from "../api/hooks";
import { authAtom } from "../atoms/auth";
import { themeAtom, type ThemeMode } from "../atoms/theme";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import { BottomNavbar } from "./BottomNavbar";
import { cn } from "../lib/utils";

interface ProfileTabProps {
  onTabChange: (tab: "lists" | "profile") => void;
  onChatClick: () => void;
}

export function ProfileTab({ onTabChange, onChatClick }: ProfileTabProps) {
  const auth = useAtomValue(authAtom);
  const setAuth = useSetAtom(authAtom);
  const navigate = useNavigate();
  const [theme, setTheme] = useAtom(themeAtom);
  const { data: invitations } = useGetInvitations();
  const acceptInvitation = useAcceptInvitation();
  const declineInvitation = useDeclineInvitation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col pb-28">
      <div className="flex-1 max-w-lg mx-auto w-full px-4 pt-10 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl shadow-sm border border-border p-5"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Signed in as</p>
          <p className="font-semibold">{auth?.user.name || auth?.user.email}</p>
          <p className="text-sm text-muted-foreground">{auth?.user.email}</p>
        </motion.div>

        {/* Theme toggle */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card rounded-2xl shadow-sm border border-border p-5"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Appearance</p>
          <div className="flex gap-2">
            {(["light", "system", "dark"] as ThemeMode[]).map((mode) => {
              const Icon = mode === "light" ? Sun : mode === "dark" ? Moon : Monitor;
              const label = mode === "light" ? "Light" : mode === "dark" ? "Dark" : "System";
              return (
                <button
                  key={mode}
                  onClick={() => setTheme(mode)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium transition-all border",
                    theme === mode
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              );
            })}
          </div>
        </motion.div>

        <AnimatePresence>
          {invitations && invitations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden"
            >
              <div className="px-5 pt-4 pb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <p className="text-sm font-semibold">Pending invitations</p>
                <span className="ml-auto text-xs text-muted-foreground">{invitations.length}</span>
              </div>
              <div className="divide-y divide-border">
                {invitations.map((inv: any) => (
                  <motion.div
                    key={inv.id}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-5 py-3.5 flex items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{inv.List.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        from {inv.List.owner.name || inv.List.owner.email}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => declineInvitation.mutate(inv.List.id)}
                        disabled={declineInvitation.isPending}
                        className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted/60 transition-colors disabled:opacity-50"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => acceptInvitation.mutate(inv.List.id)}
                        disabled={acceptInvitation.isPending}
                        className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        Join
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-2xl bg-destructive/10 text-destructive font-medium text-sm hover:bg-destructive/20 transition-colors"
        >
          Sign out
        </button>
      </div>
      <BottomNavbar
        activeTab="profile"
        onTabChange={onTabChange}
        onAddClick={() => {}}
        onChatClick={onChatClick}
        pendingInvitations={invitations?.length ?? 0}
      />
    </div>
  );
}
