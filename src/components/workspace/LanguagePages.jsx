"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Bookmark,
  BookOpen,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Flame,
  Headphones,
  History,
  Lightbulb,
  MessageSquareText,
  Pencil,
  Plus,
  RotateCcw,
  Settings2,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";
import { useWorkspace } from "@/store/WorkspaceContext";
import {
  cefrLevels,
  getDailyWordIds,
  getWordSet,
  languageCatalog,
} from "@/data/languages";
import {
  formatDate,
  getLongestStreak,
  getStreak,
  localDateKey,
} from "@/utils/dates";
import {
  Badge,
  Button,
  EmptyState,
  IconButton,
  PageHeading,
  ProgressBar,
} from "@/components/ui";
import {
  AddLanguageForm,
  LanguageSettingsForm,
} from "@/components/workspace/Forms";

function languageAccent(languageId) {
  return (
    languageCatalog.find((item) => item.id === languageId)?.color ??
    "var(--accent)"
  );
}
function levelPosition(level, target) {
  const current = cefrLevels.indexOf(level);
  const goal = cefrLevels.indexOf(target);
  return goal <= current ? 100 : Math.round((current / goal) * 100);
}
function languageWords(language) {
  return getWordSet(language.id);
}
function progressCounts(language, vocabularyProgress) {
  const ids = new Set(languageWords(language).map((word) => word.id));
  const records = Object.entries(vocabularyProgress)
    .filter(([wordId]) => ids.has(wordId))
    .map(([, value]) => value);
  return {
    learned: records.filter((item) =>
      ["Learning", "Mastered"].includes(item.status),
    ).length,
    mastered: records.filter((item) => item.status === "Mastered").length,
    review: records.filter((item) => item.status === "Review").length,
    saved: records.filter((item) => item.saved).length,
  };
}

function LanguageCard({ language, counts }) {
  const percent = levelPosition(language.level, language.targetLevel);
  const streak = getStreak(language.completedDays);
  return (
    <Link
      href={`/languages/${language.id}`}
      className="language-card"
      style={{ "--language-accent": languageAccent(language.id) }}
    >
      <div className="language-card-top">
        <span className="language-mark">{language.name.slice(0, 1)}</span>
        <span className="language-card-title">
          <strong>{language.name}</strong>
          <small>
            {
              languageCatalog.find((item) => item.id === language.id)
                ?.nativeName
            }
          </small>
        </span>
        <span className="language-levels">
          <b>{language.level}</b>
          <ArrowRight size={12} />
          <b>{language.targetLevel}</b>
        </span>
      </div>
      <div className="language-card-progress">
        <div className="language-card-caption">
          <span>Self-set level path</span>
          <small>{percent}%</small>
        </div>
        <ProgressBar
          value={percent}
          color="var(--language-accent)"
          label={`${language.name} level path`}
        />
      </div>
      <div className="language-card-stats">
        <span>
          <Flame size={13} />
          {streak} day streak
        </span>
        <span>
          <BookOpen size={13} />
          {counts.learned} learned
        </span>
        <span className={counts.review ? "review-stat" : ""}>
          <RotateCcw size={12} />
          {counts.review} to review
        </span>
      </div>
      <div className="language-card-foot">
        <span>{language.dailyWords} words today</span>
        <ArrowUpRight size={14} />
      </div>
    </Link>
  );
}

