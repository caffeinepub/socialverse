// Re-export backend types for convenient use across the app
export type {
  UserProfile,
  Post,
  Comment,
  Message,
  Conversation,
  PaginationResult,
  PostId,
  UserId,
  CommentId,
  MessageId,
  ConversationId,
  Timestamp,
} from "./backend";
export { MediaType, UserRole, ExternalBlob } from "./backend";
