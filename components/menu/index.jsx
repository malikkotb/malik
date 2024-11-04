"use client";
import { motion } from "framer-motion";
import styles from "./style.module.scss";
import ListElement from "../HoverProject/link";

const menu = [
  {
    title: "Projects",
  },
  {
    title: "About",
  },
  {
    title: "Contact",
  },
];

export default function index() {
  return (
    <motion.div className={styles.menu}>
      <div className={styles.body}>
        {menu.map((el, index) => {
          return <ListElement data={el} index={index} key={index} />;
        })}
      </div>
    </motion.div>
  );
}
