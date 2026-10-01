"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, Bookmark, BookOpen, Code2, FileText, FolderKanban, Languages, ListTodo, NotebookPen, Plus, Pin, Search, Sparkles, Trash2 } from "lucide-react";
import { useWorkspace } from "@/store/WorkspaceContext";
import { getWordSet } from "@/data/languages";
import { formatDate } from "@/utils/dates";
import { Badge, Button, EmptyState, IconButton, Modal, PageHeading } from "@/components/ui";
import { NoteForm } from "@/components/workspace/Forms";
import { getAllTasks } from "@/components/workspace/ProjectTaskPages";

function noteContext(note, projects, languages) {
  if (note.projectId) return projects.find((project) => project.id === note.projectId)?.name ?? "Project note";
  if (note.languageId) return languages.find((language) => language.id === note.languageId)?.name ?? "Language note";
  return "General note";
}

function NoteCard({ note, context, onEdit, onDelete, onPin }) {
  return <article className="note-card"><div className="note-card-top"><span className={`note-kind ${note.languageId ? "language" : note.projectId ? "project" : "general"}`}>{note.languageId ? <Languages size={13} /> : note.projectId ? <Code2 size={13} /> : <NotebookPen size={13} />}{context}</span><div><IconButton label={note.pinned ? "Unpin note" : "Pin note"} className={note.pinned ? "note-is-pinned" : ""} onClick={onPin}><Pin size={14} /></IconButton><IconButton label="Edit note" onClick={onEdit}><FileText size={14} /></IconButton><IconButton label="Delete note" onClick={onDelete}><Trash2 size={14} /></IconButton></div></div><button className="note-card-title" onClick={onEdit}>{note.title}</button><p className="note-card-content">{note.content}</p><div className="note-card-tags">{note.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="note-card-foot"><span>{note.pinned && <Bookmark size={11} fill="currentColor" />} Edited {formatDate(note.updatedAt)}</span><button onClick={onEdit}>Open note <ArrowUpRight size={12} /></button></div></article>;
}

export function NotesPage() {
  const { workspace, actions } = useWorkspace();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All notes");
  const [tag, setTag] = useState("All tags");
  const [editor, setEditor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const allTags = [...new Set(workspace.notes.flatMap((note) => note.tags))].sort((a, b) => a.localeCompare(b));
  const notes = useMemo(() => [...workspace.notes].filter((note) => {
    const matchesText = `${note.title} ${note.content} ${note.tags.join(" ")}`.toLocaleLowerCase().includes(query.toLocaleLowerCase());
    const matchesFilter = filter === "All notes" || (filter === "Pinned" ? note.pinned : filter === "Language" ? Boolean(note.languageId) : !note.languageId);
    return matchesText && matchesFilter && (tag === "All tags" || note.tags.includes(tag));
  }).sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt)), [workspace.notes, query, filter, tag]);
  const save = (note) => { actions.saveNote(note); setEditor(null); };
  return <>
    <PageHeading eyebrow="A NOTEBOOK FOR THE WORK" title="Notes" description="Keep the idea, the code detail, or the phrase you want to find again." action={<Button onClick={() => setEditor({})}><Plus size={15} /> New note</Button>} />
    <div className="toolbar notes-toolbar"><div className="search-field"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your notes…" aria-label="Search notes" /></div><div className="filter-pills">{["All notes", "Pinned", "Language", "General & project"].map((item) => <button key={item} className={`filter-pill ${filter === item ? "selected" : ""}`} onClick={() => setFilter(item)}>{item}</button>)}</div><label className="select-compact"><span className="sr-only">Filter by tag</span><select value={tag} onChange={(event) => setTag(event.target.value)}><option>All tags</option>{allTags.map((item) => <option key={item}>{item}</option>)}</select></label><span className="toolbar-count">{notes.length} notes</span></div>
    {notes.length ? <div className="notes-grid">{notes.map((note) => <NoteCard key={note.id} note={note} context={noteContext(note, workspace.projects, workspace.languages)} onEdit={() => setEditor(note)} onPin={() => actions.toggleNotePinned(note.id)} onDelete={() => setDeleting(note)} />)}</div> : <EmptyState icon={NotebookPen} title={query ? "No notes found" : "Start your notebook"} description={query ? "Try another phrase or clear one of the filters." : "Save a code pattern, a project thought, or a useful language phrase."} action={!query && <Button onClick={() => setEditor({})}><Plus size={14} /> Write a note</Button>} />}
    {editor && <NoteForm initial={editor.id ? editor : null} projects={workspace.projects} languages={workspace.languages} onSave={save} onClose={() => setEditor(null)} />}
    {deleting && <Modal title="Delete this note?" description={`“${deleting.title}” will be removed from this workspace.`} onClose={() => setDeleting(null)}><div className="modal-actions"><Button variant="quiet" onClick={() => setDeleting(null)}>Keep note</Button><Button variant="danger" onClick={() => { actions.deleteNote(deleting.id); setDeleting(null); }}>Delete note</Button></div></Modal>}
  </>;
}

