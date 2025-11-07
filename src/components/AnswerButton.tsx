// src/components/AnswerButton.tsx
import type { AnswerButtonProps } from "../types";

export function AnswerButton({
  value,
  text,
  emoji,
  color,
  textColor,
  onClick,
  isSelected,
  ringColor = "ring-white",
}: AnswerButtonProps) {
  // detect gradient input: e.g. "from-[#FFB457] to-[#FF8A00]"
  const hasGradient =
    typeof color === "string" &&
    (color.includes("from-") || color.includes("to-"));

  const isImage =
    typeof emoji === "string" &&
    (emoji.startsWith("/") ||
      emoji.startsWith("http") ||
      /\.(png|jpe?g|gif|svg|webp)$/i.test(emoji));

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        onClick(value);
      }}
      className={[
        // size & shape -> square tile
        "w-full aspect-square min-h-[120px] sm:min-h-[140px]",
        "rounded-[24px] p-4 sm:p-5 text-left",
        // color / gradient
        color,
        hasGradient ? "bg-gradient-to-br" : "",
        textColor,
        // effects
        "shadow-[0_10px_24px_rgba(0,0,0,0.10)] hover:shadow-[0_14px_30px_rgba(0,0,0,0.14)]",
        "transition-all duration-200 hover:translate-y-[−1px] active:scale-[0.99]",
        // selection ring
        isSelected ? `ring-4 ${ringColor}` : "ring-0",
        // layout
        "flex flex-col justify-center items-start gap-3",
      ].join(" ")}
    >
      {/* icon box */}
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={emoji as string}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-3xl sm:text-4xl drop-shadow-sm">
            {emoji || "✨"}
          </span>
        )}
      </div>

      {/* label */}
      <div className="font-semibold text-base sm:text-lg leading-snug drop-shadow">
        {text}
      </div>

      {/* selected badge */}
      {isSelected && (
        <div className="absolute top-3 right-3 bg-white/90 text-green-600 text-xs font-bold px-2 py-1 rounded-lg">
          Selected
        </div>
      )}
    </button>
  );
}
