import cn from "~/utils/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-white dark:bg-gray-900",
        "border border-gray-200 dark:border-gray-700",
        "shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className }: CardProps) {
  return (
    <div className={cn("px-6 py-4 border-b border-gray-200 dark:border-gray-700", className)}>
      {children}
    </div>
  );
};

Card.Body = function CardBody({ children, className }: CardProps) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
};

Card.Title = function CardTitle({ children, className }: CardProps) {
  return (
    <h3 className={cn("text-sm font-medium text-gray-900 dark:text-white", className)}>
      {children}
    </h3>
  );
};