function resultMatch(text, query) { return String(text ?? "").toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()); }

export function SearchResultsPage({ query }) {
  const { workspace } = useWorkspace();
  const q = query.trim();
  const tasks = getAllTasks(workspace.projects);
  const groups = [
    { label: "Projects", icon: FolderKanban, items: workspace.projects.filter((item) => resultMatch(`${item.name} ${item.description} ${item.technology.join(" ")}`, q)).map((item) => ({ title: item.name, detail: item.description, href: `/projects/${item.id}`, label: item.status })) },
    { label: "Tasks", icon: ListTodo, items: tasks.filter((item) => resultMatch(`${item.title} ${item.description} ${item.projectName} ${item.tags.join(" ")}`, q)).map((item) => ({ title: item.title, detail: item.projectName, href: "/tasks", label: item.status })) },
    { label: "Notes", icon: NotebookPen, items: workspace.notes.filter((item) => resultMatch(`${item.title} ${item.content} ${item.tags.join(" ")}`, q)).map((item) => ({ title: item.title, detail: item.tags.join(" · "), href: "/notes", label: "Note" })) },
    { label: "Vocabulary", icon: BookOpen, items: workspace.languages.flatMap((language) => getWordSet(language.id).filter((word) => resultMatch(`${word.term} ${word.meaning} ${word.translation} ${word.example}`, q)).map((word) => ({ title: word.term, detail: `${language.name} · ${word.part} · ${word.meaning}`, href: `/languages/${language.id}`, label: word.level }))) },
    { label: "Languages", icon: Languages, items: workspace.languages.filter((item) => resultMatch(`${item.name} ${item.level} ${item.targetLevel}`, q)).map((item) => ({ title: item.name, detail: `${item.level} → ${item.targetLevel} · your settings`, href: `/languages/${item.id}`, label: "Journal" })) },
  ];
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);
  return <>
    <PageHeading eyebrow="FIND YOUR THREAD" title="Search" description={q ? `Results for “${q}” across your workspace.` : "Search projects, tasks, notes, and vocabulary."} />
    {q && total ? <div className="search-results-layout">{groups.filter((group) => group.items.length).map((group) => { const Icon = group.icon; return <section className="search-result-group" key={group.label}><div className="search-group-heading"><Icon size={15} /><h2>{group.label}</h2><span>{group.items.length}</span></div>{group.items.map((item) => <Link className="search-result-row" href={item.href} key={`${group.label}-${item.title}`}><span><strong>{item.title}</strong><small>{item.detail}</small></span><Badge>{item.label}</Badge><ArrowUpRight size={14} /></Link>)}</section>; })}</div> : <EmptyState icon={Sparkles} title={q ? "Nothing came up" : "Search all the little things"} description={q ? "Try a broader phrase or look in another section." : "Use the search button above or press / to find something."} />}
  </>;
}
