import { MessageData } from '@/types/types'
import emojilib from 'emojilib'

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

export const getEmojiByName = (name: string) => {
  let normName = /:.+:/.test(name) ? name.slice(1, -1) : name

  if(normName in replacements){
    normName = replacements[normName as keyof typeof replacements]
  }

  return emojiLookup.get(normName) || name
}

/** Some processing to prepare message data for rendering */
export const processMessageData = (data: any): MessageData => {
  data.message_fwd_count = Number(data.message_fwd_count)
  data.message_reactions_count = Number(data.message_reactions_count)
  data.message_view_count = Number(data.message_view_count)

  const parsedReactions = data.message_reactions ? JSON.parse(data.message_reactions.replace(/'/g, '"')) : {};
  const emojiReactions = [];

  for (const key in parsedReactions) {
    const emoji = getEmojiByName(key);
    emojiReactions.push({emoji: emoji, count: Number(parsedReactions[key])});
  }

  data.message_reactions = emojiReactions;

  return data as MessageData;
}

export const getMessageReplyThread = (message: MessageData, allMessages: any[]): any[] => {
  // if the message is not a reply, return an empty array
  if(!message.is_reply){
    return []
  }

  const parent = allMessages.find((msg) => msg.telegram_message_id === message.reply_to_message_id && msg.chat_handle === message.chat_handle)

  if(!parent){
    return []
  }

  return [parent, ...getMessageReplyThread(parent, allMessages)]
}