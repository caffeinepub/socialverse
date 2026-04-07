import Map "mo:core/Map";
import List "mo:core/List";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Common "../types/common";
import MessagingTypes "../types/messaging";

module {
  // Build a stable conversation ID from two principals (sorted for consistency)
  public func makeConversationId(a : Common.UserId, b : Common.UserId) : Common.ConversationId {
    let ta = a.toText();
    let tb = b.toText();
    if (ta.less(tb)) { ta # ":" # tb } else { tb # ":" # ta };
  };

  public func getConversations(
    conversations : Map.Map<Common.ConversationId, MessagingTypes.Conversation>,
    caller : Common.UserId,
  ) : [MessagingTypes.Conversation] {
    let results = List.empty<MessagingTypes.Conversation>();
    conversations.forEach(func(_, conv) {
      let participants = conv.participants;
      let isMember = participants.find(func(p : Common.UserId) : Bool { p == caller }) != null;
      if (isMember) { results.add(conv) };
    });
    let arr = results.toArray();
    // Sort by lastMessageAt descending
    arr.sort(func(a : MessagingTypes.Conversation, b : MessagingTypes.Conversation) : { #less; #equal; #greater } {
      Int.compare(b.lastMessageAt, a.lastMessageAt)
    });
  };

  public func getMessages(
    messages : Map.Map<Common.ConversationId, List.List<MessagingTypes.Message>>,
    conversations : Map.Map<Common.ConversationId, MessagingTypes.Conversation>,
    conversationId : Common.ConversationId,
    caller : Common.UserId,
  ) : [MessagingTypes.Message] {
    // Verify caller is a participant
    switch (conversations.get(conversationId)) {
      case null { return [] };
      case (?conv) {
        let isMember = conv.participants.find(func(p : Common.UserId) : Bool { p == caller }) != null;
        if (not isMember) { return [] };
      };
    };
    switch (messages.get(conversationId)) {
      case null { [] };
      case (?lst) { lst.toArray() };
    };
  };

  public func sendMessage(
    conversations : Map.Map<Common.ConversationId, MessagingTypes.Conversation>,
    messages : Map.Map<Common.ConversationId, List.List<MessagingTypes.Message>>,
    messageId : Common.MessageId,
    caller : Common.UserId,
    senderUsername : Text,
    recipientId : Common.UserId,
    content : Text,
  ) : MessagingTypes.Message {
    let convId = makeConversationId(caller, recipientId);
    let now = Time.now();
    let message : MessagingTypes.Message = {
      id = messageId;
      conversationId = convId;
      senderId = caller;
      senderUsername = senderUsername;
      content = content;
      createdAt = now;
    };
    // Create or update conversation
    switch (conversations.get(convId)) {
      case null {
        let conv : MessagingTypes.Conversation = {
          id = convId;
          participants = [caller, recipientId];
          lastMessage = ?content;
          lastMessageAt = now;
          unreadCount = 1;
        };
        conversations.add(convId, conv);
      };
      case (?existing) {
        conversations.add(convId, {
          existing with
          lastMessage = ?content;
          lastMessageAt = now;
          unreadCount = existing.unreadCount + 1;
        });
      };
    };
    // Add message to list
    let msgList = switch (messages.get(convId)) {
      case (?lst) { lst };
      case null {
        let lst = List.empty<MessagingTypes.Message>();
        messages.add(convId, lst);
        lst;
      };
    };
    msgList.add(message);
    message;
  };
};
