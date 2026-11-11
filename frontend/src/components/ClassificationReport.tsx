import { useId, useState } from "react";
import type { FormEvent } from "react";
import { reportClassification } from "../services/api";
import ui from "./ClassificationReport.module.scss";

export function ClassificationReport({
  slug,
  accepted,
}: {
  slug: string;
  accepted: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [relevant, setRelevant] = useState(!accepted);
  const [reason, setReason] = useState("");
  const [source, setSource] = useState("");
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<number | null>(null);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (reason.trim().length < 10) {
      setError("Please add an explanation of at least 10 characters.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await reportClassification({
        slug,
        requested_relevance: relevant,
        reason: reason.trim(),
        source_url: source.trim() || null,
      });
      setReceipt(result.id);
    } catch {
      setError(
        "Your report couldn’t be saved. Your explanation is still here; please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className={ui.report} aria-label="Report classification">
      <button
        type="button"
        className={ui.toggle}
        aria-expanded={open}
        aria-controls={`${id}-form`}
        onClick={() => setOpen(!open)}
      >
        {open ? "Close report" : "Report classification"}
      </button>
      {open && (
        <div id={`${id}-form`}>
          {receipt !== null ? (
            <p role="status">
              Thanks. Your report is awaiting review. Reference #{receipt}.
            </p>
          ) : (
            <form onSubmit={submit}>
              <h2>Is this subject related to Nigeria?</h2>
              <p>
                Reporting {slug.replace(/_/g, " ")}. Tell us which
                classification you think is correct.
              </p>
              <fieldset disabled={busy}>
                <legend>Suggested classification</legend>
                <label className={ui.choice}>
                  <input
                    type="radio"
                    name={`${id}-relevance`}
                    checked={relevant}
                    onChange={() => setRelevant(true)}
                  />
                  Related to Nigeria
                </label>
                <label className={ui.choice}>
                  <input
                    type="radio"
                    name={`${id}-relevance`}
                    checked={!relevant}
                    onChange={() => setRelevant(false)}
                  />
                  Not related to Nigeria
                </label>
                <label htmlFor={`${id}-reason`}>Why should it change?</label>
                <textarea
                  id={`${id}-reason`}
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                <label htmlFor={`${id}-source`}>Source link (optional)</label>
                <input
                  id={`${id}-source`}
                  type="url"
                  maxLength={2083}
                  placeholder="https://…"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                />
                <p>
                  Reports are reviewed before any classification changes. Please
                  leave out personal contact details.
                </p>
                {error && <p role="alert">{error}</p>}
                <button type="submit">
                  {busy ? "Sending report…" : "Send report"}
                </button>
              </fieldset>
            </form>
          )}
        </div>
      )}
    </section>
  );
}
