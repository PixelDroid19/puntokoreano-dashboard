import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface FormSuccessProps {
  title: string;
  description?: string;
}

const FormSuccess: React.FC<FormSuccessProps> = ({ title, description }) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center justify-center py-12"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.1,
        }}
        className="bg-green-100 text-green-600 rounded-full p-4 mb-4"
      >
        <Check className="w-12 h-12" />
      </motion.div>
      <h3 className="text-xl font-medium text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-500">{description}</p>}
    </motion.div>
  );
};

export default FormSuccess;
