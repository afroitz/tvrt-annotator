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

export const getEmojiByName = (name: string) => {
  const normName = /:.+:/.test(name) ? name.slice(1, -1) : name
  return emojiLookup.get(normName) || name
}