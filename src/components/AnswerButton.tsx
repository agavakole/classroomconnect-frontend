import type { AnswerButtonProps } from "../types";

export function AnswerButton({
  value,
  text,
  emoji,
  color,
  textColor,
  onClick,
  isSelected,
  ringColor = "ring-gray-400",
}: AnswerButtonProps) {
  console.log("🔵 AnswerButton rendering. Value:", value, "Text:", text);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        console.log("🟢 Button CLICKED! Value:", value);
        onClick(value);
      }}
      className={`
        ${color} ${textColor}
        rounded-2xl
        h-28 sm:h-36 w-full
        p-4
        flex flex-col items-center justify-center gap-2
        text-base sm:text-lg font-semibold
        shadow-[0_8px_20px_rgba(0,0,0,0.08)]
        hover:shadow-[0_12px_28px_rgba(0,0,0,0.10)]
        transition-all duration-200
        hover:scale-[1.02] active:scale-[0.98]
        ${isSelected ? `ring-4 ${ringColor}` : ""}
      `}
    >
      <span className="text-3xl sm:text-4xl drop-shadow-sm">{emoji}</span>
      <span className="leading-none">{text}</span>
    </button>
  );
}
