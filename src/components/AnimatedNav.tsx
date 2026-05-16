"use client";

import * as React from "react";
import { motion, useScroll, useMotionValueEvent, type Variants } from "framer-motion";
import { Menu, Rocket } from "lucide-react";

const navItems = [
  { name: "Inicio", href: "#hero" },
  { name: "Teoría", href: "#teoria" },
  { name: "Sin Déficit", href: "#sin-deficit" },
  { name: "Con Déficit", href: "#con-deficit" },
  { name: "IA Demo",     href: "#ai-demo" },
  { name: "Comparativo", href: "#comparativo" },
  { name: "Equipo", href: "#equipo" },
];

const EXPAND_THRESHOLD = 80;

const containerVariants: Variants = {
  expanded: {
    width: "auto",
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
  collapsed: {
    width: "3rem",
    transition: { when: "afterChildren", staggerChildren: 0.04, staggerDirection: -1 },
  },
};

const logoVariants: Variants = {
  expanded: { opacity: 1, x: 0 },
  collapsed: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

const itemVariants: Variants = {
  expanded: { opacity: 1, x: 0 },
  collapsed: { opacity: 0, x: -15, transition: { duration: 0.15 } },
};

const iconVariants: Variants = {
  expanded: { opacity: 0, scale: 0.8, transition: { duration: 0.15 } },
  collapsed: { opacity: 1, scale: 1, transition: { delay: 0.1 } },
};

export function AnimatedNav() {
  const [isExpanded, setExpanded] = React.useState(true);
  const { scrollY } = useScroll();
  const lastScrollY = React.useRef(0);
  const collapsePos = React.useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = lastScrollY.current;
    if (isExpanded && latest > prev && latest > 150) {
      setExpanded(false);
      collapsePos.current = latest;
    } else if (!isExpanded && latest < prev && (collapsePos.current - latest > EXPAND_THRESHOLD)) {
      setExpanded(true);
    }
    lastScrollY.current = latest;
  });

  const handleClick = (e: React.MouseEvent) => {
    if (!isExpanded) {
      e.preventDefault();
      setExpanded(true);
    }
  };

  return (
    <div className="fixed top-[54px] left-1/2 -translate-x-1/2 z-50">
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={isExpanded ? "expanded" : "collapsed"}
        variants={containerVariants}
        whileHover={!isExpanded ? { scale: 1.08 } : {}}
        whileTap={!isExpanded ? { scale: 0.95 } : {}}
        onClick={handleClick}
        style={{
          background: "rgba(26,8,0,0.92)",
          border: "1px solid rgba(255,240,220,0.2)",
          backdropFilter: "blur(12px)",
          color: "#FFF0DC",
        }}
        className={`flex items-center overflow-hidden rounded-full shadow-2xl h-11 ${!isExpanded ? "cursor-pointer justify-center" : ""}`}
      >
        {/* Logo / brand */}
        <motion.div
          variants={logoVariants}
          className="flex-shrink-0 flex items-center gap-2 pl-4 pr-2"
        >
          <Rocket size={14} style={{ color: "#C4522A" }} />
          <span className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: "#FFF0DC" }}>
            NexTech
          </span>
        </motion.div>

        {/* Divider */}
        <motion.div
          variants={logoVariants}
          className="w-px h-4 mx-1 flex-shrink-0"
          style={{ background: "rgba(255,240,220,0.2)" }}
        />

        {/* Nav items */}
        <motion.div className={`flex items-center gap-0 pr-3 ${!isExpanded ? "pointer-events-none" : ""}`}>
          {navItems.map((item) => (
            <motion.a
              key={item.name}
              href={item.href}
              variants={itemVariants}
              onClick={(e) => e.stopPropagation()}
              className="text-[11px] tracking-[0.08em] uppercase px-3 py-1 rounded-full transition-colors"
              style={{ color: "rgba(255,240,220,0.7)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#FFF0DC"; (e.currentTarget as HTMLAnchorElement).style.background = "rgba(196,82,42,0.25)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,240,220,0.7)"; (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
            >
              {item.name}
            </motion.a>
          ))}
        </motion.div>

        {/* Collapsed icon */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div variants={iconVariants} animate={isExpanded ? "expanded" : "collapsed"}>
            <Menu size={16} style={{ color: "#FFF0DC" }} />
          </motion.div>
        </div>
      </motion.nav>
    </div>
  );
}
