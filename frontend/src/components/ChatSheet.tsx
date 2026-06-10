import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Send, Sparkles, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { api, type PendingAction } from "../api/client";
import { cn } from "../lib/utils";
import { useMediaQuery } from "../hooks/useMediaQuery";

interface TextMessage {
  role: "user" | "assistant";
  content: string;
}

interface ApprovalMessage {
  role: "approval";
  content: string;
  actions: PendingAction[];
  resolved: boolean;
}

type Message = TextMessage | ApprovalMessage;

interface ChatSheetProps {
  open: boolean;
  onClose: () => void;
  activeListId: string | null;
  activeListName: string | undefined;
}

const SUGGESTIONS = ["Add milk and eggs", "Check off everything in Dairy", "Create a new list"];

function ApprovalCard({
  message,
  onConfirm,
  onCancel,
}: {
  message: ApprovalMessage;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="flex justify-start"
    >
      <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted text-foreground overflow-hidden">
        <div className="px-4 pt-3 pb-2">
          <p className="text-sm leading-relaxed">{message.content}</p>
          <ul className="mt-2 space-y-1">
            {message.actions.map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                {action.description}
              </li>
            ))}
          </ul>
        </div>
        {!message.resolved && (
          <div className="flex border-t border-border">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted/80 transition-colors border-r border-border"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Confirm
            </button>
          </div>
        )}
        {message.resolved && (
          <div className="px-4 pb-3 text-xs text-muted-foreground/60">Resolved</div>
        )}
      </div>
    </motion.div>
  );
}

function ChatContent({
  messages,
  loading,
  input,
  inputRef,
  bottomRef,
  onInputChange,
  onKeyDown,
  onSend,
  onClose,
  activeListName,
  onSuggestion,
  onApprove,
  onReject,
}: {
  messages: Message[];
  loading: boolean;
  input: string;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  onInputChange: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onClose: () => void;
  activeListName: string | undefined;
  onSuggestion: (s: string) => void;
  onApprove: (index: number) => void;
  onReject: (index: number) => void;
}) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center px-5 pt-4 pb-3 gap-3 shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">AI Assistant</p>
          {activeListName && (
            <p className="text-xs text-muted-foreground truncate">Viewing: {activeListName}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mx-5 h-px bg-border shrink-0" />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-8 text-center">
            <Sparkles className="w-8 h-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              Ask me to add items, check things off, or manage your lists.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-1">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => onSuggestion(s)}
                  className="px-3 py-1.5 rounded-full border border-border text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          if (msg.role === "approval") {
            return (
              <ApprovalCard
                key={i}
                message={msg}
                onConfirm={() => onApprove(i)}
                onCancel={() => onReject(i)}
              />
            );
          }

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm",
                )}
              >
                {msg.role === "assistant"
                  ? msg.content.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/^[-*] /gm, "").trim()
                  : msg.content}
              </div>
            </motion.div>
          );
        })}

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-6 pt-3 shrink-0 border-t border-border">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Message…"
            rows={1}
            className="flex-1 resize-none bg-muted rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-muted-foreground leading-relaxed max-h-32"
            style={{ fieldSizing: "content" } as React.CSSProperties}
          />
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={onSend}
            disabled={!input.trim() || loading}
            className="shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </>
  );
}

export function ChatSheet({ open, onClose, activeListId, activeListName }: ChatSheetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Build the conversation history for the API (only text messages)
  const buildApiMessages = (msgs: Message[]) =>
    msgs
      .filter((m): m is TextMessage => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content }));

  const sendMessage = async (text: string, currentMessages: Message[]) => {
    if (!text || loading) return;

    const userMessage: TextMessage = { role: "user", content: text };
    const next = [...currentMessages, userMessage];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.chat(
        buildApiMessages(next),
        activeListId ? { activeListId, activeListName } : undefined,
      );

      if (data.pendingActions && data.pendingActions.length > 0) {
        const approvalMsg: ApprovalMessage = {
          role: "approval",
          content: data.message ?? "Here's what I'm going to do:",
          actions: data.pendingActions,
          resolved: false,
        };
        setMessages([...next, approvalMsg]);
      } else {
        setMessages([...next, { role: "assistant", content: data.message ?? "" }]);
        queryClient.invalidateQueries({ queryKey: ["items"] });
        queryClient.invalidateQueries({ queryKey: ["lists"] });
      }
    } catch {
      setMessages([...next, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const send = () => sendMessage(input.trim(), messages);

  const handleApprove = async (index: number) => {
    const updated = messages.map((m, i) =>
      i === index && m.role === "approval" ? { ...m, resolved: true } : m,
    );
    setMessages(updated);
    await sendMessage("Yes, go ahead.", updated);
  };

  const handleReject = async (index: number) => {
    const updated = messages.map((m, i) =>
      i === index && m.role === "approval" ? { ...m, resolved: true } : m,
    );
    setMessages(updated);
    await sendMessage("No, cancel that.", updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const sharedProps = {
    messages,
    loading,
    input,
    inputRef,
    bottomRef,
    onInputChange: setInput,
    onKeyDown: handleKeyDown,
    onSend: send,
    onClose,
    activeListName,
    onSuggestion: setInput,
    onApprove: handleApprove,
    onReject: handleReject,
  };

  if (isDesktop) {
    return (
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
            className="fixed right-0 top-0 bottom-0 z-40 w-96 flex flex-col border-l border-border"
            style={{ background: "var(--color-card)" }}
          >
            <ChatContent {...sharedProps} />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 340, damping: 36 }}
          className="fixed bottom-0 inset-x-0 z-50 flex flex-col rounded-t-3xl border-t border-border overflow-hidden"
          style={{
            background: "var(--color-card)",
            maxHeight: "60svh",
            boxShadow: "0 -4px 32px rgba(0,0,0,0.12)",
          }}
        >
          <ChatContent {...sharedProps} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
