import { ArrowLeft, Phone, Send, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Message {
  id: number;
  text: string;
  sent: boolean;
  time: string;
}

interface Conversation {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  messages: Message[];
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    name: "Leo Martinez",
    avatar: "https://picsum.photos/seed/user1/60/60",
    lastMessage: "That sunset photo was incredible!",
    time: "2m",
    unread: 3,
    online: true,
    messages: [
      {
        id: 1,
        text: "Hey! Did you see my latest travel reel?",
        sent: false,
        time: "10:02",
      },
      {
        id: 2,
        text: "Yes! The mountain sunrise was breathtaking 🏔️",
        sent: true,
        time: "10:04",
      },
      {
        id: 3,
        text: "That sunset photo was incredible!",
        sent: false,
        time: "10:05",
      },
    ],
  },
  {
    id: 2,
    name: "Sarah Kim",
    avatar: "https://picsum.photos/seed/user2/60/60",
    lastMessage: "Can you share that matcha recipe?",
    time: "15m",
    unread: 1,
    online: true,
    messages: [
      {
        id: 1,
        text: "I saw your matcha post! Looks amazing ✨",
        sent: true,
        time: "09:30",
      },
      {
        id: 2,
        text: "Thank you! I've been perfecting it for months",
        sent: false,
        time: "09:32",
      },
      {
        id: 3,
        text: "Can you share that matcha recipe?",
        sent: false,
        time: "09:35",
      },
    ],
  },
  {
    id: 3,
    name: "Julia Arts",
    avatar: "https://picsum.photos/seed/user3/60/60",
    lastMessage: "Let's collab on a project!",
    time: "1h",
    unread: 0,
    online: false,
    messages: [
      {
        id: 1,
        text: "Your abstract work is insane 🎨",
        sent: true,
        time: "08:10",
      },
      {
        id: 2,
        text: "Aww thanks! You should try it too",
        sent: false,
        time: "08:15",
      },
      { id: 3, text: "Let's collab on a project!", sent: false, time: "08:20" },
    ],
  },
  {
    id: 4,
    name: "Max Chen",
    avatar: "https://picsum.photos/seed/user4/60/60",
    lastMessage: "Check out this open source project",
    time: "3h",
    unread: 0,
    online: false,
    messages: [
      {
        id: 1,
        text: "Found a cool new web framework",
        sent: false,
        time: "07:00",
      },
      { id: 2, text: "Oh nice, which one?", sent: true, time: "07:05" },
      {
        id: 3,
        text: "Check out this open source project",
        sent: false,
        time: "07:07",
      },
    ],
  },
  {
    id: 5,
    name: "Priya Sharma",
    avatar: "https://picsum.photos/seed/user5/60/60",
    lastMessage: "Diwali was so magical this year!",
    time: "1d",
    unread: 0,
    online: true,
    messages: [
      { id: 1, text: "Happy Diwali! 🪔✨", sent: true, time: "yesterday" },
      {
        id: 2,
        text: "Thank you! Same to you!",
        sent: false,
        time: "yesterday",
      },
      {
        id: 3,
        text: "Diwali was so magical this year!",
        sent: false,
        time: "yesterday",
      },
    ],
  },
  {
    id: 6,
    name: "Alex Nova",
    avatar: "https://picsum.photos/seed/user6/60/60",
    lastMessage: "The Milky Way photo — no edits!!!",
    time: "2d",
    unread: 0,
    online: false,
    messages: [
      {
        id: 1,
        text: "That night sky photo is unreal",
        sent: true,
        time: "2 days ago",
      },
      {
        id: 2,
        text: "Right?! The Atacama Desert is incredible",
        sent: false,
        time: "2 days ago",
      },
      {
        id: 3,
        text: "The Milky Way photo — no edits!!!",
        sent: false,
        time: "2 days ago",
      },
    ],
  },
];

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [conversations, setConversations] =
    useState<Conversation[]>(MOCK_CONVERSATIONS);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: messagesEndRef is a stable ref
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat]);

  const handleSend = () => {
    if (!messageInput.trim() || !selectedChat) return;
    const newMsg: Message = {
      id: Date.now(),
      text: messageInput.trim(),
      sent: true,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedChat.id
          ? {
              ...c,
              messages: [...c.messages, newMsg],
              lastMessage: newMsg.text,
              time: "now",
            }
          : c,
      ),
    );
    setSelectedChat((prev) =>
      prev
        ? {
            ...prev,
            messages: [...prev.messages, newMsg],
            lastMessage: newMsg.text,
          }
        : prev,
    );
    setMessageInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: "#0B0C10", fontFamily: "Inter, sans-serif" }}
      data-ocid="chat.page"
    >
      {/* Chat list — full width on mobile, left panel on desktop */}
      <div
        className={`${
          selectedChat ? "hidden md:flex" : "flex"
        } flex-col w-full md:w-80 border-r flex-shrink-0`}
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div
          className="p-4 border-b"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <h1 className="text-xl font-bold text-white">Messages</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv, idx) => (
            <button
              type="button"
              key={conv.id}
              onClick={() => setSelectedChat(conv)}
              className="w-full flex items-center gap-3 p-4 transition-colors text-left"
              style={{
                background:
                  selectedChat?.id === conv.id
                    ? "rgba(122,92,255,0.1)"
                    : "transparent",
              }}
              data-ocid={`chat.conversation.item.${idx + 1}`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={conv.avatar}
                  alt={conv.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {conv.online && (
                  <div
                    className="absolute bottom-0 right-0 w-3 h-3 rounded-full"
                    style={{
                      background: "#22c55e",
                      border: "2px solid #0B0C10",
                    }}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-white text-sm font-semibold">
                    {conv.name}
                  </p>
                  <span className="text-white/30 text-xs">{conv.time}</span>
                </div>
                <p className="text-white/50 text-xs truncate mt-0.5">
                  {conv.lastMessage}
                </p>
              </div>
              {conv.unread > 0 && (
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-bold flex-shrink-0"
                  style={{
                    background: "linear-gradient(90deg, #7A5CFF, #FF4DA6)",
                  }}
                >
                  {conv.unread}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat thread */}
      {selectedChat ? (
        <div className="flex flex-col flex-1 min-w-0">
          {/* Thread header */}
          <div
            className="flex items-center gap-3 p-4 border-b flex-shrink-0"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <button
              type="button"
              onClick={() => setSelectedChat(null)}
              className="md:hidden text-white/60 hover:text-white"
              data-ocid="chat.back.button"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img
              src={selectedChat.avatar}
              alt={selectedChat.name}
              className="w-9 h-9 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="text-white text-sm font-semibold">
                {selectedChat.name}
              </p>
              <p
                className="text-xs"
                style={{
                  color: selectedChat.online
                    ? "#22c55e"
                    : "rgba(255,255,255,0.3)",
                }}
              >
                {selectedChat.online ? "Online" : "Offline"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{ background: "rgba(255,255,255,0.07)" }}
                data-ocid="chat.phone.button"
              >
                <Phone className="w-4 h-4 text-white/70" />
              </button>
              <button
                type="button"
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{ background: "rgba(255,255,255,0.07)" }}
                data-ocid="chat.video.button"
              >
                <Video className="w-4 h-4 text-white/70" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {selectedChat.messages.map((msg, idx) => (
              <div
                key={msg.id}
                className={`flex ${msg.sent ? "justify-end" : "justify-start"}`}
                data-ocid={`chat.message.item.${idx + 1}`}
              >
                <div
                  className="max-w-xs rounded-2xl px-4 py-2.5"
                  style={{
                    background: msg.sent
                      ? "linear-gradient(135deg, #7A5CFF, #FF4DA6)"
                      : "rgba(255,255,255,0.08)",
                    backdropFilter: msg.sent ? "none" : "blur(8px)",
                    WebkitBackdropFilter: msg.sent ? "none" : "blur(8px)",
                    border: msg.sent
                      ? "none"
                      : "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <p className="text-white text-sm">{msg.text}</p>
                  <p
                    className="text-xs mt-1"
                    style={{
                      color: msg.sent
                        ? "rgba(255,255,255,0.6)"
                        : "rgba(255,255,255,0.35)",
                    }}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
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
              disabled={!messageInput.trim()}
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity"
              style={{
                background: "linear-gradient(135deg, #7A5CFF, #FF4DA6)",
                opacity: messageInput.trim() ? 1 : 0.4,
              }}
              data-ocid="chat.send.button"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="text-center" data-ocid="chat.empty_state">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(122,92,255,0.15)" }}
            >
              <Send className="w-8 h-8" style={{ color: "#7A5CFF" }} />
            </div>
            <p className="text-white/60">
              Select a conversation to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
