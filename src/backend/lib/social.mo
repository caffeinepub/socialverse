import Map "mo:core/Map";
import Set "mo:core/Set";
import List "mo:core/List";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Common "../types/common";
import SocialTypes "../types/social";
import Storage "mo:caffeineai-object-storage/Storage";

module {
  // --- Profile ---

  public func createProfile(
    profiles : Map.Map<Common.UserId, SocialTypes.UserProfile>,
    usernames : Map.Map<Text, Common.UserId>,
    caller : Common.UserId,
    username : Text,
    displayName : Text,
    bio : Text,
  ) : Bool {
    // Check if already has a profile
    switch (profiles.get(caller)) {
      case (?_) { return false };
      case null {};
    };
    // Check if username is taken
    let lowerUsername = username.toLower();
    switch (usernames.get(lowerUsername)) {
      case (?_) { return false };
      case null {};
    };
    let profile : SocialTypes.UserProfile = {
      id = caller;
      username = lowerUsername;
      displayName = displayName;
      bio = bio;
      avatarMediaId = null;
      followerCount = 0;
      followingCount = 0;
      postCount = 0;
      createdAt = Time.now();
    };
    profiles.add(caller, profile);
    usernames.add(lowerUsername, caller);
    true;
  };

  public func getProfile(
    profiles : Map.Map<Common.UserId, SocialTypes.UserProfile>,
    userId : Common.UserId,
  ) : ?SocialTypes.UserProfile {
    profiles.get(userId);
  };

  public func updateProfile(
    profiles : Map.Map<Common.UserId, SocialTypes.UserProfile>,
    caller : Common.UserId,
    displayName : Text,
    bio : Text,
    avatarMediaId : ?Storage.ExternalBlob,
  ) : Bool {
    switch (profiles.get(caller)) {
      case null { false };
      case (?existing) {
        let updated : SocialTypes.UserProfile = {
          existing with
          displayName = displayName;
          bio = bio;
          avatarMediaId = avatarMediaId;
        };
        profiles.add(caller, updated);
        true;
      };
    };
  };

  public func searchUsers(
    profiles : Map.Map<Common.UserId, SocialTypes.UserProfile>,
    searchTerm : Text,
  ) : [SocialTypes.UserProfile] {
    let lower = searchTerm.toLower();
    let results = List.empty<SocialTypes.UserProfile>();
    profiles.forEach(func(_, profile) {
      if (profile.username.contains(#text lower) or profile.displayName.toLower().contains(#text lower)) {
        results.add(profile);
      };
    });
    results.toArray();
  };

  // --- Posts ---

  public func createPost(
    posts : Map.Map<Common.PostId, SocialTypes.Post>,
    profiles : Map.Map<Common.UserId, SocialTypes.UserProfile>,
    postId : Common.PostId,
    caller : Common.UserId,
    authorUsername : Text,
    caption : Text,
    mediaId : Storage.ExternalBlob,
    mediaType : Common.MediaType,
  ) : () {
    let post : SocialTypes.Post = {
      id = postId;
      authorId = caller;
      authorUsername = authorUsername;
      caption = caption;
      mediaId = mediaId;
      mediaType = mediaType;
      likeCount = 0;
      commentCount = 0;
      createdAt = Time.now();
    };
    posts.add(postId, post);
    // Increment the author's postCount
    switch (profiles.get(caller)) {
      case null {};
      case (?p) {
        profiles.add(caller, { p with postCount = p.postCount + 1 });
      };
    };
  };

  public func getPosts(
    posts : Map.Map<Common.PostId, SocialTypes.Post>,
    offset : Nat,
    limit : Nat,
  ) : Common.PaginationResult<SocialTypes.Post> {
    // Collect all posts sorted by createdAt descending
    let allPosts = posts.values().toArray();
    let sorted = allPosts.sort(func(a : SocialTypes.Post, b : SocialTypes.Post) : { #less; #equal; #greater } {
      Int.compare(b.createdAt, a.createdAt)
    });
    let total = sorted.size();
    if (offset >= total) {
      return { items = []; nextOffset = offset; hasMore = false };
    };
    let end = Nat.min(offset + limit, total);
    let items = sorted.sliceToArray(offset, end);
    { items = items; nextOffset = end; hasMore = end < total };
  };

  public func getPostsByUser(
    posts : Map.Map<Common.PostId, SocialTypes.Post>,
    userId : Common.UserId,
  ) : [SocialTypes.Post] {
    let results = List.empty<SocialTypes.Post>();
    posts.forEach(func(_, post) {
      if (Principal.equal(post.authorId, userId)) {
        results.add(post);
      };
    });
    let arr = results.toArray();
    arr.sort(func(a : SocialTypes.Post, b : SocialTypes.Post) : { #less; #equal; #greater } {
      Int.compare(b.createdAt, a.createdAt)
    });
  };

  public func getPost(
    posts : Map.Map<Common.PostId, SocialTypes.Post>,
    postId : Common.PostId,
  ) : ?SocialTypes.Post {
    posts.get(postId);
  };

  // --- Likes ---
  // likes: Map<PostId, Set<UserId>>

  public func likePost(
    posts : Map.Map<Common.PostId, SocialTypes.Post>,
    likes : Map.Map<Common.PostId, Set.Set<Common.UserId>>,
    caller : Common.UserId,
    postId : Common.PostId,
  ) : Bool {
    switch (posts.get(postId)) {
      case null { false };
      case (?post) {
        let likerSet = switch (likes.get(postId)) {
          case (?s) { s };
          case null {
            let s = Set.empty<Common.UserId>();
            likes.add(postId, s);
            s;
          };
        };
        if (likerSet.contains(caller)) {
          false; // already liked
        } else {
          likerSet.add(caller);
          posts.add(postId, { post with likeCount = post.likeCount + 1 });
          true;
        };
      };
    };
  };

  public func unlikePost(
    posts : Map.Map<Common.PostId, SocialTypes.Post>,
    likes : Map.Map<Common.PostId, Set.Set<Common.UserId>>,
    caller : Common.UserId,
    postId : Common.PostId,
  ) : Bool {
    switch (posts.get(postId)) {
      case null { false };
      case (?post) {
        switch (likes.get(postId)) {
          case null { false };
          case (?likerSet) {
            if (likerSet.contains(caller)) {
              likerSet.remove(caller);
              let newCount = if (post.likeCount > 0) { Nat.sub(post.likeCount, 1) } else { 0 };
              posts.add(postId, { post with likeCount = newCount });
              true;
            } else {
              false;
            };
          };
        };
      };
    };
  };

  public func isLiked(
    likes : Map.Map<Common.PostId, Set.Set<Common.UserId>>,
    caller : Common.UserId,
    postId : Common.PostId,
  ) : Bool {
    switch (likes.get(postId)) {
      case null { false };
      case (?likerSet) { likerSet.contains(caller) };
    };
  };

  // --- Comments ---

  public func addComment(
    comments : Map.Map<Common.PostId, List.List<SocialTypes.Comment>>,
    posts : Map.Map<Common.PostId, SocialTypes.Post>,
    commentId : Common.CommentId,
    caller : Common.UserId,
    authorUsername : Text,
    postId : Common.PostId,
    content : Text,
  ) : ?SocialTypes.Comment {
    switch (posts.get(postId)) {
      case null { null };
      case (?post) {
        let comment : SocialTypes.Comment = {
          id = commentId;
          postId = postId;
          authorId = caller;
          authorUsername = authorUsername;
          content = content;
          createdAt = Time.now();
        };
        let commentList = switch (comments.get(postId)) {
          case (?lst) { lst };
          case null {
            let lst = List.empty<SocialTypes.Comment>();
            comments.add(postId, lst);
            lst;
          };
        };
        commentList.add(comment);
        posts.add(postId, { post with commentCount = post.commentCount + 1 });
        ?comment;
      };
    };
  };

  public func getComments(
    comments : Map.Map<Common.PostId, List.List<SocialTypes.Comment>>,
    postId : Common.PostId,
  ) : [SocialTypes.Comment] {
    switch (comments.get(postId)) {
      case null { [] };
      case (?lst) { lst.toArray() };
    };
  };

  // --- Follows ---

  public func followUser(
    follows : Map.Map<Common.UserId, Set.Set<Common.UserId>>,
    followers : Map.Map<Common.UserId, Set.Set<Common.UserId>>,
    profiles : Map.Map<Common.UserId, SocialTypes.UserProfile>,
    caller : Common.UserId,
    targetId : Common.UserId,
  ) : Bool {
    if (Principal.equal(caller, targetId)) { return false };
    // Add to caller's following set
    let followingSet = switch (follows.get(caller)) {
      case (?s) { s };
      case null {
        let s = Set.empty<Common.UserId>();
        follows.add(caller, s);
        s;
      };
    };
    if (followingSet.contains(targetId)) {
      return false; // already following
    };
    followingSet.add(targetId);
    // Add to target's followers set
    let followerSet = switch (followers.get(targetId)) {
      case (?s) { s };
      case null {
        let s = Set.empty<Common.UserId>();
        followers.add(targetId, s);
        s;
      };
    };
    followerSet.add(caller);
    // Update follower/following counts
    switch (profiles.get(caller)) {
      case null {};
      case (?p) { profiles.add(caller, { p with followingCount = p.followingCount + 1 }) };
    };
    switch (profiles.get(targetId)) {
      case null {};
      case (?p) { profiles.add(targetId, { p with followerCount = p.followerCount + 1 }) };
    };
    true;
  };

  public func unfollowUser(
    follows : Map.Map<Common.UserId, Set.Set<Common.UserId>>,
    followers : Map.Map<Common.UserId, Set.Set<Common.UserId>>,
    profiles : Map.Map<Common.UserId, SocialTypes.UserProfile>,
    caller : Common.UserId,
    targetId : Common.UserId,
  ) : Bool {
    switch (follows.get(caller)) {
      case null { false };
      case (?followingSet) {
        if (not followingSet.contains(targetId)) {
          return false;
        };
        followingSet.remove(targetId);
        switch (followers.get(targetId)) {
          case null {};
          case (?followerSet) { followerSet.remove(caller) };
        };
        // Update follower/following counts
        switch (profiles.get(caller)) {
          case null {};
          case (?p) {
            let newCount = if (p.followingCount > 0) { Nat.sub(p.followingCount, 1) } else { 0 };
            profiles.add(caller, { p with followingCount = newCount });
          };
        };
        switch (profiles.get(targetId)) {
          case null {};
          case (?p) {
            let newCount = if (p.followerCount > 0) { Nat.sub(p.followerCount, 1) } else { 0 };
            profiles.add(targetId, { p with followerCount = newCount });
          };
        };
        true;
      };
    };
  };

  public func isFollowing(
    follows : Map.Map<Common.UserId, Set.Set<Common.UserId>>,
    caller : Common.UserId,
    targetId : Common.UserId,
  ) : Bool {
    switch (follows.get(caller)) {
      case null { false };
      case (?followingSet) { followingSet.contains(targetId) };
    };
  };

  public func getFollowers(
    followers : Map.Map<Common.UserId, Set.Set<Common.UserId>>,
    profiles : Map.Map<Common.UserId, SocialTypes.UserProfile>,
    userId : Common.UserId,
  ) : [SocialTypes.UserProfile] {
    switch (followers.get(userId)) {
      case null { [] };
      case (?followerSet) {
        let results = List.empty<SocialTypes.UserProfile>();
        followerSet.forEach(func(followerId) {
          switch (profiles.get(followerId)) {
            case null {};
            case (?p) { results.add(p) };
          };
        });
        results.toArray();
      };
    };
  };

  public func getFollowing(
    follows : Map.Map<Common.UserId, Set.Set<Common.UserId>>,
    profiles : Map.Map<Common.UserId, SocialTypes.UserProfile>,
    userId : Common.UserId,
  ) : [SocialTypes.UserProfile] {
    switch (follows.get(userId)) {
      case null { [] };
      case (?followingSet) {
        let results = List.empty<SocialTypes.UserProfile>();
        followingSet.forEach(func(followingId) {
          switch (profiles.get(followingId)) {
            case null {};
            case (?p) { results.add(p) };
          };
        });
        results.toArray();
      };
    };
  };
};
