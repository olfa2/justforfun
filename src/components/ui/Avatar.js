import { cn, getInitials, stringToColor } from "@/lib/utils";

const sizes = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
  xl: "h-16 w-16 text-lg",
};

// Initialen-basierter Avatar mit deterministischer Hintergrundfarbe.
export function Avatar({ name, size = "md", className }) {
  const initials = getInitials(name);
  const background = stringToColor(name);

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold text-white select-none shrink-0",
        sizes[size] || sizes.md,
        className
      )}
      style={{ backgroundColor: background }}
      title={name || ""}
    >
      {initials}
    </span>
  );
}
