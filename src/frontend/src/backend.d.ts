import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Timestamp = bigint;
export type CommentId = string;
export interface PaginationResult {
    nextOffset: bigint;
    hasMore: boolean;
    items: Array<Post>;
}
export interface Comment {
    id: CommentId;
    authorUsername: string;
    content: string;
    authorId: UserId;
    createdAt: Timestamp;
    postId: PostId;
}
export type PostId = string;
export type ConversationId = string;
export type UserId = Principal;
export type MessageId = string;
export interface Post {
    id: PostId;
    authorUsername: string;
    likeCount: bigint;
    authorId: UserId;
    createdAt: Timestamp;
    caption: string;
    commentCount: bigint;
    mediaType: MediaType;
    mediaId: ExternalBlob;
}
export interface Message {
    id: MessageId;
    content: string;
    createdAt: Timestamp;
    senderUsername: string;
    conversationId: ConversationId;
    senderId: UserId;
}
export interface Conversation {
    id: ConversationId;
    participants: Array<UserId>;
    lastMessageAt: Timestamp;
    lastMessage?: string;
    unreadCount: bigint;
}
export interface UserProfile {
    id: UserId;
    bio: string;
    postCount: bigint;
    username: string;
    displayName: string;
    createdAt: Timestamp;
    followerCount: bigint;
    followingCount: bigint;
    avatarMediaId?: ExternalBlob;
}
export enum MediaType {
    video = "video",
    photo = "photo"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(postId: PostId, content: string): Promise<CommentId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPost(caption: string, mediaId: ExternalBlob, mediaType: MediaType): Promise<PostId>;
    createUserProfile(username: string, displayName: string, bio: string): Promise<boolean>;
    followUser(targetId: UserId): Promise<boolean>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getComments(postId: PostId): Promise<Array<Comment>>;
    getConversations(): Promise<Array<Conversation>>;
    getFollowers(userId: UserId): Promise<Array<UserProfile>>;
    getFollowing(userId: UserId): Promise<Array<UserProfile>>;
    getMessages(conversationId: ConversationId): Promise<Array<Message>>;
    getPost(postId: PostId): Promise<Post | null>;
    getPosts(offset: bigint, limit: bigint): Promise<PaginationResult>;
    getPostsByUser(userId: UserId): Promise<Array<Post>>;
    getUserProfile(userId: UserId): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isFollowing(targetId: UserId): Promise<boolean>;
    isLiked(postId: PostId): Promise<boolean>;
    likePost(postId: PostId): Promise<boolean>;
    saveCallerUserProfile(displayName: string, bio: string, avatarMediaId: ExternalBlob | null): Promise<void>;
    searchUsers(searchTerm: string): Promise<Array<UserProfile>>;
    sendMessage(recipientId: UserId, content: string): Promise<MessageId>;
    unfollowUser(targetId: UserId): Promise<boolean>;
    unlikePost(postId: PostId): Promise<boolean>;
    updateUserProfile(displayName: string, bio: string, avatarMediaId: ExternalBlob | null): Promise<boolean>;
}
