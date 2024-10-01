export type DatasetInfo = {
  rows: number;
}

export type MessageReaction = {
  emoji: string;
  count: number;
}

export type MessageMediaType = "MessageMediaDocumentVideo" | "MessageMediaWebPage" | "MessageMediaPhoto" | "MessageMediaDocumentAudio" | "MessageMediaDocumentDocument" | "";

export type MessageData = {
  message_text: string; /** Text of the message */
  chat_name: string; /** Name of the chat */
  chat_handle: string; /** Handle of the chat */
  message_date: string; /** Date of the message */
  message_fwd_count: number; /** Number of times the message was forwarded */
  message_reactions: MessageReaction[]; /** Reactions to the message */
  message_reactions_count: number; /** Number of reactions to the message */
  message_view_count: number; /** Number of times the message was viewed */
  message_media_type: MessageMediaType; /** Attached media type */
  webpage_author: string; /** If message_media_type is MessageMediaWebPage: Author of the webpage */
  webpage_description: string; /** If message_media_type is MessageMediaWebPage: Description of the webpage */
  webpage_title: string; /** If message_media_type is MessageMediaWebPage: Title of the webpage */
  webpage_url: string; /** If message_media_type is MessageMediaWebPage: URL of the webpage */
  is_fwd: boolean; /** Whether the message is a forward */
  fwd_from_chat_handle: string; /** If is_fwd is true: Handle of the chat the message was forwarded from */
  is_reply: boolean; /** Whether the message is a reply */
  reply_to_message_id: number; /** If is_reply is true: ID of the message being replied to */
}

export type AnnotationSample = {
  sample: MessageData;
  thread: MessageData[];
};

/* 
**Reactions**
'message_fwd_count', 
'message_reactions'
'message_reactions_count'
message_view_count

**Connections/Internal**
'fwd_from_chat_handle',
'is_fwd'
'is_group_elem'
'is_reply'
'message_group_id'
reply_to_message_id
reply_to_top_message_id
telegram_chat_id
telegram_message_id
telegram_sender_id

**Unclear**
'message_media_type'
webpage_author
webpage_description
webpage_title
webpage_url
*/