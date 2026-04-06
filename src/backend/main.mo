import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Blob "mo:core/Blob";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Order "mo:core/Order";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type MediaType = {
    #image;
    #video;
  };

  public type NotificationType = {
    #like;
    #comment;
    #follow;
    #message;
  };

  // State
  var nextCatalogItemId = 0;
  var nextPostId = 0;
  var nextStoryId = 0;
  var nextMessageId = 0;
  var nextNotificationId = 0;
};
