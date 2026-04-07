import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Loader2,
  MessageCircle,
  Phone,
  Search,
  Send,
  Video,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useBackend } from "../hooks/useBackend";
import type { Conversation, Message, UserProfile } from "../types";

// ── helpers ──────────────────────────────────────────────────────────────────

function formatTs(nanoseconds: bigint): string {
  const ms = Number(nanoseconds / 1_000_000n);
  const d = new Date(ms);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 60_000) return "now";
  if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)}m`;
  if (diffMs < 86_400_000)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffMs < 604_800_000) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[d.getDay()];
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatMsgTime(nanoseconds: bigint): string {
  const ms = Number(nanoseconds / 1_000_000n);
  return new Date(ms).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function avatarUrl(seed: string): string {
  return `https://picsum.photos/seed/${seed}/60/60`;
}

// ── New Chat Modal ────────────────────────────────────────────────────────────

interface NewChatModalProps {
  onClose: () => void;
  onStartChat: (user: UserProfile) => void;
}

function NewChatModal({ onClose, onStartChat }: NewChatModalProps) {
  const { backend } = useBackend();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (!backend || term.trim().length < 2) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const found = await backend.searchUsers(term.trim());
      setResults(found);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      data-ocid="chat.new_chat.modal"
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: "rgba(20, 20, 28, 0.95)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <h2 className="text-white font-semibold">New Message</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Search className="w-4 h-4 text-white/40 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search people..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder:text-white/30 text-sm outline-none"
              data-ocid="chat.new_chat.search_input"
            />
            {isSearching && (
              <Loader2 className="w-4 h-4 text-white/40 animate-spin flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Results */}
        <div className="pb-3 max-h-72 overflow-y-auto">
          {results.length === 0 && searchTerm.length >= 2 && !isSearching && (
            <p className="text-white/30 text-sm text-center py-6">
              No users found
            </p>
          )}
          {searchTerm.length < 2 && (
            <p className="text-white/20 text-xs text-center py-6">
              Type at least 2 characters to search
            </p>
          )}
          {results.map((user) => (
            <button
              key={user.id.toString()}
              type="button"
              onClick={() => onStartChat(user)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
              data-ocid="chat.new_chat.user_result"
            >
              <img
                src={
                  user.avatarMediaId
                    ? user.avatarMediaId.getDirectURL()
                    : avatarUrl(user.id.toString())
                }
                alt={user.displayName}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">
                  {user.displayName}
                </p>
                <p className="text-white/40 text-xs truncate">
                  @{user.username}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ChatPage() {
  const { identity } = useInternetIdentity();
  const { backend, isFetching } = useBackend();
  const queryClient = useQueryClient();

  const myPrincipal = identity?.getPrincipal().toString() ?? "";

  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [pendingRecipient, setPendingRecipient] = useState<UserProfile | null>(
    null,
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Conversations query (poll every 5s) ─────────────────────────────────
  const { data: conversations = [], isLoading: convsLoading } = useQuery<
    Conversation[]
  >({
    queryKey: ["conversations"],
    queryFn: async () => {
      if (!backend) return [];
      return backend.getConversations();
    },
    enabled: !!backend && !isFetching,
    refetchInterval: 5000,
    staleTime: 2000,
  });

  // ── Participant profiles ─────────────────────────────────────────────────
  // Build a map of principalStr -> UserProfile for all conversation participants
  const otherParticipantIds = conversations
    .flatMap((c) => c.participants)
    .map((p) => p.toString())
    .filter((p) => p !== myPrincipal);
  const uniqueParticipantIds = [...new Set(otherParticipantIds)];

  const { data: participantProfiles = {} } = useQuery<
    Record<string, UserProfile>
  >({
    queryKey: ["participantProfiles", uniqueParticipantIds.join(",")],
    queryFn: async () => {
      if (!backend || uniqueParticipantIds.length === 0) return {};
      const entries = await Promise.all(
        uniqueParticipantIds.map(async (pidStr) => {
          const conv = conversations.find((c) =>
            c.participants.some((p) => p.toString() === pidStr),
          );
          if (!conv) return null;
          const principal = conv.participants.find(
            (p) => p.toString() === pidStr,
          );
          if (!principal) return null;
          const profile = await backend.getUserProfile(principal);
          return profile ? ([pidStr, profile] as [string, UserProfile]) : null;
        }),
      );
      return Object.fromEntries(
        entries.filter((e): e is [string, UserProfile] => e !== null),
      );
    },
    enabled: !!backend && !isFetching && uniqueParticipantIds.length > 0,
    staleTime: 30_000,
  });

  // ── Messages query (poll every 2.5s when a conversation is selected) ────
  const { data: messages = [], isLoading: msgsLoading } = useQuery<Message[]>({
    queryKey: ["messages", selectedConvId],
    queryFn: async () => {
      if (!backend || !selectedConvId) return [];
      return backend.getMessages(selectedConvId);
    },
    enabled: !!backend && !isFetching && !!selectedConvId,
    refetchInterval: selectedConvId ? 2500 : false,
    staleTime: 1000,
  });

  // ── Send message mutation ────────────────────────────────────────────────
  const sendMutation = useMutation({
    mutationFn: async ({
      recipientId,
      content,
    }: {
      recipientId: string;
      content: string;
    }) => {
      if (!backend) throw new Error("Backend not ready");
      const conv = conversations.find((c) => c.id === selectedConvId);
      const recipientPrincipal = conv
        ? conv.participants.find((p) => p.toString() === recipientId)
        : pendingRecipient?.id;
      if (!recipientPrincipal) throw new Error("Recipient not found");
      return backend.sendMessage(recipientPrincipal, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", selectedConvId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  // ── Scroll to bottom on new messages ────────────────────────────────────
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional scroll on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const selectedConv = conversations.find((c) => c.id === selectedConvId);

  function getPartnerProfile(conv: Conversation): UserProfile | null {
    const otherId = conv.participants
      .find((p) => p.toString() !== myPrincipal)
      ?.toString();
    if (!otherId) return null;
    return participantProfiles[otherId] ?? null;
  }

  const partnerProfile = selectedConv
    ? getPartnerProfile(selectedConv)
    : pendingRecipient;

  // ── Handle send ─────────────────────────────────────────────────────────
  const handleSend = () => {
    if (!messageInput.trim()) return;
    const recipientId =
      pendingRecipient?.id.toString() ??
      selectedConv?.participants
        .find((p) => p.toString() !== myPrincipal)
        ?.toString();
    if (!recipientId) return;

    sendMutation.mutate(
      { recipientId, content: messageInput.trim() },
      {
        onSuccess: () => {
          setMessageInput("");
          if (pendingRecipient) {
            // Switch to conversations after first message
            setPendingRecipient(null);
            setTimeout(() => {
              queryClient.invalidateQueries({ queryKey: ["conversations"] });
            }, 1000);
          }
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Start new chat ───────────────────────────────────────────────────────
  const handleStartChat = (user: UserProfile) => {
    setShowNewChat(false);
    // Check if conversation already exists
    const existing = conversations.find((c) =>
      c.participants.some((p) => p.toString() === user.id.toString()),
    );
    if (existing) {
      setSelectedConvId(existing.id);
      setPendingRecipient(null);
    } else {
      // Start a pending conversation (no convId until first message sent)
      setPendingRecipient(user);
      setSelectedConvId(null);
    }
  };

  const isChatOpen = selectedConvId !== null || pendingRecipient !== null;

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: "#0B0C10", fontFamily: "Inter, sans-serif" }}
      data-ocid="chat.page"
    >
      {/* ── Left panel: Conversations list ─────────────────────────────── */}
      <div
        className={`${
          isChatOpen ? "hidden md:flex" : "flex"
        } flex-col w-full md:w-80 border-r flex-shrink-0`}
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        {/* Header */}
        <div
          className="p-4 border-b flex items-center justify-between"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <h1 className="text-xl font-bold text-white">Messages</h1>
          <button
            type="button"
            onClick={() => setShowNewChat(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
            style={{ background: "linear-gradient(135deg, #7A5CFF, #FF4DA6)" }}
            aria-label="New chat"
            data-ocid="chat.new_chat.button"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* List body */}
        <div className="flex-1 overflow-y-auto">
          {/* Loading state */}
          {convsLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2
                className="w-6 h-6 animate-spin"
                style={{ color: "#7A5CFF" }}
              />
            </div>
          )}

          {/* Empty state */}
          {!convsLoading && conversations.length === 0 && (
            <div
              className="flex flex-col items-center justify-center py-16 px-6 text-center"
              data-ocid="chat.conversations.empty_state"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: "rgba(122,92,255,0.15)" }}
              >
                <MessageCircle
                  className="w-7 h-7"
                  style={{ color: "#7A5CFF" }}
                />
              </div>
              <p className="text-white/60 text-sm font-medium mb-1">
                No messages yet
              </p>
              <p className="text-white/30 text-xs">
                Tap the send icon above to start a conversation
              </p>
            </div>
          )}

          {/* Conversation items */}
          {conversations.map((conv, idx) => {
            const partner = getPartnerProfile(conv);
            const partnerId = conv.participants
              .find((p) => p.toString() !== myPrincipal)
              ?.toString();
            const name =
              partner?.displayName ??
              partner?.username ??
              (partnerId ? `${partnerId.slice(0, 8)}…` : "Unknown");
            const avatarSrc = partner?.avatarMediaId
              ? partner.avatarMediaId.getDirectURL()
              : avatarUrl(partnerId ?? `conv${idx}`);

            return (
              <button
                type="button"
                key={conv.id}
                onClick={() => {
                  setSelectedConvId(conv.id);
                  setPendingRecipient(null);
                }}
                className="w-full flex items-center gap-3 p-4 transition-colors text-left"
                style={{
                  background:
                    selectedConvId === conv.id
                      ? "rgba(122,92,255,0.1)"
                      : "transparent",
                }}
                data-ocid={`chat.conversation.item.${idx + 1}`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={avatarSrc}
                    alt={name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-white text-sm font-semibold truncate">
                      {name}
                    </p>
                    <span className="text-white/30 text-xs flex-shrink-0 ml-2">
                      {formatTs(conv.lastMessageAt)}
                    </span>
                  </div>
                  <p className="text-white/50 text-xs truncate mt-0.5">
                    {conv.lastMessage ?? "No messages yet"}
                  </p>
                </div>
                {Number(conv.unreadCount) > 0 && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-bold flex-shrink-0"
                    style={{
                      background: "linear-gradient(90deg, #7A5CFF, #FF4DA6)",
                    }}
                  >
                    {Number(conv.unreadCount)}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right panel: Chat thread ────────────────────────────────────── */}
      {isChatOpen ? (
        <div className="flex flex-col flex-1 min-w-0">
          {/* Thread header */}
          <div
            className="flex items-center gap-3 p-4 border-b flex-shrink-0"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <button
              type="button"
              onClick={() => {
                setSelectedConvId(null);
                setPendingRecipient(null);
              }}
              className="md:hidden text-white/60 hover:text-white transition-colors"
              data-ocid="chat.back.button"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            {partnerProfile ? (
              <>
                <img
                  src={
                    partnerProfile.avatarMediaId
                      ? partnerProfile.avatarMediaId.getDirectURL()
                      : avatarUrl(partnerProfile.id.toString())
                  }
                  alt={partnerProfile.displayName}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">
                    {partnerProfile.displayName}
                  </p>
                  <p className="text-xs text-white/30 truncate">
                    @{partnerProfile.username}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div
                  className="w-9 h-9 rounded-full flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                />
                <div className="flex-1 min-w-0">
                  <div
                    className="h-3 w-24 rounded-full"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  />
                </div>
              </>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="w-8 h-8 flex items-center justify-center rounded-full transition-opacity hover:opacity-70"
                style={{ background: "rgba(255,255,255,0.07)" }}
                data-ocid="chat.phone.button"
                aria-label="Voice call"
              >
                <Phone className="w-4 h-4 text-white/70" />
              </button>
              <button
                type="button"
                className="w-8 h-8 flex items-center justify-center rounded-full transition-opacity hover:opacity-70"
                style={{ background: "rgba(255,255,255,0.07)" }}
                data-ocid="chat.video.button"
                aria-label="Video call"
              >
                <Video className="w-4 h-4 text-white/70" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Loading messages */}
            {msgsLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2
                  className="w-5 h-5 animate-spin"
                  style={{ color: "#7A5CFF" }}
                />
              </div>
            )}

            {/* Pending conversation hint */}
            {pendingRecipient && messages.length === 0 && !msgsLoading && (
              <div className="flex items-center justify-center py-8">
                <p className="text-white/30 text-sm text-center px-4">
                  Send a message to start your conversation with{" "}
                  <span className="text-white/50 font-medium">
                    {pendingRecipient.displayName}
                  </span>
                </p>
              </div>
            )}

            {/* Empty conversation */}
            {selectedConvId && messages.length === 0 && !msgsLoading && (
              <div
                className="flex flex-col items-center justify-center py-12"
                data-ocid="chat.messages.empty_state"
              >
                <p className="text-white/30 text-sm">
                  No messages yet — say hi!
                </p>
              </div>
            )}

            {/* Message bubbles */}
            {messages.map((msg, idx) => {
              const isMine = msg.senderId.toString() === myPrincipal;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  data-ocid={`chat.message.item.${idx + 1}`}
                >
                  <div
                    className="max-w-xs rounded-2xl px-4 py-2.5"
                    style={{
                      background: isMine
                        ? "linear-gradient(135deg, #7A5CFF, #FF4DA6)"
                        : "rgba(255,255,255,0.08)",
                      backdropFilter: isMine ? "none" : "blur(8px)",
                      WebkitBackdropFilter: isMine ? "none" : "blur(8px)",
                      border: isMine
                        ? "none"
                        : "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <p className="text-white text-sm break-words">
                      {msg.content}
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{
                        color: isMine
                          ? "rgba(255,255,255,0.6)"
                          : "rgba(255,255,255,0.35)",
                      }}
                    >
                      {formatMsgTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="p-4 border-t flex items-center gap-3 flex-shrink-0"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <div
              className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-white placeholder:text-white/30 text-sm outline-none"
                data-ocid="chat.message.input"
              />
            </div>
            <button
              type="button"
              onClick={handleSend}
              disabled={!messageInput.trim() || sendMutation.isPending}
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity"
              style={{
                background: "linear-gradient(135deg, #7A5CFF, #FF4DA6)",
                opacity:
                  messageInput.trim() && !sendMutation.isPending ? 1 : 0.4,
              }}
              data-ocid="chat.send.button"
            >
              {sendMutation.isPending ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Desktop empty state */
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="text-center" data-ocid="chat.empty_state">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(122,92,255,0.15)" }}
            >
              <MessageCircle className="w-8 h-8" style={{ color: "#7A5CFF" }} />
            </div>
            <p className="text-white/60 mb-2">
              Select a conversation to start messaging
            </p>
            <button
              type="button"
              onClick={() => setShowNewChat(true)}
              className="px-5 py-2 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-80"
              style={{
                background: "linear-gradient(135deg, #7A5CFF, #FF4DA6)",
              }}
              data-ocid="chat.start_chat.button"
            >
              Start a new chat
            </button>
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onStartChat={handleStartChat}
        />
      )}
    </div>
  );
}
