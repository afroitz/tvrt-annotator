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