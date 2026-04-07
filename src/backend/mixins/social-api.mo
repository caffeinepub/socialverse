import Map "mo:core/Map";
import Set "mo:core/Set";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import Storage "mo:caffeineai-object-storage/Storage";
import Common "../types/common";
import SocialTypes "../types/social";
import SocialLib "../lib/social";

mixin (
  accessControlState : AccessControl.AccessControlState,
  profiles : Map.Map<Common.UserId, SocialTypes.UserProfile>,
  usernames : Map.Map<Text, Common.UserId>,
  posts : Map.Map<Common.PostId, SocialTypes.Post>,
  comments : Map.Map<Common.PostId, List.List<SocialTypes.Comment>>,
  likes : Map.Map<Common.PostId, Set.Set<Common.UserId>>,
  follows : Map.Map<Common.UserId, Set.Set<Common.UserId>>,
  followers : Map.Map<Common.UserId, Set.Set<Common.UserId>>,
) {
  var nextPostId : Nat = 0;
  var nextCommentId : Nat = 0;

  // --- Profile ---

  public shared ({ caller }) func createUserProfile(
    username : Text,
    displayName : Text,
    bio : Text,
  ) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    SocialLib.createProfile(profiles, usernames, caller, username, displayName, bio);
  };

  public query func getUserProfile(userId : Common.UserId) : async ?SocialTypes.UserProfile {
    SocialLib.getProfile(profiles, userId);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?SocialTypes.UserProfile {
    SocialLib.getProfile(profiles, caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(
    displayName : Text,
    bio : Text,
    avatarMediaId : ?Storage.ExternalBlob,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    ignore SocialLib.updateProfile(profiles, caller, displayName, bio, avatarMediaId);
  };

  public shared ({ caller }) func updateUserProfile(
    displayName : Text,
    bio : Text,
    avatarMediaId : ?Storage.ExternalBlob,
  ) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    SocialLib.updateProfile(profiles, caller, displayName, bio, avatarMediaId);
  };

  public query func searchUsers(searchTerm : Text) : async [SocialTypes.UserProfile] {
    SocialLib.searchUsers(profiles, searchTerm);
  };

  // --- Posts ---

  public shared ({ caller }) func createPost(
    caption : Text,
    mediaId : Storage.ExternalBlob,
    mediaType : Common.MediaType,
  ) : async Common.PostId {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let profile = switch (profiles.get(caller)) {
      case (?p) { p };
      case null { Runtime.trap("Profile not found. Create a profile first.") };
    };
    let postId = nextPostId.toText();
    nextPostId += 1;
    SocialLib.createPost(posts, profiles, postId, caller, profile.username, caption, mediaId, mediaType);
    postId;
  };

  public query func getPosts(offset : Nat, limit : Nat) : async Common.PaginationResult<SocialTypes.Post> {
    SocialLib.getPosts(posts, offset, limit);
  };

  public query func getPostsByUser(userId : Common.UserId) : async [SocialTypes.Post] {
    SocialLib.getPostsByUser(posts, userId);
  };

  public query func getPost(postId : Common.PostId) : async ?SocialTypes.Post {
    SocialLib.getPost(posts, postId);
  };

  // --- Likes ---

  public shared ({ caller }) func likePost(postId : Common.PostId) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    SocialLib.likePost(posts, likes, caller, postId);
  };

  public shared ({ caller }) func unlikePost(postId : Common.PostId) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    SocialLib.unlikePost(posts, likes, caller, postId);
  };

  public query ({ caller }) func isLiked(postId : Common.PostId) : async Bool {
    SocialLib.isLiked(likes, caller, postId);
  };

  // --- Comments ---

  public shared ({ caller }) func addComment(postId : Common.PostId, content : Text) : async Common.CommentId {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let profile = switch (profiles.get(caller)) {
      case (?p) { p };
      case null { Runtime.trap("Profile not found. Create a profile first.") };
    };
    let commentId = "c" # nextCommentId.toText();
    nextCommentId += 1;
    switch (SocialLib.addComment(comments, posts, commentId, caller, profile.username, postId, content)) {
      case null { Runtime.trap("Post not found") };
      case (?_) { commentId };
    };
  };

  public query func getComments(postId : Common.PostId) : async [SocialTypes.Comment] {
    SocialLib.getComments(comments, postId);
  };

  // --- Follows ---

  public shared ({ caller }) func followUser(targetId : Common.UserId) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    SocialLib.followUser(follows, followers, profiles, caller, targetId);
  };

  public shared ({ caller }) func unfollowUser(targetId : Common.UserId) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    SocialLib.unfollowUser(follows, followers, profiles, caller, targetId);
  };

  public query ({ caller }) func isFollowing(targetId : Common.UserId) : async Bool {
    SocialLib.isFollowing(follows, caller, targetId);
  };

  public query func getFollowers(userId : Common.UserId) : async [SocialTypes.UserProfile] {
    SocialLib.getFollowers(followers, profiles, userId);
  };

  public query func getFollowing(userId : Common.UserId) : async [SocialTypes.UserProfile] {
    SocialLib.getFollowing(follows, profiles, userId);
  };
};
