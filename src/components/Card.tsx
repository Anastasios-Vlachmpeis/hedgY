import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`glass rounded-2xl p-4 ${onClick ? "glass-hover cursor-pointer text-left" : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}