export function LanguagesPage() {
  const { workspace, actions } = useWorkspace();
  const [adding, setAdding] = useState(false);
  const active = workspace.languages.filter((language) => language.enabled);
  return (
    <>
      <PageHeading
        eyebrow="A LEARNING JOURNAL"
        title="Languages"
        description="Steady practice, at a pace you set. Your CEFR levels are personal settings, not an automatic assessment."
        action={
          <Button onClick={() => setAdding(true)}>
            <Plus size={15} /> Add language
          </Button>
        }
      />
      <div className="language-today-banner">
        <div className="language-banner-symbol">
          <BookOpen size={17} />
        </div>
        <div>
          <strong>Five words can change how a day feels.</strong>
          <p>
            Today's practice is ready whenever you are. Each word stays put
            until local midnight.
          </p>
        </div>
        <Link
          className="button button-secondary button-sm"
          href="/languages/today"
        >
          Start today's words <ArrowRight size={13} />
        </Link>
      </div>
      {active.length ? (
        <div className="languages-grid">
          {active.map((language) => (
            <LanguageCard
              key={language.id}
              language={language}
              counts={progressCounts(language, workspace.vocabularyProgress)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="Choose a language to learn"
          description="Add your first language and set a daily word goal that feels comfortable."
          action={
            <Button onClick={() => setAdding(true)}>
              <Plus size={14} /> Add a language
            </Button>
          }
        />
      )}
      <div className="learning-method-note">
        <span>
          <Lightbulb size={15} />
        </span>
        <p>
          <strong>Your level is yours to choose.</strong> DevFlow uses the
          current level you set to select useful fallback words. It doesn't
          place or score you.
        </p>
      </div>
      {adding && (
        <AddLanguageForm
          languages={workspace.languages}
          onSave={(id, level, target) => {
            actions.addLanguage(id, level, target);
            setAdding(false);
          }}
          onClose={() => setAdding(false)}
        />
      )}
    </>
  );
}

export function DailyLanguagePage({ initialLanguageId }) {
  const { workspace, actions } = useWorkspace();
  const activeLanguages = workspace.languages.filter((item) => item.enabled);
  const [languageId, setLanguageId] = useState(
    initialLanguageId || activeLanguages[0]?.id || "",
  );
  const [index, setIndex] = useState(0);
  const [showNote, setShowNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const language =
    activeLanguages.find((item) => item.id === languageId) ??
    activeLanguages[0];
  const date = localDateKey();
  const daily = language
    ? workspace.dailySessions[`${date}:${language.id}`]
    : null;
  useEffect(() => {
    if (language) actions.ensureDailySession(language.id);
  }, [language?.id, actions]);
  useEffect(() => {
    setIndex(0);
  }, [languageId]);
  const words = useMemo(() => {
    if (!language) return [];
    const ids = daily?.wordIds ?? getDailyWordIds(language, date);
    const dictionary = languageWords(language);
    return ids
      .map((id) => dictionary.find((entry) => entry.id === id))
      .filter(Boolean);
  }, [language, daily?.wordIds, date]);
  const answers = daily?.answers ?? {};
  const current = words[index];
  const currentProgress = current
    ? (workspace.vocabularyProgress[current.id] ?? {})
    : {};
  const completeCount = words.filter((word) => answers[word.id]).length;
  const complete = Boolean(words.length && completeCount === words.length);
  const changeWord = (nextIndex) => {
    setIndex(Math.max(0, Math.min(words.length - 1, nextIndex)));
    setShowNote(false);
  };
  const answer = (kind) => {
    if (!current || !language) return;
    actions.answerVocabulary(language.id, current.id, kind);
    if (index < words.length - 1) changeWord(index + 1);
  };
  const listen = () => {
    if (!current || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const spoken = new SpeechSynthesisUtterance(current.term);
    spoken.lang =
      languageCatalog.find((item) => item.id === language.id)?.locale ??
      "en-US";
    spoken.rate = 0.86;
    window.speechSynthesis.speak(spoken);
  };
  if (!activeLanguages.length)
    return (
      <>
        <PageHeading
          eyebrow="DAILY PRACTICE"
          title="Today's words"
          description="Five words, one gentle session."
        />
        <EmptyState
          icon={BookOpen}
          title="Add a language first"
          description="Your daily word sequence appears here after you choose a language."
          action={
            <Link className="button button-primary" href="/languages">
              Explore languages <ArrowRight size={14} />
            </Link>
          }
        />
      </>
    );

  return (
    <>
      <Link href="/languages" className="back-link">
        <ArrowLeft size={14} /> All languages
      </Link>
      <div className="daily-heading">
        <div>
          <div className="eyebrow">
            {new Intl.DateTimeFormat(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })
              .format(new Date())
              .toUpperCase()}
          </div>
          <h1>Today's words</h1>
          <p>A few new words. A little more room in the language.</p>
        </div>
        <label className="daily-language-picker">
          <span>LEARNING</span>
          <select
            value={language?.id ?? ""}
            onChange={(event) => {
              setLanguageId(event.target.value);
              window.history.replaceState(
                null,
                "",
                `/languages/today?language=${event.target.value}`,
              );
            }}
            aria-label="Choose a language"
          >
            {activeLanguages.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · {item.level}
              </option>
            ))}
          </select>
        </label>
      </div>
      {language && (
        <div className="daily-progress-top">
          <div className="daily-language-id">
            <span className="language-mark">{language.name.slice(0, 1)}</span>
            <div>
              <strong>{language.name}</strong>
              <small>
                {language.level} <span>→</span> {language.targetLevel}{" "}
                <i>· self-set</i>
              </small>
            </div>
          </div>
          <div className="daily-progress-meter">
            <div>
              <span>
                {complete
                  ? "A good session, finished."
                  : `${language.dailyWords} words for today`}
              </span>
              <strong>
                {completeCount} <i>/</i> {words.length}
              </strong>
            </div>
            <ProgressBar
              value={words.length ? (completeCount / words.length) * 100 : 0}
              color="var(--language-accent)"
              label="Words explored today"
            />
          </div>
          <span className="daily-streak-pill">
            <Flame size={14} /> {getStreak(language.completedDays)} day streak
          </span>
        </div>
      )}

      {complete ? (
        <section className="daily-complete surface">
          <div className="complete-mark">
            <CheckCheck size={22} />
          </div>
          <div className="eyebrow">YOU SHOWED UP TODAY</div>
          <h2>Five words, kept.</h2>
          <p>
            Your {language.name} practice is done for today. A quiet bit of
            progress still counts.
          </p>
          <div className="complete-stats">
            <span>
              <Check size={14} /> {words.length} words explored
            </span>
            <span>
              <Flame size={14} /> {getStreak(language.completedDays)} day streak
            </span>
          </div>
          <div className="complete-actions">
            <Button
              variant="secondary"
              onClick={() => {
                setIndex(0);
              }}
            >
              <History size={14} /> Look back at today's words
            </Button>
            <Link
              className="button button-quiet"
              href={`/languages/${language.id}`}
            >
              Language journal <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      ) : (
        current && (
          <section className="daily-learning-layout">
            <aside className="word-sequence">
              <div className="eyebrow">YOUR SEQUENCE</div>
              {words.map((word, wordIndex) => (
                <button
                  className={`sequence-step ${wordIndex === index ? "current" : ""} ${answers[word.id] ? "answered" : ""}`}
                  key={word.id}
                  onClick={() => changeWord(wordIndex)}
                >
                  <span className="sequence-number">
                    {answers[word.id] ? (
                      <Check size={12} />
                    ) : (
                      String(wordIndex + 1).padStart(2, "0")
                    )}
                  </span>
                  <span className="sequence-word">
                    <strong>{word.term}</strong>
                    <small>{word.part}</small>
                  </span>
                  <span
                    className={`sequence-status ${answers[word.id] ? answers[word.id] : ""}`}
                  >
                    {answers[word.id] === "known"
                      ? "Learned"
                      : answers[word.id] === "difficult"
                        ? "Review"
                        : answers[word.id] === "later"
                          ? "Later"
                          : ""}
                  </span>
                </button>
              ))}
            </aside>
            <article
              className="word-card"
              style={{ "--language-accent": languageAccent(language.id) }}
            >
              <div className="word-card-meta">
                <span className="word-counter">
                  {String(index + 1).padStart(2, "0")} <i>/</i>{" "}
                  {String(words.length).padStart(2, "0")}
                </span>
                <div className="word-card-actions">
                  <Badge tone="amber">{current.level}</Badge>
                  <IconButton
                    label={
                      currentProgress.saved ? "Remove saved word" : "Save word"
                    }
                    className={currentProgress.saved ? "saved-word-button" : ""}
                    onClick={() => actions.toggleVocabularySaved(current.id)}
                  >
                    <Bookmark
                      size={15}
                      fill={currentProgress.saved ? "currentColor" : "none"}
                    />
                  </IconButton>
                </div>
              </div>
              <div className="word-card-main">
                <div className="eyebrow">
                  {language.name.toUpperCase()} · {current.part.toUpperCase()}
                </div>
                <div className="word-term-row">
                  <h2>{current.term}</h2>
                  <button
                    className="listen-word"
                    onClick={listen}
                    aria-label={`Listen to ${current.term}`}
                  >
                    <Volume2 size={16} /> Listen
                  </button>
                </div>
                <div className="word-translation">{current.meaning}</div>
                <div className="word-native">{current.translation.trim()}</div>
                <div className="word-example">
                  <span>IN A SENTENCE</span>
                  <p>“{current.example}”</p>
                </div>
                {showNote && (
                  <label className="word-note-field">
                    <span>
                      <MessageSquareText size={13} /> YOUR NOTE
                    </span>
                    <textarea
                      value={noteDraft}
                      onChange={(event) => setNoteDraft(event.target.value)}
                      onBlur={() =>
                        actions.saveVocabularyNote(current.id, noteDraft)
                      }
                      placeholder="Add a memory, another translation, or a thought…"
                      autoFocus
                    />
                  </label>
                )}
              </div>
              <div className="word-card-bottom">
                <button
                  className="word-note-button"
                  onClick={() => {
                    setNoteDraft(currentProgress.note ?? "");
                    setShowNote((value) => !value);
                  }}
                >
                  <MessageSquareText size={14} />{" "}
                  {currentProgress.note
                    ? "Edit your note"
                    : "Add a personal note"}
                </button>
                <div className="word-primary-actions">
                  <button
                    className="word-difficult"
                    onClick={() => answer("difficult")}
                  >
                    <RotateCcw size={13} /> Difficult
                  </button>
                  <button
                    className="word-later"
                    onClick={() => answer("later")}
                  >
                    Review later
                  </button>
                  <Button
                    className="word-known"
                    onClick={() => answer("known")}
                  >
                    <Check size={14} /> I know this
                  </Button>
                </div>
              </div>
              <div className="word-card-nav">
                <button
                  onClick={() => changeWord(index - 1)}
                  disabled={index === 0}
                >
                  <ChevronLeft size={15} /> Previous
                </button>
                <span>
                  {completeCount} of {words.length} explored
                </span>
                <button
                  onClick={() => changeWord(index + 1)}
                  disabled={index >= words.length - 1}
                >
                  Next <ChevronRight size={15} />
                </button>
              </div>
            </article>
            <aside className="daily-hint">
              <Sparkles size={15} />
              <p>Small suggestion</p>
              <strong>
                Try the word in your own sentence before you mark it.
              </strong>
              <span>
                You can come back to a difficult one from your language journal.
              </span>
              <Link href={`/languages/${language.id}`}>
                Open {language.name} journal <ArrowRight size={12} />
              </Link>
            </aside>
          </section>
        )
      )}
    </>
  );
}

function ReviewWord({ word, onKnow, onDifficult }) {
  return (
    <div className="review-word-line">
      <div>
        <strong>{word.term}</strong>
        <small>{word.meaning}</small>
      </div>
      <Badge tone="amber">Review</Badge>
      <div className="review-word-actions">
        <button onClick={onDifficult} title="Keep in review">
          <RotateCcw size={13} />
        </button>
        <button onClick={onKnow} title="Mark as learned">
          <Check size={14} />
        </button>
      </div>
    </div>
  );
}

export function LanguageDetailPage({ languageId }) {
  const { workspace, actions } = useWorkspace();
  const language = workspace.languages.find((item) => item.id === languageId);
  const [editing, setEditing] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [expandedSection, setExpandedSection] = useState("review");
  if (!language)
    return (
      <>
        <Link href="/languages" className="back-link">
          <ArrowLeft size={14} /> All languages
        </Link>
        <EmptyState
          icon={BookOpen}
          title="Language not found"
          description="It may have been removed from this workspace."
          action={
            <Link className="button button-secondary" href="/languages">
              Back to languages
            </Link>
          }
        />
      </>
    );

  const words = languageWords(language);
  const counts = progressCounts(language, workspace.vocabularyProgress);
  const records = Object.entries(workspace.vocabularyProgress)
    .map(([id, value]) => ({
      word: words.find((word) => word.id === id),
      ...value,
    }))
    .filter((item) => item.word);
  const reviewWords = records
    .filter((item) => item.status === "Review")
    .sort((a, b) => (a.dueAt || "").localeCompare(b.dueAt || ""));
  const strongWords = records
    .filter((item) => item.status === "Mastered")
    .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  const recentWords = records
    .filter((item) => item.status !== "New")
    .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""))
    .slice(0, 5);
  const notes = workspace.notes.filter(
    (note) => note.languageId === language.id,
  );
  const accent = languageAccent(language.id);
  const streak = getStreak(language.completedDays);
  const maxStreak = Math.max(streak, getLongestStreak(language.completedDays));
  const week = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - offset));
    const key = localDateKey(date);
    return {
      key,
      day: new Intl.DateTimeFormat(undefined, { weekday: "short" })
        .format(date)
        .slice(0, 1),
      done: language.completedDays.includes(key),
    };
  });
  return (
    <>
      <Link href="/languages" className="back-link">
        <ArrowLeft size={14} /> All languages
      </Link>
      <div
        className="language-detail-hero"
        style={{ "--language-accent": accent }}
      >
        <div className="language-detail-main">
          <div className="language-detail-heading">
            <span className="language-mark large">
              {language.name.slice(0, 1)}
            </span>
            <div>
              <div className="eyebrow">YOUR LANGUAGE JOURNAL</div>
              <h1>{language.name}</h1>
              <p>
                {
                  languageCatalog.find((item) => item.id === language.id)
                    ?.nativeName
                }{" "}
                <span>·</span> Learning since{" "}
                {formatDate(language.startedAt, {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="language-level-display">
            <div className="level-node current">
              <small>CURRENT · SELF-SET</small>
              <strong>{language.level}</strong>
            </div>
            <div className="level-track">
              <ProgressBar
                value={levelPosition(language.level, language.targetLevel)}
                color="var(--language-accent)"
                label="Position between your selected CEFR levels"
              />
              <span>Your chosen path</span>
            </div>
            <div className="level-node target">
              <small>YOUR TARGET</small>
              <strong>{language.targetLevel}</strong>
            </div>
          </div>
        </div>
        <div className="language-detail-actions">
          <Badge tone={language.enabled ? "amber" : "neutral"}>
            {language.enabled ? "In daily practice" : "Paused"}
          </Badge>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setEditing(true)}
          >
            <Settings2 size={13} /> Learning plan
          </Button>
          <Button variant="quiet" size="sm" onClick={() => setRemoving(true)}>
            <X size={13} /> Remove
          </Button>
        </div>
      </div>

      <div className="language-stat-grid">
        <div className="language-stat">
          <span>Current streak</span>
          <strong>
            <Flame size={16} /> {streak}
            <i>days</i>
          </strong>
          <small>Longest: {maxStreak} days recorded</small>
        </div>
        <div className="language-stat">
          <span>Words learned</span>
          <strong>
            {counts.learned}
            <i>words</i>
          </strong>
          <small>{counts.mastered} marked as mastered</small>
        </div>
        <div className="language-stat">
          <span>Ready to review</span>
          <strong>
            {counts.review}
            <i>words</i>
          </strong>
          <small>Return to these when you’re ready</small>
        </div>
        <div className="language-stat">
          <span>Daily goal</span>
          <strong>
            {language.dailyWords}
            <i>words</i>
          </strong>
          <small>
            {language.preferredTime
              ? `Preferred time · ${language.preferredTime}`
              : "A gentle daily habit"}
          </small>
        </div>
      </div>

      <div className="language-detail-grid">
        <div className="language-detail-primary">
          <section className="surface language-today-card">
            <div className="section-title-row">
              <div>
                <div className="eyebrow">A SMALL DAILY HABIT</div>
                <h2>Today's practice</h2>
              </div>
              <span className="language-mini-streak">
                <Flame size={13} /> {streak} days
              </span>
            </div>
            <p>
              {language.dailyWords} words in your {language.level} set, ready
              when you are.
            </p>
            <div className="language-week">
              {week.map((day) => (
                <div
                  className={`language-week-day ${day.done ? "done" : ""}`}
                  key={day.key}
                >
                  <span>{day.done ? <Check size={11} /> : ""}</span>
                  <small>{day.day}</small>
                </div>
              ))}
            </div>
            <Link
              href={`/languages/today?language=${language.id}`}
              className="button button-primary language-practice-cta"
            >
              Open today’s words <ArrowRight size={14} />
            </Link>
          </section>

          <section className="surface review-queue">
            <button
              className="review-section-toggle"
              onClick={() =>
                setExpandedSection(expandedSection === "review" ? "" : "review")
              }
            >
              <span>
                <span className="review-section-icon">
                  <RotateCcw size={14} />
                </span>
                <span>
                  <strong>Worth another look</strong>
                  <small>
                    {reviewWords.length
                      ? `${reviewWords.length} words in the review queue`
                      : "No difficult words right now"}
                  </small>
                </span>
              </span>
              <ChevronRight
                size={15}
                className={expandedSection === "review" ? "rotated" : ""}
              />
            </button>
            {expandedSection === "review" && (
              <div className="review-queue-content">
                {reviewWords.length ? (
                  reviewWords.map((item) => (
                    <ReviewWord
                      key={item.word.id}
                      word={item.word}
                      onKnow={() =>
                        actions.answerVocabulary(
                          language.id,
                          item.word.id,
                          "known",
                        )
                      }
                      onDifficult={() =>
                        actions.answerVocabulary(
                          language.id,
                          item.word.id,
                          "difficult",
                        )
                      }
                    />
                  ))
                ) : (
                  <div className="review-caught-up">
                    <CheckCircle2Tiny />
                    You're caught up. Difficult words will collect here.
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="surface language-recent-card">
            <div className="section-title-row">
              <div>
                <h2>Words you've met</h2>
                <p>Your recent work in this language.</p>
              </div>
              <Badge>{records.length} tracked</Badge>
            </div>
            {recentWords.length ? (
              <div className="language-word-list">
                {recentWords.map((item) => (
                  <div className="language-word-row" key={item.word.id}>
                    <span>
                      <strong>{item.word.term}</strong>
                      <small>
                        {item.word.part} · {item.word.meaning}
                      </small>
                    </span>
                    <Badge
                      tone={
                        item.status === "Mastered"
                          ? "green"
                          : item.status === "Review"
                            ? "amber"
                            : "blue"
                      }
                    >
                      {item.status}
                    </Badge>
                    <small>{formatDate(item.updatedAt)}</small>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={BookOpen}
                title="Your word history starts here"
                description="A word becomes part of your journal after your first practice."
              />
            )}
          </section>
        </div>

        <aside className="language-detail-aside">
          <section className="surface language-aside-card">
            <div className="section-title-row">
              <div>
                <h2>Words you know</h2>
                <p>Marked as mastered.</p>
              </div>
              <span className="mastery-number">{strongWords.length}</span>
            </div>
            {strongWords.length ? (
              strongWords.slice(0, 5).map((item) => (
                <div className="strong-word-line" key={item.word.id}>
                  <span>{item.word.term}</span>
                  <small>{item.word.meaning}</small>
                </div>
              ))
            ) : (
              <p className="muted-copy">
                Words move here after a second learned pass.
              </p>
            )}
          </section>
          <section className="surface language-aside-card">
            <div className="section-title-row">
              <div>
                <h2>Your notes</h2>
                <p>Language thoughts and useful phrases.</p>
              </div>
              <Link href="/notes" className="subtle-icon-link">
                <ArrowUpRight size={14} />
              </Link>
            </div>
            {notes.length ? (
              notes.slice(0, 3).map((note) => (
                <Link
                  className="language-note-line"
                  href="/notes"
                  key={note.id}
                >
                  <strong>{note.title}</strong>
                  <small>
                    {note.content.slice(0, 60)}
                    {note.content.length > 60 ? "…" : ""}
                  </small>
                </Link>
              ))
            ) : (
              <div className="notes-empty-line">
                <MessageSquareText size={14} />
                <span>No notes here yet.</span>
              </div>
            )}
            <Link className="section-link add-language-note" href="/notes">
              Write a language note <ArrowRight size={12} />
            </Link>
          </section>
          <div className="language-detail-disclaimer">
            <span>
              <Lightbulb size={14} />
            </span>
            <p>
              Your current and target levels are self-set. This journal tracks
              the words and study days you record, not a language assessment.
            </p>
          </div>
        </aside>
      </div>
      {editing && (
        <LanguageSettingsForm
          language={language}
          onSave={(changes) => {
            actions.updateLanguage(language.id, changes);
            setEditing(false);
          }}
          onClose={() => setEditing(false)}
        />
      )}
      {removing && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="remove-language"
          >
            <header className="modal-header">
              <div>
                <h2 id="remove-language">Remove {language.name}?</h2>
                <p>
                  Your linked notes will stay, and their language tag will be
                  cleared. Learning history for this language leaves the
                  workspace.
                </p>
              </div>
              <IconButton label="Close" onClick={() => setRemoving(false)}>
                <X size={16} />
              </IconButton>
            </header>
            <div className="modal-actions">
              <Button variant="quiet" onClick={() => setRemoving(false)}>
                Keep language
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  actions.removeLanguage(language.id);
                  setRemoving(false);
                  window.location.assign("/languages");
                }}
              >
                Remove language
              </Button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function CheckCircle2Tiny() {
  return <CheckCheck size={14} />;
}
