const BLOCKED_KEYWORDS = [
  "suicide",
  "self-harm",
  "kill myself",
  "hurt myself",
  "murder",
  "bomb",
  "weapon",
  "assault",
  "violence",
  "fraud",
  "steal",
  "drug trafficking",
  "hack account",
  "money laundering"
];

export function hasForbiddenContent(value: string): boolean {
  const text = value.toLowerCase();
  return BLOCKED_KEYWORDS.some((keyword) => text.includes(keyword));
}

export const FORBIDDEN_MESSAGE =
  "This post cannot be published. Please avoid content related to self-harm, violence, or illegal activity.";
