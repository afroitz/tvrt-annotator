import { AnnotationSample } from "@/types/types";
import { FaCamera, FaEye, FaFile, FaPlay, FaShare, FaSmile, FaVolumeUp } from "react-icons/fa";
import ReactMarkdown from "react-markdown";

export type SampleDisplayProps = {
  sample: AnnotationSample;
};

const SampleDisplay = (props: SampleDisplayProps) => {

  // destructure sample from props
  const { sample } = props;

  // switch case for message attachment wording: Video, Audio, Photo etc
  let mediaTypeText = "";

  switch (sample.message_media_type) {
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
    <div className="mx-4 my-2">
      <h2 className="font-bold mb-1">
          Chat: {sample.chat_name}{" "}
          <span className="italic">({sample.chat_handle})</span>
      </h2>
      {/* Actual message block */}
      <div className="px-4 py-2 bg-gray-200 rounded-xl">
        {/* Date display */}
        <p className="text-gray-500 italic text-sm mb-2">{sample.message_date}</p>
        {/* Message text */}
        <div className="pl-4 border-l-2 border-black">
          <ReactMarkdown>{sample.message_text || "Message has no text."}</ReactMarkdown>
        </div>
        {/* Message media */}
        {sample.message_media_type && sample.message_media_type !== 'MessageMediaWebPage' && (
          <div className="mt-2 italic flex gap-2 items-center">
            {sample.message_media_type === "MessageMediaPhoto" && <FaCamera />}
            {sample.message_media_type === "MessageMediaDocumentVideo" && <FaPlay />}
            {sample.message_media_type === "MessageMediaDocumentAudio" && <FaVolumeUp />}
            {sample.message_media_type === "MessageMediaDocumentDocument" && <FaFile />}
            {mediaTypeText}
          </div>
        )}
        {sample.message_media_type === 'MessageMediaWebPage' && (
          <>
            <div className="mt-2">
              {mediaTypeText}
            </div>
            <div className="px-2 py-2 rounded-xl bg-blue-200 my-2">
              <h3 className="font-bold">{sample.webpage_title}</h3>
              <p className="text-sm italic mb-2">
                {sample.webpage_author && <span>{sample.webpage_author} |</span>}
                <span>{sample.webpage_url}</span>
              </p>
              <p>{sample.webpage_description}</p>
              
            </div>
          </>
          
        )}
        {/* Message engagement */}
        <div className="flex mt-2 pt-2 border-t border-black">
          <div className="flex gap-2 items-center">
            <FaEye /> viewed {sample.message_view_count} times
          </div>
          <div className="px-3">|</div>
          <div className="flex gap-2 items-center">
            <FaShare /> forwarded {sample.message_fwd_count} times
          </div>
          <div className="px-3">|</div>
          <div className="flex gap-2 items-center">
            <FaSmile /> {sample.message_reactions_count} reactions
          </div>
        </div>
        <div>
          {sample.message_reactions.map((reaction, index) => (
            <span key={index} className="mr-2">
              {reaction.emoji} {reaction.count}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SampleDisplay;
