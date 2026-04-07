import Map "mo:core/Map";
import Set "mo:core/Set";
import List "mo:core/List";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import Common "types/common";
import SocialTypes "types/social";
import MessagingTypes "types/messaging";
import SocialMixin "mixins/social-api";
import MessagingMixin "mixins/messaging-api";
import Migration "migration";

(with migration = Migration.run)
actor {
  // --- Infrastructure ---
  include MixinObjectStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // --- Social state ---
  let profiles = Map.empty<Common.UserId, SocialTypes.UserProfile>();
  let usernames = Map.empty<Text, Common.UserId>();
  let posts = Map.empty<Common.PostId, SocialTypes.Post>();
  let comments = Map.empty<Common.PostId, List.List<SocialTypes.Comment>>();
  let likes = Map.empty<Common.PostId, Set.Set<Common.UserId>>();
  let follows = Map.empty<Common.UserId, Set.Set<Common.UserId>>();
  let followers = Map.empty<Common.UserId, Set.Set<Common.UserId>>();

  include SocialMixin(
    accessControlState,
    profiles,
    usernames,
    posts,
    comments,
    likes,
    follows,
    followers,
  );

  // --- Messaging state ---
  let conversations = Map.empty<Common.ConversationId, MessagingTypes.Conversation>();
  let messages = Map.empty<Common.ConversationId, List.List<MessagingTypes.Message>>();

  include MessagingMixin(
    accessControlState,
    profiles,
    conversations,
    messages,
  );
};
