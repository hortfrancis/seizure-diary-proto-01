import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  Moon,
  Plus,
  ShieldAlert,
  Sun,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  dateLabel,
  eventInput,
  eventTypes,
  labels,
  localDateTime,
  parseLocalDateTime,
  timeLabel,
} from "@/lib/events";
import type { DiaryEvent, EventType } from "@/lib/events";

const icons = {
  possible_seizure: Activity,
  woke_up: Sun,
  went_to_sleep: Moon,
  other: BookOpen,
};
const descriptions = {
  possible_seizure: "Something you noticed",
  woke_up: "Start of your day",
  went_to_sleep: "Settling down to sleep",
  other: "Anything worth noting",
};

export default function App() {
  const [events, setEvents] = useState<DiaryEvent[]>([]);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [saved, setSaved] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) title.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
    mounted.current = true;
  }, [startedAt]);
  const groups = new Map<string, DiaryEvent[]>();
  for (const event of [...events].sort((a, b) =>
    b.occurredAt.localeCompare(a.occurredAt),
  )) {
    const day = dateLabel(new Date(event.occurredAt));
    groups.set(day, [...(groups.get(day) ?? []), event]);
  }
  function begin() {
    setSaved(false);
    setStartedAt(new Date());
  }
  return (
    <div className="app-shell">
      <div className="prototype-banner">
        <ShieldAlert size={17} aria-hidden="true" />
        <p>Prototype only: do not use with real patient data!</p>
      </div>
      <header className="brand">
        <span className="brand-icon">
          <Activity size={22} aria-hidden="true" />
        </span>
        <span>Seizure Diary</span>
        <span className="prototype-pill">PROTOTYPE</span>
      </header>
      <main>
        {startedAt ? (
          <>
            <Button
              variant="ghost"
              className="back-button"
              onClick={() => setStartedAt(null)}
            >
              <ArrowLeft size={17} /> Back to diary
            </Button>
            <p className="eyebrow">A MOMENT WORTH NOTING</p>
            <h1 ref={title} tabIndex={-1}>
              Add an event
            </h1>
            <p className="intro">A few details now, a clearer picture later.</p>
            <EventForm
              startedAt={startedAt}
              onCancel={() => setStartedAt(null)}
              onSave={(event) => {
                setEvents((current) => [...current, event]);
                setStartedAt(null);
                setSaved(true);
              }}
            />
          </>
        ) : (
          <>
            <div className="page-heading">
              <div>
                <p className="eyebrow">YOUR EVERYDAY RECORD</p>
                <h1 ref={title} tabIndex={-1}>
                  Your diary
                </h1>
              </div>
              <span className="heading-icon">
                <BookOpen size={25} aria-hidden="true" />
              </span>
            </div>
            <p className="intro">Keep a note of moments that matter.</p>
            <Button className="primary-button add-button" onClick={begin}>
              <Plus size={20} /> Add an event{" "}
              <ArrowRight className="ml-auto" size={18} />
            </Button>
            <div aria-live="polite" role="status">
              {saved && (
                <div className="success">
                  <CheckCircle2 size={18} /> Event added to your diary.
                </div>
              )}
            </div>
            <section className="diary-section" aria-label="Diary entries">
              <div className="section-heading">
                <h2>Your events</h2>
                <span>
                  {events.length} {events.length === 1 ? "entry" : "entries"}
                </span>
              </div>
              {events.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-art">
                    <BookOpen size={35} strokeWidth={1.4} aria-hidden="true" />
                    <span>
                      <Plus size={13} />
                    </span>
                  </div>
                  <h3>A fresh page</h3>
                  <p>
                    Your events will appear here.
                    <br />
                    Start with a fictional example.
                  </p>
                  <button className="text-link" onClick={begin}>
                    Add your first event <ArrowRight size={15} />
                  </button>
                </div>
              ) : (
                [...groups].map(([date, entries]) => (
                  <section className="day-group" key={date}>
                    <h3>{date}</h3>
                    <ul>
                      {entries.map((event) => {
                        const Icon = icons[event.type];
                        return (
                          <li className="event-card" key={event.id}>
                            <div className={`event-icon ${event.type}`}>
                              <Icon size={20} aria-hidden="true" />
                            </div>
                            <div className="event-copy">
                              <div className="event-top">
                                <h4>{labels[event.type]}</h4>
                                <time dateTime={event.occurredAt}>
                                  {timeLabel(new Date(event.occurredAt))}
                                </time>
                              </div>
                              {event.notes && <p>{event.notes}</p>}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))
              )}
            </section>
            <p className="clinical-note">
              Entries are not monitored by a clinician.
            </p>
          </>
        )}
      </main>
      <footer>
        <span className="session-dot" />
        <p>
          Just for this session.
          <br />
          <strong>Refreshing clears your entries.</strong>
        </p>
      </footer>
    </div>
  );
}

function EventForm({
  startedAt,
  onSave,
  onCancel,
}: {
  startedAt: Date;
  onSave: (event: DiaryEvent) => void;
  onCancel: () => void;
}) {
  const [type, setType] = useState<EventType | "">("");
  const [notes, setNotes] = useState("");
  const [changeTime, setChangeTime] = useState(false);
  const [error, setError] = useState("");
  const submitted = useRef(false);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitted.current) return;
    const result = eventInput.safeParse({ type, notes });
    if (!result.success) {
      setError(
        type
          ? result.error.issues[0].message
          : "Choose an event type to continue.",
      );
      return;
    }
    const enteredDateTime = new FormData(e.currentTarget).get("occurredAt");
    const occurredAt = changeTime
      ? parseLocalDateTime(String(enteredDateTime ?? ""))
      : startedAt;
    if (!occurredAt) {
      setError("Enter a valid date and time.");
      return;
    }
    if (occurredAt.getTime() > Date.now() + 5 * 60_000) {
      setError("Choose a time in the past or use Now.");
      return;
    }
    submitted.current = true;
    onSave({
      id: crypto.randomUUID(),
      ...result.data,
      occurredAt: occurredAt.toISOString(),
    });
  }
  return (
    <form onSubmit={save} noValidate>
      <fieldset className="event-types">
        <legend>What would you like to record?</legend>
        <div className="type-grid">
          {eventTypes.map((value) => {
            const Icon = icons[value];
            return (
              <label
                className={`type-option ${type === value ? "selected" : ""}`}
                key={value}
              >
                <input
                  type="radio"
                  name="event-type"
                  value={value}
                  checked={type === value}
                  onChange={() => {
                    setType(value);
                    setError("");
                  }}
                />
                <Icon size={22} aria-hidden="true" />
                <span className="type-title">{labels[value]}</span>
                <span className="type-description">{descriptions[value]}</span>
                {type === value && (
                  <Check
                    className="selected-check"
                    size={15}
                    aria-hidden="true"
                  />
                )}
              </label>
            );
          })}
        </div>
      </fieldset>
      <section className="time-section" aria-labelledby="when-label">
        <h2 id="when-label">When did it happen?</h2>
        <div className="time-card">
          <Clock3 size={20} aria-hidden="true" />
          <div>
            <strong>
              {changeTime ? "A different time" : "Now"}
              {!changeTime && <span> · {timeLabel(startedAt)}</span>}
            </strong>
            <p>
              {changeTime
                ? "Choose the date and time below."
                : dateLabel(startedAt)}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="text-link"
            onClick={() => {
              setChangeTime(!changeTime);
              setError("");
            }}
          >
            {changeTime ? "Use original time" : "Change"}
          </Button>
        </div>
        {changeTime && (
          <div className="date-editor">
            <label htmlFor="occurredAt">Event date and time</label>
            <input
              id="occurredAt"
              name="occurredAt"
              type="datetime-local"
              defaultValue={localDateTime(startedAt)}
            />
          </div>
        )}
        <p className="field-hint">
          {changeTime ? "Local time" : "Captured when you opened this entry"} ·{" "}
          {timezone.replaceAll("_", " ")}
        </p>
      </section>
      <div className="notes-field">
        <label htmlFor="notes">
          Anything to add? <span>Optional</span>
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={2000}
          rows={4}
          placeholder="Any details you’d like to remember…"
        />
        <p className="field-hint">Use fictional details only.</p>
      </div>
      {error && (
        <p role="alert" className="form-error">
          <X size={17} aria-hidden="true" />
          {error}
        </p>
      )}
      <div className="form-actions">
        <Button type="submit" className="primary-button">
          <Check size={18} /> Save event
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
