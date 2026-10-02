const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
  'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'this', 'that',
  'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'them',
  'their', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all',
  'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such',
  'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  'just', 'as', 'if', 'then', 'else', 'about', 'above', 'after', 'again',
  'against', 'between', 'into', 'through', 'during', 'before', 'after',
  'below', 'up', 'down', 'out', 'off', 'over', 'under', 'once', 'here',
  'there', 'any', 'also', 'etc', 'e.g', 'i.e', 'including', 'include',
  'includes', 'including', 'required', 'requirements', 'must', 'strong',
  'good', 'great', 'excellent', 'ability', 'responsibilities', 'role',
  'team', 'work', 'working', 'experience', 'years', 'year', 'plus',
  'looking', 'join', 'help', 'build', 'use', 'using', 'used', 'across',
  'within', 'well', 'new', 'best', 'candidate', 'candidates', 'ideal',
  'preferred', 'nice', 'have', 'having', 'you', 'your', 'our', 'we',
  'us', 'my', 'me', 'mine', 'yours', 'ours', 'theirs', 'him', 'her',
  'his', 'hers', 'its', 'one', 'two', 'three', 'four', 'five', 'six',
  'seven', 'eight', 'nine', 'ten', 'first', 'second', 'third', 'will',
  'get', 'got', 'put', 'set', 'let', 'make', 'makes', 'making', 'made',
  'see', 'seen', 'saw', 'say', 'said', 'says', 'saying', 'go', 'goes',
  'going', 'went', 'come', 'came', 'coming', 'take', 'took', 'taken',
  'taking', 'give', 'gave', 'given', 'giving', 'find', 'found', 'finding',
  'want', 'wants', 'wanted', 'like', 'likes', 'liked', 'know', 'knew',
  'known', 'think', 'thought', 'thinking', 'feel', 'felt', 'feeling',
  'become', 'became', 'becoming', 'leave', 'left', 'leaving', 'keep',
  'kept', 'keeping', 'begin', 'began', 'beginning', 'seem', 'seemed',
  'seeming', 'show', 'showed', 'shown', 'showing', 'run', 'ran', 'running',
  'move', 'moved', 'moving', 'live', 'lived', 'living', 'believe', 'believed',
  'believing', 'bring', 'brought', 'bringing', 'happen', 'happened',
  'happening', 'write', 'wrote', 'written', 'writing', 'provide', 'provided',
  'providing', 'sit', 'sat', 'sitting', 'stand', 'stood', 'standing',
  'lose', 'lost', 'losing', 'pay', 'paid', 'paying', 'meet', 'met',
  'meeting', 'include', 'included', 'including', 'continue', 'continued',
  'continuing', 'learn', 'learned', 'learning', 'change', 'changed',
  'changing', 'lead', 'led', 'leading', 'understand', 'understood',
  'understanding', 'watch', 'watched', 'watching', 'follow', 'followed',
  'following', 'stop', 'stopped', 'stopping', 'create', 'created',
  'creating', 'speak', 'spoke', 'spoken', 'speaking', 'read', 'reading',
  'allow', 'allowed', 'allowing', 'add', 'added', 'adding', 'spend',
  'spent', 'spending', 'grow', 'grew', 'grown', 'growing', 'open',
  'opened', 'opening', 'walk', 'walked', 'walking', 'win', 'won',
  'winning', 'offer', 'offered', 'offering', 'remember', 'remembered',
  'remembering', 'love', 'loved', 'loving', 'consider', 'considered',
  'considering', 'appear', 'appeared', 'appearing', 'buy', 'bought',
  'buying', 'wait', 'waited', 'waiting', 'serve', 'served', 'serving',
  'die', 'died', 'dying', 'send', 'sent', 'sending', 'expect', 'expected',
  'expecting', 'remain', 'remained', 'remaining', 'start', 'started',
  'starting', 'fall', 'fell', 'fallen', 'falling', 'cut', 'cutting',
  'reach', 'reached', 'reaching', 'kill', 'killed', 'killing', 'raise',
  'raised', 'raising', 'pass', 'passed', 'passing', 'sell', 'sold',
  'selling', 'decide', 'decided', 'deciding', 'return', 'returned',
  'returning', 'explain', 'explained', 'explaining', 'hope', 'hoped',
  'hoping', 'carry', 'carried', 'carrying', 'thank', 'thanked',
  'thanking', 'receive', 'received', 'receiving',
]);

export function extractKeywords(text: string, maxKeywords: number = 30): string[] {
  if (!text) return [];

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s+#.]/g, ' ')
    .split(/\s+/)
    .filter((word) => {
      if (word.length < 2) return false;
      if (STOP_WORDS.has(word)) return false;
      if (/^\d+$/.test(word)) return false;
      return true;
    });

  const wordFreq: Map<string, number> = new Map();
  for (const word of words) {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  }

  const sortedWords = Array.from(wordFreq.entries())
    .filter(([, count]) => count >= 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);

  return sortedWords;
}

export function extractBigrams(text: string): string[] {
  if (!text) return [];
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s+#.]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word) && !/^\d+$/.test(word));

  const bigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`;
    if (bigram.length > 5) bigrams.push(bigram);
  }
  return bigrams;
}

export function extractImportantKeywords(text: string, maxKeywords: number = 30): string[] {
  const singleWords = extractKeywords(text, maxKeywords);
  const bigrams = extractBigrams(text);

  const bigramFreq: Map<string, number> = new Map();
  for (const bg of bigrams) {
    bigramFreq.set(bg, (bigramFreq.get(bg) || 0) + 1);
  }
  const topBigrams = Array.from(bigramFreq.entries())
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([bg]) => bg);

  const combined = [...topBigrams, ...singleWords];
  const unique = Array.from(new Set(combined)).slice(0, maxKeywords);
  return unique;
}
