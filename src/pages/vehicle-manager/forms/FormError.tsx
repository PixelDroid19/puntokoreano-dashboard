import { AlertCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface FormErrorProps {
  title: string;
  description: string;
  errors?: string[];
}

export default function FormError({ title, description, errors }: FormErrorProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25 }}
        className="relative mb-4 flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 p-4 shadow-lg"
        role="alert"
        aria-live="assertive"
      >
        <div className="flex-shrink-0">
          <AlertCircle className="h-7 w-7 text-red-500" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-red-700 text-base mb-1">{title}</div>
          <div className="text-red-600 text-sm leading-relaxed">{description}</div>
          {errors && errors.length > 0 && (
            <ul className="mt-2 list-disc list-inside text-red-500 text-xs space-y-1">
              {errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
} 