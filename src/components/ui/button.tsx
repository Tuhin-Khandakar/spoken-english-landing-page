
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    icon?: LucideIcon;
    glow?: boolean;
}

export const Button = ({
    children,
    className,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    glow = false,
    ...props
}: ButtonProps) => {
    const variants = {
        primary: "bg-primary text-white hover:bg-primary/90",
        secondary: "bg-white/5 text-white hover:bg-white/10",
        outline: "bg-transparent border border-white/10 text-white hover:bg-white/5",
        ghost: "bg-transparent text-white/70 hover:text-white"
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3",
        lg: "px-8 py-4 text-lg"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "rounded-full font-semibold transition-all flex items-center justify-center gap-2",
                variants[variant],
                sizes[size],
                glow && "glow-button",
                className
            )}
            {...(props as any)}
        >
            {children}
            {Icon && <Icon className="size-5" />}
        </motion.button>
    );
};
