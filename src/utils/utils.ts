import { MessageData } from '@/types/types'
import emojilib from 'emojilib'
import * as fs from 'node:fs/promises';
import * as path from 'path';

/** Create a mapping from emoji names to emoji */
const constructReverseEmojiMap = (): Map<string, string> => {
  const emojiData = new Map()

  for (const [emoji, names] of Object.entries(emojilib)) {
    for (const name of names) {
      emojiData.set(name, emoji)
    }
  }

  return emojiData
}

const emojiLookup = constructReverseEmojiMap()

const replacements = {
  'enraged_face': 'angry'
}

/** Get an emoji by a name. If not found, return the name again. */
export const getEmojiByName = (name: string) => {
  let normName = /:.+:/.test(name) ? name.slice(1, -1) : name

  if(normName in replacements){
    normName = replacements[normName as keyof typeof replacements]
  }

  return emojiLookup.get(normName) || name
}

/** Some processing to prepare message data for rendering */
export const processMessageData = (data: any): MessageData => {
  data.telegram_message_id = Number(data.telegram_message_id)
  data.message_fwd_count = Number(data.message_fwd_count)
  data.message_reactions_count = Number(data.message_reactions_count)
  data.message_view_count = Number(data.message_view_count)

  // parse booleans
  data.is_fwd = data.is_fwd === 'True'
  data.is_reply = data.is_reply === 'True'

  const parsedReactions = data.message_reactions ? JSON.parse(data.message_reactions.replace(/'/g, '"')) : {};
  const emojiReactions = [];

  for (const key in parsedReactions) {
    const emoji = getEmojiByName(key);
    emojiReactions.push({emoji: emoji, count: Number(parsedReactions[key])});
  }

  data.message_reactions = emojiReactions;

  return data as MessageData;
}

/** Recursively resolve the reply thread of a message */
export const getMessageReplyThread = (message: any, allMessages: any[]): any[] => {
  // if the message is not a reply, return an empty array
  if(!(message.is_reply === true || message.is_reply === 'True')){
    return []
  }

  const parent = allMessages.find((msg) => Number(msg.telegram_message_id) === Number(message.reply_to_message_id) && msg.chat_handle === message.chat_handle)

  if(!parent){
    return []
  }

  return [parent, ...getMessageReplyThread(parent, allMessages)]
}

/** Check the structure of a dataset for validity */
export const validateDatasetStructure = async (datasetPath: string) => {

  // Check if required files exist
  const requiredFiles = ['filtered.csv', 'full.csv', 'task.json'];
  
  for (const file of requiredFiles) {
    const filePath = path.join(datasetPath, file);

    try {
      await fs.access(filePath);
    } catch {
      return false;
    }
  }

  return true;
};