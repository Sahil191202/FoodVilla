import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import { Home, ArrowLeft } from "lucide-react";
import BackButton from "../components/common/BackButton.jsx";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        {/* Animated 404 */}
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-9xl mb-6 select-none"
        >
          🍽️
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-6xl font-bold text-gray-900 mb-3"
        >
          404
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl font-semibold text-gray-700 mb-2"
        >
          Table Not Found!
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-500 mb-8"
        >
          Looks like this page ran out of stock. Let's get you back to something
          delicious!
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-3"
        >
          <div className="flex items-center justify-center gap-3 mt-6">
            <BackButton to="back" label="Go Back" />
            <BackButton to="home" label="Go Home" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
