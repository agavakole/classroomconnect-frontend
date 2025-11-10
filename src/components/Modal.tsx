// src/components/Modal.tsx
import { useEffect } from "react";
import type { ReactNode } from "react";

/**
 * Component props
 */
interface ModalProps {
  isOpen: boolean;          // Controls modal visibility
  onClose: () => void;      // Handler for closing modal
  title: string;            // Modal header title
  children: ReactNode;      // Modal body content
  size?: "sm" | "md" | "lg" | "xl" | "full"; // Size variant
}

/**
 * Reusable modal/dialog component
 * 
 * Features:
 * - Backdrop with blur effect
 * - Close on Escape key
 * - Prevent body scroll when open
 * - Flexible sizing options
 * - Smooth animations
 * 
 * Used for:
 * - Survey details (TeacherSurveyDetail)
 * - Activity details (TeacherActivityDetail)
 * - Course details (TeacherCourseDetail)
 * - Create forms (CreateSurveyModal, CreateActivityModal, CreateCourseModal)
 * 
 * Modal routing pattern:
 * - Renders over "background" route
 * - Clicking backdrop or close button returns to background
 * - See main.tsx for modal routing implementation
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "lg",
}: ModalProps) {
  /**
   * Keyboard and scroll management
   * 
   * Effects:
   * - ESC key closes modal
   * - Body scroll disabled when modal open
   * - Cleanup on unmount
   */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      // Add keyboard listener
      document.addEventListener("keydown", handleEscape);
      
      // Prevent background scroll
      document.body.style.overflow = "hidden";
    }

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset"; // Restore scroll
    };
  }, [isOpen, onClose]);

  // Don't render anything if closed
  if (!isOpen) return null;

  /**
   * Size classes for modal width
   * Responsive: grows with screen size, max-width controlled
   */
  const sizeClasses = {
    sm: "max-w-md",    // Small: ~448px
    md: "max-w-2xl",   // Medium: ~672px
    lg: "max-w-4xl",   // Large: ~896px (default)
    xl: "max-w-6xl",   // Extra large: ~1152px
    full: "max-w-7xl", // Full: ~1280px
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - click to close */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal container */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden flex flex-col`}
      >
        {/* Header - fixed at top */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          {/* Close button */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Content - scrollable if needed */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}