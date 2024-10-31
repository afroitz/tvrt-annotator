/** Message reaction data */
export type MessageReaction = {
  emoji: string;
  count: number;
}

/** Types of media attached to messages */
export type MessageMediaType = "MessageMediaDocumentVideo" | "MessageMediaWebPage" | "MessageMediaPhoto" | "MessageMediaDocumentAudio" | "MessageMediaDocumentDocument" | "";

/** Data structure of an annotation sample */
export type MessageData = {
  telegram_message_id: number; /** ID of the message */
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

/** A sample for annotation, including the sample itself and the reply thread */
export type AnnotationSample = {
  sample: MessageData;
  thread: MessageData[];
};

/** Information about an annotation task: Labels and rumors */
export type TaskInfo = {
  labels: string[];
  rumors: string[];
}

/** Information about an annotation process */
export type AnnotationMeta = {
  selectedSample: number;
}

/** A single annotations */
export type Annotation = {
  rumorIndex: number;
  label: string;
}

/** The annotations for a sample */
export type SampleAnnotations = {
  sampleIndex: number;
  annotations: Annotation[]
}

/** The data of an annotation in progress */
export type AnnotationData = {
  annotatedSamples: SampleAnnotations[];
}

/** Information about and state of an annotation process */
export type AnnotationInfo = {
  meta: AnnotationMeta;
  data: AnnotationData;
}

/** Information about a dataset */
export type DatasetInfo = {
  rows: number;
  taskInfo: TaskInfo;
}