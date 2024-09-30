import { AnnotationSample } from "@/types/types";
import { FaEye, FaShare, FaSmile } from "react-icons/fa";
import ReactMarkdown from "react-markdown";

export type SampleDisplayProps = {
  sample: AnnotationSample;
};

const SampleDisplay = (props: SampleDisplayProps) => {

  // destructure sample from props
  const { sample } = props;

  return (
    <div className="mx-4 my-2">
      <h2 className="font-bold mb-1">
          Chat: {sample.chat_name}{" "}
          <span className="italic">({sample.chat_handle})</span>
      </h2>
      {/* Actual message block */}
      <div className="px-4 py-2 bg-gray-200 rounded-xl">
        {/* Date display */}
        <p className="text-gray-500 italic text-sm mb-1">{sample.message_date}</p>
        {/* Message text */}
        <ReactMarkdown>{sample.message_text || "Message has no text."}</ReactMarkdown>
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
