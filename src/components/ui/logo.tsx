
import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "light" | "dark"; 
}

const Logo = ({ 
  className, 
  showText = true, 
  size = "md", 
  color = "dark" 
}: LogoProps) => {
  const sizes = {
    sm: {
      icon: "h-5 w-5",
      text: "text-sm",
      container: "p-1.5",
    },
    md: {
      icon: "h-6 w-6", 
      text: "text-lg",
      container: "p-2",
    },
    lg: {
      icon: "h-8 w-8", 
      text: "text-2xl",
      container: "p-3",
    },
  };
  
  const colors = {
    light: {
      container: "bg-white/20",
      icon: "text-white",
      text: "text-white",
    },
    dark: {
      container: "bg-green-600",
      icon: "text-white",
      text: "text-green-800",
    },
  };
  
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className={cn(
        "rounded-full", 
        colors[color].container, 
        sizes[size].container
      )}>
        <Leaf className={cn(
          sizes[size].icon, 
          colors[color].icon
        )} />
      </div>
      {showText && (
        <span className={cn(
          "font-bold", 
          sizes[size].text, 
          colors[color].text
        )}>
          Green Finance
        </span>
      )}
    </div>
  );
};

export default Logo;
