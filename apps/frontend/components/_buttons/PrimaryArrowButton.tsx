"use client";

import { motion } from "motion/react";
import { LineArrow } from "../_svg/LineArrow";

type PrimaryButtonProps = {
    children: React.ReactNode,
    styling: string;
    onClick: () => void;
}

const arrowLine = {
    rest: {pathLength: 0},
    hover: {pathLength: 1}
}

const arrowHead = {
    rest: {x: -20},
    hover: {x: 0}
}


export function PrimaryArrowButton({children, styling, onClick} : Readonly<PrimaryButtonProps>)
{
    return(
        <motion.button
        onClick={onClick}
        initial="rest"
        whileHover="hover"
        className={`flex gap-1 items-center cursor-pointer ${styling}`}>
        
            <LineArrow />
            {children}
        </motion.button>
    );

}