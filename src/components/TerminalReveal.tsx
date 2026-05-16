"use client";

import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

/* ─── Char-by-char typewriter ────────────────────────────────── */
export function TerminalText({
  children,
  tag = "span",
  speed = 20,
  delay = 0,
  className,
  style,
}: {
  children: string;
  tag?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  speed?: number;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const t = setTimeout(() => {
      const iv = setInterval(() => {
        i += 2;
        setDisplayed(children.slice(0, i));
        if (i >= children.length) { clearInterval(iv); setDone(true); }
      }, speed);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(t);
  }, [inView, children, speed, delay]);

  const Tag = tag as any;
  return (
    <Tag ref={ref} className={className} style={style}>
      {displayed || " "}
      {!done && <span className="terminal-cursor">▌</span>}
    </Tag>
  );
}

/* ─── Word-chunk reveal for paragraphs ───────────────────────── */
export function TerminalParagraph({
  children,
  chunkSize = 4,
  interval = 45,
  delay = 0,
  className,
  style,
}: {
  children: string;
  chunkSize?: number;
  interval?: number;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const words = children.split(" ");

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const t = setTimeout(() => {
      const iv = setInterval(() => {
        i = Math.min(i + chunkSize, words.length);
        setCount(i);
        if (i >= words.length) { clearInterval(iv); setDone(true); }
      }, interval);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(t);
  }, [inView, children, chunkSize, interval, delay]);

  return (
    <p ref={ref} className={className} style={style}>
      {words.slice(0, count).join(" ")}
      {!done && count > 0 && <span className="terminal-cursor">▌</span>}
    </p>
  );
}
