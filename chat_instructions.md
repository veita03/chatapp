# MRAZ Chat Redesign Instructions

The user provided extensive instructions regarding the Chat feature overhaul, heavily inspired by Viber. 

**UPDATE:** Below is the combined list of both initial requirements and the V2 feedback requested by the user.

## Core Requirements & Changes Needed

1. **Remove Global Chat & Create Inbox View**
   * The application must have at least one team to have a chat.
   * Remove the current split-view (sidebar + chat on desktop) and instead implement a dedicated "Chats List" page (Inbox).
   * Inside the list, show each team/chat, the last message text, and the date/time of the last message.
   * Sort the list by the most recent message.
   * **V2 Addition:** On the *Teams* page, add a link/icon to the specific chat for that team, and show unread message counts if possible.

2. **Overall Layout & Width**
   * **V2 Addition:** The main container width on the desktop Chat page is too narrow compared to the Teams page. The width MUST be identical to the center container on the Teams page.
   * **V2 Addition:** On the desktop Chat view, there is a weird empty gap between the header and the chat content (likely because there is no subheader). The spacing must start immediately or match exactly the height from other pages.

3. **Input UI & Overlap Issues**
   * Currently, the Quick Actions menu (emoji/poll/location) overlays the messages. The messages should scroll up/shrink to accommodate the dynamic height of the quick actions.
   * Sometimes the last message touches the floor or overlaps with the input bar/date. Fix the bottom padding/margin on the chat history container.
   * On mobile, the input field (where you type) is too thick (too much padding). Make it leaner.

4. **Message Reactions (Emoji Reactions)**
   * Users should be able to long-press or click a message to leave a reaction (Heart, Laugh, Shocked, Sad, Angry, Thumbs Up).

5. **Message Display (Authors)**
   * **V2 Addition:** The user explicitly requested to see WHO wrote what. Ensure the author's name is clearly visible above their messages, along with the time and avatar.

6. **Polls UI Update**
   * For polls, the main chat view should only show the option text and a total count/bar.
   * Clicking an option should open a secondary view (modal/drawer) showing exactly who voted for what and at what time.
   * **V2 Addition:** Change the color of the Poll icon to orange.

7. **Pinning Messages**
   * Admins should be able to pin a message.
   * Pinned messages should be visually distinct (different background color) and likely stick to the top of the chat (or have a pinned indicator).

8. **Unread Messages & Pagination**
   * When entering a chat with e.g. 30 new messages, the view should snap to the **first unread message**, allowing the user to scroll down to read new ones.
   * Currently, loading a chat downloads everything. Limit the initial fetch to the last 30 messages. If the user scrolls up, fetch the next batch (10-30 messages dynamically).

9. **Participants List**
   * Add a way to view all participants in a team/chat (since they are automatically added when joining a team).

10. **Online Status (Presence)**
   * Implement an online indicator for users in the chat (if feasible with Convex). Keep it simple (e.g., a green dot next to their name or in the participants list).

11. **Events (Future Scope)**
   * Prepare the ground for Event blocks inside the chat.
   * Event blocks will show: Active/Finished status, Attendance list (Who is coming, who is not), and Results if finished.
   * Keep this in mind, but it can be fully implemented later.

12. **Fun Icons**
   * Ensure there's a sports/fun icon available in the quick actions (like the beer or football).
