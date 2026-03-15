import cn from "~/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md";
  children: React.ReactNode;
}

const variantMap: Record<ButtonVariant, string> = {
  primary: "bg-blue-500 text-white hover:bg-blue-600 dark:hover:bg-blue-400",
  secondary:
    "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700",
  ghost: "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
  danger: "bg-red-500 text-white hover:bg-red-600",
};

const sizeMap: Record<"sm" | "md", string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 rounded-md font-medium transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-blue-500/40",
        variantMap[variant],
        sizeMap[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
