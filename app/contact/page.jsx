"use client";
import { useState, useRef, useEffect } from "react";
import emailjs from "@emailjs/browser";
import gsap from "gsap";
import { applyBtnHover } from "@/lib/btnHover";

// ─── EmailJS config ────────────────────────────────────────────────────
// 1. Go to https://emailjs.com → Email Services → copy your Service ID
// 2. Go to Email Templates → copy your Template ID
// 3. Go to Account → API Keys → copy your Public Key
// Template variables expected: {{from_name}}, {{from_email}}, {{message}}
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
// ───────────────────────────────────────────────────────────────────────

const INTROS = [
  "Tell me what you\u2019re building.",
  "Every great project starts with a message.",
  "What are we making together?",
  "Let\u2019s turn your idea into something worth seeing.",
  "Great things start with a conversation.",
  "Let\u2019s build something you\u2019re proud of.",
];

function Chars({ text }) {
  const words = text.split(" ");
  return words.map((word, wi) => (
    <span key={wi} className="inline-block" style={{ whiteSpace: "nowrap" }}>
      {word.split("").map((char, ci) => (
        <span key={ci} className="char inline-block" style={{ opacity: 0 }}>{char}</span>
      ))}
      {wi < words.length - 1 && <span className="char inline-block" style={{ opacity: 0 }}>&nbsp;</span>}
    </span>
  ));
}

export default function ContactPage() {
  const [intro] = useState(() => INTROS[Math.floor(Math.random() * INTROS.length)]);
  const [status, setStatus] = useState({ msg: "", type: "" });
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef(null);
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const btnRef = useRef(null);
  const btnRowRef = useRef(null);

  useEffect(() => applyBtnHover(btnRowRef.current), []);

  // Lock body scroll while this page is mounted
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Animate in — same pattern as IndexClient hero heading
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const chars = form.querySelectorAll(".char");
    const inputs = [nameRef.current, emailRef.current, form.querySelector("textarea")];
    const btn = btnRef.current;
    const targets = [...chars, ...inputs.filter(Boolean), btn].filter(Boolean);

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap.set(targets, { y: prefersReduced ? "0%" : "-60%", opacity: 0 });
    gsap.to(targets, {
      y: "0%",
      opacity: 1,
      duration: prefersReduced ? 0 : 0.7,
      ease: "power3.out",
      stagger: prefersReduced ? 0 : 0.5 / targets.length,
    });
  }, []);

  function sizeInput(input) {
    if (!input) return;
    const mirror = document.createElement("span");
    mirror.setAttribute("aria-hidden", "true");
    const cs = getComputedStyle(input);
    mirror.style.cssText =
      `position:absolute;visibility:hidden;white-space:pre;pointer-events:none;` +
      `font:${cs.font};letter-spacing:${cs.letterSpacing};padding:${cs.padding};`;
    document.body.appendChild(mirror);
    mirror.textContent = input.value || input.placeholder;
    input.style.width = mirror.offsetWidth + "px";
    document.body.removeChild(mirror);
  }

  useEffect(() => {
    sizeInput(nameRef.current);
    sizeInput(emailRef.current);
    const handleResize = () => {
      sizeInput(nameRef.current);
      sizeInput(emailRef.current);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  async function doSubmit(form) {
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setSubmitting(true);
    setStatus({ msg: "Sending\u2026", type: "" });
    try {
      await emailjs.sendForm(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        form,
        { publicKey: EMAILJS_PUBLIC_KEY }
      );
      setStatus({ msg: "Message sent \u2014 thank you.", type: "success" });
      form.reset();
      sizeInput(nameRef.current);
      sizeInput(emailRef.current);
    } catch {
      setStatus({ msg: "Something went wrong. Please try again.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    doSubmit(e.target);
  }

  // Cmd+Enter / Ctrl+Enter submits from the textarea
  function handleTextareaKeyDown(e) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      doSubmit(formRef.current);
    }
  }

  return (
    <section className="h-screen overflow-hidden flex flex-col justify-start pt-40 px-[4vw]">
      <form ref={formRef} noValidate onSubmit={handleSubmit} className="leading-[1.15] lg:max-w-[80vw]">

        <p className="hero-heading !text-[#1A1A1A] overflow-hidden">
          <Chars text={intro} />
        </p>

        <p className="hero-heading !text-[#1A1A1A] mt-[0.6em] overflow-hidden">
          <Chars text="My name is " />
          <input
            ref={nameRef}
            type="text"
            name="from_name"
            placeholder="your name"
            autoComplete="name"
            required
            onChange={(e) => sizeInput(e.target)}
            className="contact-input"
            style={{ opacity: 0 }}
          />
          <Chars text=" and you can reach me at " />
          <input
            ref={emailRef}
            type="email"
            name="from_email"
            placeholder="your email"
            autoComplete="email"
            required
            onChange={(e) => sizeInput(e.target)}
            className="contact-input"
            style={{ opacity: 0 }}
          />
          <Chars text={". I\u2019d like to explore working together and see where this leads."} />
        </p>

        <p className="hero-heading !text-[#1A1A1A] mt-[0.6em]">
          <textarea
            name="message"
            placeholder="Your message"
            rows={3}
            required
            onKeyDown={handleTextareaKeyDown}
            className="contact-input contact-textarea"
            style={{ opacity: 0 }}
          />
        </p>

        {/* Reserve fixed height so status never causes layout shift */}
        <div ref={btnRowRef} className="mt-[1em] flex items-center gap-[2em] overflow-hidden">
          <button
            ref={btnRef}
            type="submit"
            disabled={submitting}
            className="header-btn min-h-[44px] disabled:opacity-50 disabled:pointer-events-none"
            style={{ opacity: 0 }}
          >
            <span className="btn-text">Send message →</span>
          </button>
          <span
            aria-live="polite"
            className={`header-footer-text transition-opacity duration-300 ${
              status.msg ? "opacity-100" : "opacity-0 pointer-events-none"
            } ${status.type === "error" ? "text-red-600" : "text-[#1A1A1A]"}`}
          >
            {status.msg || "\u00A0"}
          </span>
        </div>
      </form>

      <style jsx>{`
        .contact-input {
          font-size: inherit;
          line-height: inherit;
          font-family: inherit;
          letter-spacing: inherit;
          background: transparent;
          border: none;
          border-bottom: 1.5px dashed #1A1A1A;
          outline: none;
          color: #1A1A1A;
          padding: 0 0.15em 0.05em;
        }
        .contact-input::placeholder {
          color: rgba(0, 0, 0, 0.3);
        }
        .contact-input:focus {
          border-bottom-style: solid;
          border-bottom-color: #1A1A1A;
        }
        .contact-input:focus-visible {
          border-bottom-style: solid;
          border-bottom-width: 2px;
        }
        .contact-textarea {
          display: block;
          width: 100%;
          resize: none;
          border-bottom: 1.5px dashed #1A1A1A;
          padding-left: 0;
          padding-right: 0;
          padding-bottom: 0.1em;
        }
        .contact-textarea:focus {
          border-bottom-style: solid;
        }
      `}</style>
    </section>
  );
}
