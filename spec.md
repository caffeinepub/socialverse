# SocialVerse - All-in-One Social Media App

## Current State
New project, no existing code.

## Requested Changes (Diff)

### Add
- Beautiful branded logo and splash/loading screen
- User Authentication: Login / Sign Up with profile setup
- Home Feed (Instagram-style): photo/video posts, likes, comments, stories
- Reels / Short Videos (YouTube Shorts / Instagram Reels style): vertical scroll, like, share
- Video Streaming Section (Netflix-style): featured content, categories, watch page
- Chat / Messaging (WhatsApp-style): direct messages between users
- Social Posts / Status Updates (Meta/Facebook-style): text + image posts, reactions
- Explore / Discover page: trending content, user search
- User Profile page: avatar, bio, followers/following, posts grid
- Upload flow: image/video upload with progress indicator
- Notifications page
- Bottom navigation bar with icons for all sections
- Smooth animations and transitions throughout
- Stories feature (Instagram-style horizontal strips)
- Like, comment, share interactions on all content types

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Setup authorization for login/signup with user profiles
2. Setup blob-storage for image/video uploads
3. Backend: user profiles, posts, reels, messages, notifications, follows
4. Frontend:
   - Branded splash/loading screen with animated logo
   - Auth screens (login/signup) with smooth transitions
   - Bottom tab navigation (Home, Reels, Upload, Chat, Profile)
   - Home Feed with stories strip + posts
   - Reels vertical scroll player
   - Video streaming / watch page
   - Chat inbox + message thread
   - Explore/search page
   - Profile page with grid layout
   - Upload modal with drag-and-drop + progress bar
   - Notifications page
   - Consistent dark/vibrant theme with glassmorphism effects
