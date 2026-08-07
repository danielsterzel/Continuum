"use client";

import { motion } from "motion/react";

const line = {
  rest: {
    pathLength: 0,
    strokeWidth: 2,
  },
  hover: {
    pathLength: 1,
    strokeWidth: 2.5,
    transition: {
      duration: 0.25,
      ease: "easeOut",
    },
  },
};

const arrow = {
  rest: {
    x: 0,
    strokeWidth: 2,
  },
  hover: {
    x: 1,
    strokeWidth: 2.5,
    transition: {
      duration: 0.25,
      ease: "easeOut",
    },
  },
};

export function LineArrow() {
  return (
    <motion.svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <motion.path
        variants={line}
        d="M16 12H4"
        stroke="currentColor"
        strokeLinecap="round"
      />

      <motion.path
        variants={arrow}
        d="M11 7L16 12L11 17"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </motion.svg>
  );
}