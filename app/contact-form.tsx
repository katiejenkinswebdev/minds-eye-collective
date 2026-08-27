"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";
import styles from "./contact-form.module.css";

type Status = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          company: String(data.get("company") ?? ""),
          outcome: String(data.get("outcome") ?? ""),
          website: String(data.get("website") ?? ""),
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.ok) {
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className={styles.success}>
        <svg viewBox="0 0 120 120" width="48" height="48" aria-hidden="true">
          <circle cx="60" cy="60" r="44" fill="#A99CFF" />
          <circle cx="60" cy="60" r="16" fill="#0E0C24" />
        </svg>
        <p className={styles.successText}>
          {"Got it. I'll be in touch within one business day."}
        </p>
      </div>
    );
  }

  const sending = status === "sending";

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate={false}>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="name">
            Name
          </label>
          <input
            className={styles.input}
            id="name"
            name="name"
            type="text"
            required
            maxLength={100}
            autoComplete="name"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">
            Email
          </label>
          <input
            className={styles.input}
            id="email"
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="company">
          Company
        </label>
        <input
          className={styles.input}
          id="company"
          name="company"
          type="text"
          maxLength={100}
          autoComplete="organization"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="outcome">
          What outcome are you after?
        </label>
        <textarea
          className={`${styles.input} ${styles.textarea}`}
          id="outcome"
          name="outcome"
          rows={4}
          required
          maxLength={2000}
        />
      </div>

      {/* Honeypot. Off-screen rather than display:none, which some bots skip. */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {status === "error" && (
        <p role="alert" className={styles.error}>
          Something went wrong sending your message. Please try again, or email{" "}
          {SITE.contactEmail} directly.
        </p>
      )}

      <button className={styles.submit} type="submit" disabled={sending}>
        {sending ? "Sending…" : "Get in Touch"}
      </button>
    </form>
  );
}
