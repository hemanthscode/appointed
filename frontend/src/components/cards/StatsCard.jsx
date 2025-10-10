import React from "react";
import { motion } from "framer-motion";
import Card from "../ui/Card";
import { ANIMATIONS } from "../../utils";

const StatsCard = ({ label, value, icon: Icon, color = "text-white", index = 0 }) => (
  <motion.div
    initial={ANIMATIONS.fadeInUp.initial}
    animate={ANIMATIONS.fadeInUp.animate}
    transition={{ ...ANIMATIONS.fadeInUp.transition, delay: index * 0.1 }}
  >
    <Card hoverable>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
        </div>
        {Icon && <Icon className="h-8 w-8 text-gray-400" />}
      </div>
    </Card>
  </motion.div>
);

export default StatsCard;
