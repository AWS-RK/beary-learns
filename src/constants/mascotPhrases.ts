export const ENCOURAGEMENT_WRONG = [
  "Hmm, let's try again!",
  "Almost! You can do it!",
  "Beary believes in you! Try once more.",
  "That's okay, let's look together.",
  "So close! Give it another shot!",
  "Keep trying — you're doing great!",
];

export const ENCOURAGEMENT_CORRECT = [
  "Amazing job! You're so smart!",
  "WOW! You got it right!",
  "YES! Beary is so proud of you!",
  "Fantastic! Keep it up!",
  "You're a superstar!",
  "That was perfect!",
  "Beary loves how hard you're trying!",
];

export const HINT_OFFER = [
  "Want Beary to help you with a hint?",
  "Should we look at this together?",
  "Beary has a hint that might help!",
];

export const GREETINGS = (name?: string) => [
  `Hello${name ? `, ${name}` : ', superstar'}! Ready to learn today?`,
  `Hi${name ? ` ${name}` : ' there'}! Beary is so happy to see you!`,
  `Welcome back${name ? `, ${name}` : ''}! Let's have some fun learning!`,
];

export const SUBJECT_INTROS = {
  counting: "Let's count together! How many do you see?",
  addition: "Time for adding! Let's put numbers together!",
  subtraction: "Let's take some away! Ready?",
  pronunciation: "Let's practice saying words! Listen carefully!",
};

export const DIFFICULTY_ENCOURAGEMENT = {
  easy: "Great choice! Let's start easy and have fun!",
  medium: "Ooh, medium level! You're getting brave!",
  hard: "HARD mode?! WOW, you are SO brave!",
};

export const LEVEL_UP_SUGGESTION =
  "You're getting so good! Want to try a harder level?";

export const SESSION_COMPLETE = (stars: number) =>
  stars >= 8
    ? `AMAZING! You earned ${stars} stars! Beary is SO proud!`
    : stars >= 5
    ? `Great job! You earned ${stars} stars! Keep it up!`
    : `You earned ${stars} stars! Practice makes perfect!`;

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
