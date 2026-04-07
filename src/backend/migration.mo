module {
  // Old actor stable state — only the fields being explicitly dropped
  type OldActor = {
    var nextCatalogItemId : Nat;
    var nextStoryId : Nat;
    var nextNotificationId : Nat;
  };

  // New actor has no corresponding fields — intentional drop
  type NewActor = {};

  public func run(old : OldActor) : NewActor {
    // Intentionally drop nextCatalogItemId, nextStoryId, nextNotificationId
    // These features are not present in the new version
    ignore old.nextCatalogItemId;
    ignore old.nextStoryId;
    ignore old.nextNotificationId;
    {};
  };
};
