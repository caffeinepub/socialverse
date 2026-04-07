import Common "common";
import Storage "mo:caffeineai-object-storage/Storage";

module {
  public type UserProfile = {
    id : Common.UserId;
    username : Text;
    displayName : Text;
    bio : Text;
    avatarMediaId : ?Storage.ExternalBlob;
    followerCount : Nat;
    followingCount : Nat;
    postCount : Nat;
    createdAt : Common.Timestamp;
  };

  public type Post = {
    id : Common.PostId;
    authorId : Common.UserId;
    authorUsername : Text;
    caption : Text;
    mediaId : Storage.ExternalBlob;
    mediaType : Common.MediaType;
    likeCount : Nat;
    commentCount : Nat;
    createdAt : Common.Timestamp;
  };

  public type Comment = {
    id : Common.CommentId;
    postId : Common.PostId;
    authorId : Common.UserId;
    authorUsername : Text;
    content : Text;
    createdAt : Common.Timestamp;
  };
};
