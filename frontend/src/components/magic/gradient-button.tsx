import React from "react"
import { cn } from "@/lib/utils"

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  gradient?: string
}

export function GradientButton({
  children,
  className,
  gradient = "from-blue-500 via-purple-500 to-pink-500",
  ...props
}: GradientButtonProps) {
  return (
    <button
      className={cn(
        "relative px-6 py-3 rounded-lg font-medium text-white overflow-hidden",
        "transition-all duration-300 ease-out",
        "hover:scale-105 hover:shadow-lg",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "absolute inset-0 bg-gradient-to-r",
          gradient
        )}
      />
      <span className="relative flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  )
}
