import { motion, type HTMLMotionProps } from "framer-motion";

export function Button({
  className = "",
  children,
  ...props
}: HTMLMotionProps<"button">) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={`bg-brand hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg py-2.5 transition-colors ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
