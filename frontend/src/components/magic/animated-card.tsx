import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function AnimatedCard({
  children,
  className,
  delay = 0,
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 },
        boxShadow: "0 25px 50px -12px hsl(var(--primary) / 0.25)"
      }}
      className={cn(
        "bg-card rounded-3xl shadow-xl overflow-hidden",
        "border border-border/50",
        "text-foreground",
        "backdrop-blur-sm",
        "hover:border-primary/30 transition-all duration-300",
        className
      )}
    >
      {/* 顶部光晕效果 */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {children}
    </motion.div>
  )
}
