"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import PublicHeader from "../../components/PublicHeader";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-black text-zinc-300">
      <PublicHeader />

      

      {/* Hero */}
      <section className="border-b border-zinc-900 bg-zinc-950/60">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 sm:py-20">
          <div className="mb-4 text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-400">
            JMI Contact
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Contact Us
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500">
            Have a question about JMI, a database correction, copyright
            concern, data clarification or general enquiry? Get in touch with
            the JMI team.
          </p>
        </div>
      </section>

      {/* Main */}
      <section>
        <div className="mx-auto grid max-w-5xl gap-10 px-5 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.8fr_1.2fr]">

          {/* Information */}
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-violet-500">
              Get in touch
            </div>

            <h2 className="mt-3 text-xl font-semibold tracking-tight text-white">
              How can we help?
            </h2>

            <p className="mt-4 text-[12px] leading-6 text-zinc-500 sm:text-[13px]">
              JMI welcomes genuine enquiries relating to its database,
              box-office information, film-industry data, copyright,
              corrections and the operation of the platform.
            </p>

            <div className="mt-8 space-y-3">
              <ContactTopic
                title="Data Corrections"
                description="Report potentially incorrect movie, box-office or industry information."
              />

              <ContactTopic
                title="Copyright & Content"
                description="Raise a copyright, attribution or content-related concern."
              />

              <ContactTopic
                title="General Enquiries"
                description="Questions about JMI, its database or its services."
              />

              <ContactTopic
                title="Business & Collaboration"
                description="For professional, research or industry-related enquiries."
              />
            </div>

            <div className="mt-8 border-t border-zinc-900 pt-6">
              <div className="text-[8px] font-semibold uppercase tracking-[0.18em] text-red-500">
                Before contacting us
              </div>

              <p className="mt-3 text-[11px] leading-5 text-zinc-400">
                For box-office corrections, please provide the movie name,
                relevant territory or figure and any supporting information
                that may help JMI review the matter.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="border border-zinc-900 bg-zinc-950/40 p-5 sm:p-7">
            <div className="mb-6">
              <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-400">
                Send an enquiry
              </div>

              <h2 className="mt-2 text-lg font-semibold text-white">
                Contact JMI
              </h2>
            </div>

            {submitted ? (
              <div className="border border-green-500/20 bg-green-500/5 p-5">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-green-400">
                  Message received
                </div>

                <p className="mt-3 text-[12px] leading-6 text-zinc-500">
                  Your message has been prepared successfully. The contact
                  form backend can be connected when JMI&apos;s production
                  communication system is configured.
                </p>

                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-5 text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-500 transition hover:text-white"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.16em] text-yellow-500"
                  >
                    Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Your name"
                    className="w-full border border-zinc-800 bg-black px-3 py-2.5 text-[12px] text-zinc-200 outline-none placeholder:text-zinc-700 focus:border-violet-500/50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.16em] text-yellow-500"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="w-full border border-zinc-800 bg-black px-3 py-2.5 text-[12px] text-zinc-200 outline-none placeholder:text-zinc-700 focus:border-violet-500/50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.16em] text-yellow-500"
                  >
                    Subject
                  </label>

                  <select
                    id="subject"
                    name="subject"
                    required
                    defaultValue=""
                    className="w-full border border-zinc-800 bg-black px-3 py-2.5 text-[12px] text-zinc-300 outline-none focus:border-violet-500/50"
                  >
                    <option value="" disabled>
                      Select a topic
                    </option>
                    <option value="data-correction">
                      Data Correction
                    </option>
                    <option value="box-office">
                      Box Office / Trade Data
                    </option>
                    <option value="copyright">
                      Copyright &amp; Content
                    </option>
                    <option value="business">
                      Business / Collaboration
                    </option>
                    <option value="general">
                      General Enquiry
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.16em] text-yellow-500"
                  >
                    Message
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={7}
                    placeholder="Write your message..."
                    className="w-full resize-y border border-zinc-800 bg-black px-3 py-2.5 text-[12px] leading-5 text-zinc-200 outline-none placeholder:text-zinc-700 focus:border-violet-500/50"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full border border-violet-500/40 bg-violet-500/10 px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-violet-300 transition hover:border-violet-400/60 hover:bg-violet-500/15 hover:text-white"
                >
                  Send Enquiry
                </button>

                <p className="text-[9px] leading-5 text-zinc-500">
                  Please do not submit passwords, financial information or
                  other highly sensitive personal information through this
                  form.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Data transparency */}
      <section className="border-t border-zinc-900">
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-6 sm:py-14">
          <div className="border border-zinc-900 bg-zinc-950/40 p-5 sm:p-6">
            <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-green-500">
              JMI Data Transparency
            </div>

            <h2 className="mt-3 text-base font-semibold text-zinc-100">
              Questions about our box-office figures?
            </h2>

            <p className="mt-3 max-w-3xl text-[11px] leading-6 text-zinc-500 sm:text-[12px]">
              JMI&apos;s box-office figures are trade figures, generally
              estimated through online ticket-sales tracking, market
              observation and available theatrical data. JMI does not claim
              that its figures are the original or final official figures of
              producers, distributors, exhibitors or other rights-holders,
              and JMI does not claim 100% accuracy over its numbers.
            </p>

            <p className="mt-3 max-w-3xl text-[11px] leading-6 text-red-500/60 sm:text-[12px]">
              If you believe a published figure requires correction or
              clarification, please include the relevant movie, territory,
              figure and supporting information in your enquiry.
            </p>
          </div>
        </div>

      </section>

      

      {/* Footer */}
      <footer className="border-t border-zinc-900">

        <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6">

          <div className="flex flex-col gap-2 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">

            <div>

              <p className="font-serif text-sm font-medium text-zinc-300">
                Jeruto{" "}
                <span className="text-yellow-400">
                  Movie Intelligence
                </span>
              </p>

              <p className="mt-1 text-[9px] text-zinc-500">
                India's Next Generation Movie Intelligence Platform
              </p>

            </div>

            <p className="text-[9px] text-zinc-500">
              JMI · People Intelligence
            </p>

          </div>

        </div>

      </footer>
    </main>
  );
}

function ContactTopic({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-l border-zinc-800 pl-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-300">
        {title}
      </div>

      <p className="mt-1.5 text-[10px] leading-5 text-zinc-600">
        {description}
      </p>
    </div>
  );
}