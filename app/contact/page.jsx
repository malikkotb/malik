"use client";
import { useState, useRef, useEffect } from "react";
import emailjs from "@emailjs/browser";

// ─── EmailJS config ────────────────────────────────────────────────────
// 1. Go to https://emailjs.com → Email Services → copy your Service ID
// 2. Go to Email Templates → copy your Template ID
// 3. Go to Account → API Keys → copy your Public Key
// Template variables expected: {{from_name}}, {{from_email}}, {{message}}
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
// ───────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [status, setStatus] = useState({ msg: "", type: "" });
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef(null);
  const nameRef = useRef(null);
  const emailRef = useRef(null);

  // Lock body scroll while this page is mounted
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!e.target.checkValidity()) {
      e.target.reportValidity();
      return;
    }
    setSubmitting(true);
    setStatus({ msg: "Sending…", type: "" });
    try {
      await emailjs.sendForm(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        formRef.current,
        { publicKey: EMAILJS_PUBLIC_KEY }
      );
      setStatus({ msg: "Message sent — thank you.", type: "success" });
      e.target.reset();
      sizeInput(nameRef.current);
      sizeInput(emailRef.current);
    } catch {
      setStatus({ msg: "Something went wrong. Please try again.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="h-screen overflow-hidden flex flex-col justify-center">
      <form ref={formRef} noValidate onSubmit={handleSubmit} className="leading-[1.15] lg:max-w-[80vw]">

        <p className="hero-heading !text-black">
          Let's start a conversation that matters.
        </p>

        <p className="hero-heading !text-black mt-[0.6em]">
          My name is{" "}
          <input
            ref={nameRef}
            type="text"
            name="from_name"
            placeholder="your name"
            autoComplete="name"
            required
            onChange={(e) => sizeInput(e.target)}
            className="contact-input"
          />{" "}
          and you can reach me at{" "}
          <input
            ref={emailRef}
            type="email"
            name="from_email"
            placeholder="your email"
            autoComplete="email"
            required
            onChange={(e) => sizeInput(e.target)}
            className="contact-input"
          />
          . I'd like to explore working together and see where this leads.
        </p>

        <p className="hero-heading !text-black mt-[0.6em]">
          <textarea
            name="message"
            placeholder="Your message"
            rows={3}
            required
            className="contact-input contact-textarea"
          />
        </p>

        <div className="mt-[1em] flex items-baseline gap-[2em]">
          <button
            type="submit"
            disabled={submitting}
            className="header-btn disabled:opacity-50"
          >
            Send message →
          </button>
          {status.msg && (
            <span
              aria-live="polite"
              className={`header-footer-text ${status.type === "error" ? "text-red-600" : "text-black"
                }`}
            >
              {status.msg}
            </span>
          )}
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
          border-bottom: 1.5px dashed #000;
          outline: none;
          color: #000;
          padding: 0 0.15em 0.05em;
        }
        .contact-input::placeholder {
          color: rgba(0, 0, 0, 0.3);
        }
        .contact-input:focus {
          border-bottom-style: solid;
        }
        .contact-textarea {
          display: block;
          width: 100%;
          resize: none;
          border-bottom: 1.5px dashed #000;
          padding-bottom: 0.1em;
        }
        .contact-textarea:focus {
          border-bottom-style: solid;
        }
      `}</style>
    </section>
  );
}
