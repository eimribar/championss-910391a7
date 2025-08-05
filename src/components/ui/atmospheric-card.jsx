import React from "react";
import { cn } from "@/lib/utils";

const AtmosphericCard = React.forwardRef(({ className, children, variant = "default", ...props }, ref) => {
  const variants = {
    default: "atmospheric-card",
    gradient: "atmospheric-card bg-gradient-to-br from-slate-900/50 to-slate-800/30",
    glow: "atmospheric-card shadow-2xl shadow-blue-500/10",
    premium: "atmospheric-card bg-gradient-to-br from-blue-900/20 via-slate-900/50 to-purple-900/20 border-blue-500/20"
  };

  return (
    <div
      ref={ref}
      className={cn(
        "relative rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-1",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

AtmosphericCard.displayName = "AtmosphericCard";

const AtmosphericCardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 relative", className)}
    {...props}
  />
));

AtmosphericCardHeader.displayName = "AtmosphericCardHeader";

const AtmosphericCardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-semibold leading-none tracking-tight text-white", className)}
    {...props}
  />
));

AtmosphericCardTitle.displayName = "AtmosphericCardTitle";

const AtmosphericCardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));

AtmosphericCardContent.displayName = "AtmosphericCardContent";

export { AtmosphericCard, AtmosphericCardHeader, AtmosphericCardTitle, AtmosphericCardContent };