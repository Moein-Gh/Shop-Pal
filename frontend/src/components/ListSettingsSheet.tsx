import { useState } from "react";
import { Trash2, Loader2, Check, UserPlus, Crown, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useGetMembers, useAddMember, useRemoveMember, useRenameList, useDeleteList } from "../api/hooks";
import { useAtomValue } from "jotai";
import { authAtom } from "../atoms/auth";
import { ResponsiveDialog } from "./ui/responsive-dialog";
import { cn } from "../lib/utils";

interface ListSettingsSheetProps {
  listId: string;
  listName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function ListSettingsSheet({ listId, listName, open, onOpenChange, onDeleted }: ListSettingsSheetProps) {
  const auth = useAtomValue(authAtom);
  const [name, setName] = useState(listName);
  const [email, setEmail] = useState("");
  const [memberError, setMemberError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  const { data: members, isLoading: membersLoading } = useGetMembers(listId);
  const addMember = useAddMember(listId);
  const removeMember = useRemoveMember(listId);
  const renameList = useRenameList();
  const deleteList = useDeleteList();

  const myEntry = members?.find((m) => m.User.id === auth?.user.id);
  const isOwner = myEntry?.status === "OWNER";

  const handleRename = async () => {
    if (!name.trim() || name.trim() === listName) return;
    await renameList.mutateAsync({ listId, name: name.trim() });
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 1800);
  };

  const handleAddMember = async () => {
    setMemberError(null);
    if (!email.trim()) return;
    try {
      await addMember.mutateAsync(email.trim().toLowerCase());
      setEmail("");
    } catch (e: any) {
      setMemberError(e?.response?.data?.error ?? "Something went wrong");
    }
  };

  const handleDelete = async () => {
    await deleteList.mutateAsync(listId);
    setDeleteConfirmOpen(false);
    onOpenChange(false);
    onDeleted();
  };

  return (
    <>
      <ResponsiveDialog open={open} onOpenChange={onOpenChange} title="List settings">
        <div className="px-1 pb-4 space-y-6">

          {/* Rename */}
          {isOwner && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</p>
              <div className="flex gap-2">
                <input
                  value={name}
                  onChange={(e) => { setName(e.target.value); setNameSaved(false); }}
                  onKeyDown={(e) => e.key === "Enter" && handleRename()}
                  className="flex-1 h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring/40"
                />
                <button
                  onClick={handleRename}
                  disabled={renameList.isPending || !name.trim() || name.trim() === listName}
                  className={cn(
                    "flex items-center gap-1.5 px-4 h-10 rounded-xl text-sm font-medium transition-all disabled:opacity-40",
                    nameSaved ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground",
                  )}
                >
                  {renameList.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : nameSaved ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Members */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Members</p>

            {isOwner && (
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Invite by email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
                    className="flex-1 h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring/40"
                  />
                  <button
                    onClick={handleAddMember}
                    disabled={addMember.isPending || !email.trim()}
                    className="flex items-center gap-1.5 px-4 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 transition-opacity"
                  >
                    {addMember.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    Invite
                  </button>
                </div>
                {memberError && <p className="text-xs text-destructive">{memberError}</p>}
                {addMember.isSuccess && (
                  <p className="text-xs text-emerald-600">Invitation sent — they'll see it in their profile.</p>
                )}
              </div>
            )}

            {membersLoading ? (
              <div className="flex justify-center py-4">
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
                      className="flex items-center gap-3 bg-muted/40 rounded-xl px-3 py-2.5"
                    >
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        {m.status === "OWNER" ? (
                          <Crown className="w-3.5 h-3.5 text-primary" />
                        ) : (
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {m.User.name || m.User.email}
                          {m.User.id === auth?.user.id && (
                            <span className="ml-1.5 text-xs text-muted-foreground font-normal">(you)</span>
                          )}
                        </p>
                        {m.User.name && <p className="text-xs text-muted-foreground truncate">{m.User.email}</p>}
                      </div>
                      <span className={cn(
                        "text-xs font-medium shrink-0",
                        m.status === "PENDING" ? "text-amber-500" : "text-muted-foreground"
                      )}>
                        {m.status === "PENDING" ? "Pending" : m.status.toLowerCase()}
                      </span>
                      {isOwner && m.User.id !== auth?.user.id && (
                        <button
                          onClick={() => removeMember.mutate(m.User.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Danger zone */}
          {isOwner && (
            <div className="space-y-2 pt-2 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Danger zone</p>
              <button
                onClick={() => setDeleteConfirmOpen(true)}
                className="w-full py-2.5 rounded-xl bg-destructive/8 text-destructive text-sm font-medium hover:bg-destructive/15 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete this list
              </button>
            </div>
          )}
        </div>
      </ResponsiveDialog>

      <ResponsiveDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen} title="Delete list?">
        <div className="px-1 pb-2">
          <p className="text-sm text-muted-foreground mb-5">
            This will permanently delete <span className="font-medium text-foreground">{listName}</span> and all its items. This cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteConfirmOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteList.isPending}
              className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-60"
            >
              {deleteList.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Delete"}
            </button>
          </div>
        </div>
      </ResponsiveDialog>
    </>
  );
}
