import { MessageData } from "@/types/types";
import { FaCamera, FaEye, FaFile, FaPlay, FaShare, FaSmile, FaVolumeUp } from "react-icons/fa";
import ReactMarkdown from "react-markdown";

export type MessageDisplayProps = {
  message: MessageData;
  classes?: string;
};

const MessageDisplay = (props: MessageDisplayProps) => {

  // destructure sample from props
  const { message, classes } = props;

  // switch case for message attachment wording: Video, Audio, Photo etc
  let mediaTypeText = "";

  switch (message.message_media_type) {
    case "MessageMediaDocumentVideo":
      mediaTypeText = "Message had video attached";
      break;
    case "MessageMediaWebPage":
      mediaTypeText = "Message references Webpage:";
      break;
    case "MessageMediaPhoto":
      mediaTypeText = "Message had photo attached";
      break;
    case "MessageMediaDocumentAudio":
      mediaTypeText = "Message had audio attached";
      break;
    case "MessageMediaDocumentDocument":
      mediaTypeText = "Message had document attached";
      break;
    default:
      mediaTypeText = "";
      break;
  }

  return (
    <div className={classes}>
      <h2 className="font-bold mb-1">
          Chat: {message.chat_name}{" "}
          <span className="italic">({message.chat_handle})</span>
      </h2>
      {/* Actual message block */}
      <div className="px-4 py-2 bg-gray-200 rounded-xl">
        {/* Date display */}
        <p className="text-gray-500 italic text-sm mb-2">{message.message_date}</p>
        {/* Message text */}
        <div className="pl-4 border-l-2 border-black">
          <ReactMarkdown
            components={{
              a: ({ node, ...props }) => <span>{props.children}</span> // Render links as plain text
            }}
          >
            {message.message_text || "Message has no text."}
          </ReactMarkdown>
        </div>
        {/* Message media */}
        {message.message_media_type && message.message_media_type !== 'MessageMediaWebPage' && (
          <div className="mt-2 italic flex gap-2 items-center">
            {message.message_media_type === "MessageMediaPhoto" && <FaCamera />}
            {message.message_media_type === "MessageMediaDocumentVideo" && <FaPlay />}
            {message.message_media_type === "MessageMediaDocumentAudio" && <FaVolumeUp />}
            {message.message_media_type === "MessageMediaDocumentDocument" && <FaFile />}
            {mediaTypeText}
          </div>
        )}
        {message.message_media_type === 'MessageMediaWebPage' && (
          <>
            <div className="mt-2">
              {mediaTypeText}
            </div>
            <div className="px-2 py-2 rounded-xl bg-blue-200 my-2">
              <h3 className="font-bold">{message.webpage_title}</h3>
              <p className="text-sm italic mb-2">
                {message.webpage_author && <span>{message.webpage_author} |</span>}
                <span>{message.webpage_url}</span>
              </p>
              <p>{message.webpage_description}</p>
              
            </div>
          </>
          
        )}
        {/* Message engagement */}
        <div className="flex mt-2 pt-2 border-t border-black">
          <div className="flex gap-2 items-center">
            <FaEye /> viewed {message.message_view_count} times
          </div>
          <div className="px-3">|</div>
          <div className="flex gap-2 items-center">
            <FaShare /> forwarded {message.message_fwd_count} times
          </div>
          <div className="px-3">|</div>
          <div className="flex gap-2 items-center">
            <FaSmile /> {message.message_reactions_count} reactions
          </div>
        </div>
        <div>
          {message.message_reactions.map((reaction, index) => (
            <span key={index} className="mr-2">
              {reaction.emoji} {reaction.count}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MessageDisplay;
