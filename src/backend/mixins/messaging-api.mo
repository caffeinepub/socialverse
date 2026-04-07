import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import SocialTypes "../types/social";
import MessagingTypes "../types/messaging";
import MessagingLib "../lib/messaging";

mixin (
  accessControlState : AccessControl.AccessControlState,
  profiles : Map.Map<Common.UserId, SocialTypes.UserProfile>,
  conversations : Map.Map<Common.ConversationId, MessagingTypes.Conversation>,
  messages : Map.Map<Common.ConversationId, List.List<MessagingTypes.Message>>,
) {
  var nextMessageId : Nat = 0;

  public query ({ caller }) func getConversations() : async [MessagingTypes.Conversation] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    MessagingLib.getConversations(conversations, caller);
  };

  public query ({ caller }) func getMessages(conversationId : Common.ConversationId) : async [MessagingTypes.Message] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    MessagingLib.getMessages(messages, conversations, conversationId, caller);
  };

  public shared ({ caller }) func sendMessage(
    recipientId : Common.UserId,
    content : Text,
  ) : async Common.MessageId {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let senderUsername = switch (profiles.get(caller)) {
      case (?p) { p.username };
      case null { Runtime.trap("Profile not found. Create a profile first.") };
    };
    let messageId = "m" # nextMessageId.toText();
    nextMessageId += 1;
    let msg = MessagingLib.sendMessage(conversations, messages, messageId, caller, senderUsername, recipientId, content);
    msg.id;
  };
};
