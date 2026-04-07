import Common "common";

module {
  public type Message = {
    id : Common.MessageId;
    conversationId : Common.ConversationId;
    senderId : Common.UserId;
    senderUsername : Text;
    content : Text;
    createdAt : Common.Timestamp;
  };

  public type Conversation = {
    id : Common.ConversationId;
    participants : [Common.UserId];
    lastMessage : ?Text;
    lastMessageAt : Common.Timestamp;
    unreadCount : Nat;
  };
};
