import { AnnotationSample } from "@/types/types";
import { FaShare } from "react-icons/fa";
import MessageDisplay from "./MessageDisplay";

export type SampleDisplayProps = {
  sample: AnnotationSample;
};

const SampleDisplay = ({ sample }: SampleDisplayProps) => {

  const msgData = sample.sample;

  return <div className="flex flex-col gap-5 px-4 py-2 items-center">
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