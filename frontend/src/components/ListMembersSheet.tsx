import { useState } from "react";
import { UserPlus, Trash2, Loader2, Crown, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useGetMembers, useAddMember, useRemoveMember } from "../api/hooks";
import { useAtomValue } from "jotai";
import { authAtom } from "../atoms/auth";
import { ResponsiveDialog } from "./ui/responsive-dialog";

interface ListMembersSheetProps {
  listId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ListMembersSheet({ listId, open, onOpenChange }: ListMembersSheetProps) {
  const auth = useAtomValue(authAtom);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: members, isLoading } = useGetMembers(listId);
  const addMember = useAddMember(listId);
  const removeMember = useRemoveMember(listId);

  const myEntry = members?.find((m) => m.User.id === auth?.user.id);
  const isOwner = myEntry?.status === "OWNER";

  const handleAdd = async () => {
    setError(null);
    if (!email.trim()) return;
    try {
      await addMember.mutateAsync(email.trim().toLowerCase());
      setEmail("");
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Something went wrong");
    }
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title="People on this list">
        <div className="px-1 pb-4 space-y-4">
          {/* Add member */}
          {isOwner && (
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="flex-1 h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring/40"
              />
              <button
                onClick={handleAdd}
                disabled={addMember.isPending || !email.trim()}
                className="flex items-center gap-1.5 px-4 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 transition-opacity"
              >
                {addMember.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                Invite
              </button>
            </div>
          )}

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}

          {/* Member list */}
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {members?.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center gap-3 bg-card rounded-xl px-4 py-3 border border-border"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      {m.status === "OWNER" ? (
                        <Crown className="w-4 h-4 text-primary" />
                      ) : (
                        <User className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {m.User.name || m.User.email}
                        {m.User.id === auth?.user.id && (
                          <span className="ml-1.5 text-xs text-muted-foreground font-normal">(you)</span>
                        )}
                      </p>
                      {m.User.name && (
                        <p className="text-xs text-muted-foreground truncate">{m.User.email}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground capitalize shrink-0">
                      {m.status.toLowerCase()}
                    </span>
                    {(isOwner && m.User.id !== auth?.user.id) && (
                      <button
                        onClick={() => removeMember.mutate(m.User.id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
    </ResponsiveDialog>
  );
}
