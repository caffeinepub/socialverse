module {
  public type UserId = Principal;
  public type Timestamp = Int;
  public type PostId = Text;
  public type CommentId = Text;
  public type MessageId = Text;
  public type ConversationId = Text;

  public type MediaType = {
    #photo;
    #video;
  };

  public type PaginationResult<T> = {
    items : [T];
    nextOffset : Nat;
    hasMore : Bool;
  };
};
