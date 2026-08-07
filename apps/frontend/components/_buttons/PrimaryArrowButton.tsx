"use client";

import { motion } from "motion/react";
import { LineArrow } from "../_svg/LineArrow";

type PrimaryButtonProps = {
    children: React.ReactNode
}

const arrowLine = {
    rest: {pathLength: 0},
    hover: {pathLength: 1}
}

const arrowHead = {
    rest: {x: -20},
    hover: {x: 0}
}


export function PrimaryArrowButton({children} : Readonly<PrimaryButtonProps>)
{
    return(
        <motion.button
        initial="rest"
        whileHover="hover"
        className="flex gap-1 items-center rounded-lg cursor-pointer">
        
            <LineArrow />
            {children}
        </motion.button>
    );

}