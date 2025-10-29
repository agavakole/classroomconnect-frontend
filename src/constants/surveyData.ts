import type { Question, AnswerOption } from '../types';

// Answer options with their values and styling
export const ANSWER_OPTIONS: AnswerOption[] = [
  {
    value: 5,
    text: "Yes! All the time!",
    emoji: "👍",
    color: "bg-gradient-to-br from-yellow-300 to-orange-400",
    textColor: "text-white",
    ringColor: "ring-amber-400",
  },
  {
    value: 4,
    text: "Yes, sometimes!",
    emoji: "💙",
    color: "bg-gradient-to-br from-purple-300 to-indigo-400",
    textColor: "text-white",
    ringColor: "ring-purple-400",
  },
  {
    value: 3,
    text: "Not sure!",
    emoji: "🤷",
    color: "bg-gradient-to-br from-emerald-300 to-teal-400",
    textColor: "text-white",
    ringColor: "ring-emerald-400",
  },
  {
    value: 2,
    text: "Not really!",
    emoji: "✋",
    color: "bg-gradient-to-br from-cyan-300 to-sky-400",
    textColor: "text-white",
    ringColor: "ring-cyan-400",
  },
];

// Our 8 survey questions
export const SURVEY_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "I like to jump and move around when I'm learning!",
    emoji: "🤸",
    options: ANSWER_OPTIONS,
  },
  {
    id: 2,
    text: "I learn better when I see pictures and colors!",
    emoji: "🎨",
    options: ANSWER_OPTIONS,
  },
  {
    id: 3,
    text: "I like quiet places where I can think!",
    emoji: "🤫",
    options: ANSWER_OPTIONS,
  },
  {
    id: 4,
    text: "I need breaks when I'm doing something for a long time!",
    emoji: "⏰",
    options: ANSWER_OPTIONS,
  },
  {
    id: 5,
    text: "I like to build things and use my hands!",
    emoji: "🔨",
    options: ANSWER_OPTIONS,
  },
  {
    id: 6,
    text: "I like when things happen in the same order every day!",
    emoji: "📅",
    options: ANSWER_OPTIONS,
  },
  {
    id: 7,
    text: "Music and sounds help me learn!",
    emoji: "🎵",
    options: ANSWER_OPTIONS,
  },
  {
    id: 8,
    text: "I like working on my own more than with other kids!",
    emoji: "🧑",
    options: ANSWER_OPTIONS,
  },
];