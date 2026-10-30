export type SafetyResult = { action:"allow"|"redirect"|"support"; message?:string; flag?:"self_harm"|"abuse_or_danger"|"personal_info"|"sexual_or_romantic"|"off_topic" };
const danger = /\b(kill myself|hurt myself|self[- ]?harm|suicid\w*|abuse\w*|someone is hurting me|in danger|being harmed)\b/i;
const personal = /\b(what('?s| is) your (phone|address|email)|tell me (your|the) (password|address|phone number)|where do you live)\b/i;
const romance = /\b(sexual|sexting|romantic relationship|date me|kiss me)\b/i;
// Text shown to the whole class (anonymous questions on the board) also stays off put-downs and swearing.
const putDown = /\b(stupid|dumb|idiot\w*|moron\w*|loser\w*|ugly|shut up|i hate (you|u)|you suck|sucks|f+u+c+k\w*|sh[i1]t\w*|b[i1]tch\w*|a+ss+(hole)?s?|damn\w*|wtf|stfu|crap\w*|piss\w*)\b/i;
export function screenBoardText(message:string):SafetyResult {
  const s = screenMessage(message);
  if (s.action !== "allow") return s;
  if (putDown.test(message)) return {action:"redirect",flag:"off_topic",message:"Ask about the story in words the whole class can see."};
  return {action:"allow"};
}
export function screenMessage(message:string):SafetyResult {
  if (danger.test(message)) return {action:"support",flag:/hurt myself|kill myself|self[- ]?harm|suicid/i.test(message)?"self_harm":"abuse_or_danger",message:"I’m stepping out of the story. You deserve support. Please tell your teacher or another trusted adult right now. If anyone is in immediate danger, get help from an adult nearby."};
  if(personal.test(message)) return {action:"redirect",flag:"personal_info",message:"I can’t share or ask for private information. Let’s stay with what the story tells us."};
  if(romance.test(message)) return {action:"redirect",flag:"sexual_or_romantic",message:"I can’t take part in romantic or sexual conversation. We can return to the story."};
  if(message.length>1000) return {action:"redirect",message:"Try a shorter question about the scene or the text."};
  return {action:"allow"};
}
