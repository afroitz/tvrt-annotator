import { AnnotationSample } from "@/types/types";
import { FaArrowUp, FaShare } from "react-icons/fa";
import MessageDisplay from "./MessageDisplay";

export type SampleDisplayProps = {
  sample: AnnotationSample;
};

const SampleDisplay = ({ sample }: SampleDisplayProps) => {

  const msgData = sample.sample;
  const thread = [...sample.thread].reverse();

  return <div className="flex flex-col gap-5 px-4 py-2 items-center">
    {/* Reply section */}
    {msgData.is_reply && (
      <div>
        {thread.map((msg) => (
          <div className="flex flex-col gap-5 items-center" key={`${msg.telegram_message_id}${msg.chat_handle}`}>
            <MessageDisplay message={msg} classes="opacity-50" />
            <div className="bg-gray-200 p-2 rounded-xl flex gap-4 items-center px-4 py-2">
              <FaArrowUp className="w-10 h-10"/>
              <p className="text-xl">Message is a reply</p>
            </div>
          </div>
        ))}
      </div>
    )}
    {/* Forwarded indicator */}
    {msgData.is_fwd && (
      <div className="bg-gray-200 p-2 rounded-xl flex gap-4 items-center px-4 py-2">
        <FaShare className="w-10 h-10"/>
        <p className="text-xl">{msgData.fwd_from_chat_handle ? (<>Forwarded from <span className="italic">{msgData.fwd_from_chat_handle}</span></>) : "Forwarded from unknown chat"}</p>
      </div>
    )}
    {/* Display the message */}
    <MessageDisplay message={msgData} />
  </div>
}

export default SampleDisplay;