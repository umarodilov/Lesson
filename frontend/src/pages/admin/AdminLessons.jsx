import React, { useEffect, useMemo, useState } from "react";
import AdminTopbar from "../../components/AdminTopbar";
import {
  apiAdminLessons,
  apiCreateLesson,
  apiUpdateLesson,
  apiDeleteLesson,
} from "../../api/api";

function emptyLesson() {
  return {
    title: "",
    level: "A1",
    topic: "General",
    isPublished: true,
    vocab: [{ ru: "", tj: "", exampleRu: "", exampleTj: "" }],
    listening: { textRu: "", audioUrl: "" },
    quiz: Array.from({ length: 8 }).map(() => ({
      q: "",
      options: ["", "", ""],
      correct: 0,
    })),
  };
}

export default function AdminLessons() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // editor state
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [currentId, setCurrentId] = useState(null);
  const [form, setForm] = useState(emptyLesson());

  async function load() {
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const lessons = await apiAdminLessons();
      setList(lessons);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return list.filter((l) => {
      const txt = `${l.title || ""} ${l.level || ""} ${l.topic || ""}`.toLowerCase();
      return txt.includes(s);
    });
  }, [list, q]);

  function openCreate() {
    setMode("create");
    setCurrentId(null);
    setForm(emptyLesson());
    setOpen(true);
  }

  function openEdit(item) {
    setMode("edit");
    setCurrentId(item._id);

    setForm({
      title: item.title || "",
      level: item.level || "A1",
      topic: item.topic || "General",
      isPublished: !!item.isPublished,
      vocab: (item.vocab?.length
        ? item.vocab
        : [{ ru: "", tj: "", exampleRu: "", exampleTj: "" }]
      ).map((v) => ({
        ru: v.ru || "",
        tj: v.tj || "",
        exampleRu: v.exampleRu || "",
        exampleTj: v.exampleTj || "",
      })),
      listening: {
        textRu: item.listening?.textRu || "",
        audioUrl: item.listening?.audioUrl || "",
      },
      quiz:
        Array.isArray(item.quiz) && item.quiz.length
          ? item.quiz.map((qq) => ({
              q: qq.q || "",
              options: qq.options?.length ? qq.options.slice(0, 3) : ["", "", ""],
              correct: typeof qq.correct === "number" ? qq.correct : 0,
            }))
          : Array.from({ length: 8 }).map(() => ({
              q: "",
              options: ["", "", ""],
              correct: 0,
            })),
    });

    setOpen(true);
  }

  function close() {
    setOpen(false);
    setErr("");
    setMsg("");
  }

  function setField(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function setListening(key, val) {
    setForm((prev) => ({ ...prev, listening: { ...prev.listening, [key]: val } }));
  }

  // ---------- Vocab helpers ----------
  function setVocab(idx, key, val) {
    setForm((prev) => {
      const vocab = [...prev.vocab];
      vocab[idx] = { ...vocab[idx], [key]: val };
      return { ...prev, vocab };
    });
  }

  function addVocabRow() {
    setForm((prev) => ({
      ...prev,
      vocab: [...prev.vocab, { ru: "", tj: "", exampleRu: "", exampleTj: "" }],
    }));
  }

  function removeVocabRow(idx) {
    setForm((prev) => {
      const vocab = prev.vocab.filter((_, i) => i !== idx);
      return {
        ...prev,
        vocab: vocab.length ? vocab : [{ ru: "", tj: "", exampleRu: "", exampleTj: "" }],
      };
    });
  }

  // ---------- Quiz helpers (ARRAY) ----------
  function addQuizQuestion() {
    setForm((prev) => ({
      ...prev,
      quiz: [...prev.quiz, { q: "", options: ["", "", ""], correct: 0 }],
    }));
  }

  function removeQuizQuestion(i) {
    setForm((prev) => {
      const quiz = prev.quiz.filter((_, idx) => idx !== i);
      return {
        ...prev,
        quiz: quiz.length ? quiz : [{ q: "", options: ["", "", ""], correct: 0 }],
      };
    });
  }

  function setQuizField(i, key, val) {
    setForm((prev) => {
      const quiz = [...prev.quiz];
      quiz[i] = { ...quiz[i], [key]: val };
      return { ...prev, quiz };
    });
  }

  function setQuizOption(i, optIdx, val) {
    setForm((prev) => {
      const quiz = [...prev.quiz];
      const options = [...(quiz[i].options || ["", "", ""])];
      options[optIdx] = val;
      quiz[i] = { ...quiz[i], options };
      return { ...prev, quiz };
    });
  }

  function validateLesson(payload) {
    if (!payload.title?.trim()) return "Title required";

    const cleanVocab = (payload.vocab || [])
      .map((v) => ({
        ru: (v.ru || "").trim(),
        tj: (v.tj || "").trim(),
        exampleRu: (v.exampleRu || "").trim(),
        exampleTj: (v.exampleTj || "").trim(),
      }))
      .filter((v) => v.ru && v.tj);

    if (cleanVocab.length === 0) return "Vocab: ҳадди ақал 1 калима (ru+tj) лозим";

    const cleanQuiz = (payload.quiz || [])
      .map((qq) => ({
        q: (qq.q || "").trim(),
        options: (qq.options || []).map((x) => (x || "").trim()),
        correct: Number(qq.correct ?? 0),
      }))
      .filter((qq) => qq.q && qq.options.filter(Boolean).length >= 2);

    if (cleanQuiz.length < 8) return "Quiz: ҳадди ақал 8 савол пур кунед (бо 2+ вариант).";

    return null;
  }

  async function save() {
    setErr("");
    setMsg("");

    const payload = {
      title: (form.title || "").trim(),
      topic: (form.topic || "").trim(),
      level: form.level || "A1",
      isPublished: !!form.isPublished,
      vocab: (form.vocab || []).map((v) => ({
        ru: (v.ru || "").trim(),
        tj: (v.tj || "").trim(),
        exampleRu: (v.exampleRu || "").trim(),
        exampleTj: (v.exampleTj || "").trim(),
      })),
      listening: {
        textRu: (form.listening?.textRu || "").trim(),
        audioUrl: (form.listening?.audioUrl || "").trim(),
      },
      // ✅ QUIZ ARRAY payload
      quiz: (form.quiz || []).map((qq) => ({
        q: (qq.q || "").trim(),
        options: (qq.options || []).map((x) => (x || "").trim()),
        correct: Number(qq.correct ?? 0),
      })),
    };

    const vErr = validateLesson(payload);
    if (vErr) {
      setErr(vErr);
      return;
    }

    try {
      setLoading(true);
      if (mode === "create") {
        await apiCreateLesson(payload);
        setMsg("✅ Lesson created");
      } else {
        await apiUpdateLesson(currentId, payload);
        setMsg("✅ Lesson updated");
      }
      await load();
      setOpen(false);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function remove(item) {
    const ok = confirm(`Delete lesson: "${item.title}" ?`);
    if (!ok) return;

    setErr("");
    setMsg("");
    try {
      setLoading(true);
      await apiDeleteLesson(item._id);
      setMsg("✅ Deleted");
      await load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function togglePublish(item) {
    setErr("");
    setMsg("");
    try {
      setLoading(true);
      await apiUpdateLesson(item._id, { isPublished: !item.isPublished });
      setMsg("✅ Updated publish");
      await load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AdminTopbar />

      <main className="container py-4">
        {err && !open && <div className="alert alert-danger rounded-4">{err}</div>}
        {msg && !open && <div className="alert alert-success rounded-4">{msg}</div>}

        <div className="glass p-4">
          <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
            <div>
              <div className="small text-secondary">Lessons</div>
              <div className="h4 m-0" style={{ fontWeight: 900 }}>
                Дарсҳо (CRUD)
              </div>
              <div className="small text-secondary mt-1">Create / Edit / Delete / Publish</div>
            </div>

            <div className="d-flex gap-2 flex-wrap">
              <input
                className="form-control rounded-4"
                style={{ maxWidth: 320 }}
                placeholder="Search…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <button className="btn btn-primary rounded-4" onClick={openCreate}>
                + Создани дарс
              </button>
            </div>
          </div>

          <div className="table-responsive mt-3">
            <table className="table align-middle">
              <thead>
                <tr className="text-secondary">
                  <th>Title</th>
                  <th>Level</th>
                  <th>Topic</th>
                  <th>Vocab</th>
                  <th>Quiz</th>
                  <th>Status</th>
                  <th style={{ width: 260 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item._id}>
                    <td className="fw-bold">{item.title}</td>
                    <td className="text-secondary">{item.level || "A1"}</td>
                    <td className="text-secondary">{item.topic || "—"}</td>
                    <td className="text-secondary">{item.vocab?.length || 0}</td>
                    <td className="text-secondary">
                      {Array.isArray(item.quiz) ? item.quiz.length : 0}
                    </td>
                    <td>
                      <span
                        className={
                          "badge rounded-pill px-3 py-2 " +
                          (item.isPublished ? "bg-success" : "bg-secondary")
                        }
                      >
                        {item.isPublished ? "Published" : "Hidden"}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2 flex-wrap">
                        <button className="btn btn-soft rounded-4" onClick={() => openEdit(item)}>
                          Edit
                        </button>
                        <button
                          className={"btn rounded-4 " + (item.isPublished ? "btn-warning" : "btn-success")}
                          style={{ fontWeight: 900 }}
                          onClick={() => togglePublish(item)}
                        >
                          {item.isPublished ? "Unpublish" : "Publish"}
                        </button>
                        <button className="btn btn-danger rounded-4" onClick={() => remove(item)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {loading && <div className="text-secondary">Loading…</div>}
            {!loading && filtered.length === 0 && <div className="text-secondary">Натиҷа нест.</div>}
          </div>
        </div>

        {/* Editor Modal */}
        {open && (
          <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(15,23,42,.45)" }}>
            <div className="modal-dialog modal-xl modal-dialog-scrollable" role="document">
              <div className="modal-content rounded-4">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">
                    {mode === "create" ? "Create Lesson" : "Edit Lesson"}
                  </h5>
                  <button type="button" className="btn-close" onClick={close} />
                </div>

                <div className="modal-body">
                  {err && <div className="alert alert-danger rounded-4 py-2">{err}</div>}

                  <div className="row g-3">
                    {/* Left big */}
                    <div className="col-lg-8">
                      <div className="card-mini">
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label fw-bold">Title</label>
                            <input
                              className="form-control rounded-4"
                              value={form.title}
                              onChange={(e) => setField("title", e.target.value)}
                              placeholder="مث: Приветствия"
                            />
                          </div>

                          <div className="col-md-3">
                            <label className="form-label fw-bold">Level</label>
                            <select
                              className="form-select rounded-4"
                              value={form.level}
                              onChange={(e) => setField("level", e.target.value)}
                            >
                              <option>A1</option>
                              <option>A2</option>
                              <option>B1</option>
                              <option>B2</option>
                            </select>
                          </div>

                          <div className="col-md-3">
                            <label className="form-label fw-bold">Published</label>
                            <select
                              className="form-select rounded-4"
                              value={form.isPublished ? "yes" : "no"}
                              onChange={(e) => setField("isPublished", e.target.value === "yes")}
                            >
                              <option value="yes">Yes</option>
                              <option value="no">No</option>
                            </select>
                          </div>

                          <div className="col-md-6">
                            <label className="form-label fw-bold">Topic</label>
                            <input
                              className="form-control rounded-4"
                              value={form.topic}
                              onChange={(e) => setField("topic", e.target.value)}
                              placeholder="General / Start / Travel ..."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Vocab */}
                      <div className="card-mini mt-3">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="fw-bold">Vocab (RU/TJ)</div>
                          <button className="btn btn-soft rounded-4" onClick={addVocabRow}>
                            + Add row
                          </button>
                        </div>

                        <div className="table-responsive mt-2">
                          <table className="table align-middle">
                            <thead>
                              <tr className="text-secondary">
                                <th>RU</th>
                                <th>TJ</th>
                                <th>Example RU</th>
                                <th>Example TJ</th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              {form.vocab.map((v, idx) => (
                                <tr key={idx}>
                                  <td>
                                    <input
                                      className="form-control rounded-4"
                                      value={v.ru}
                                      onChange={(e) => setVocab(idx, "ru", e.target.value)}
                                      placeholder="Привет"
                                    />
                                  </td>
                                  <td>
                                    <input
                                      className="form-control rounded-4"
                                      value={v.tj}
                                      onChange={(e) => setVocab(idx, "tj", e.target.value)}
                                      placeholder="Салом"
                                    />
                                  </td>
                                  <td>
                                    <input
                                      className="form-control rounded-4"
                                      value={v.exampleRu}
                                      onChange={(e) => setVocab(idx, "exampleRu", e.target.value)}
                                      placeholder="Привет! Как дела?"
                                    />
                                  </td>
                                  <td>
                                    <input
                                      className="form-control rounded-4"
                                      value={v.exampleTj}
                                      onChange={(e) => setVocab(idx, "exampleTj", e.target.value)}
                                      placeholder="Салом! Чӣ хел?"
                                    />
                                  </td>
                                  <td>
                                    <button
                                      className="btn btn-danger rounded-4"
                                      onClick={() => removeVocabRow(idx)}
                                      title="Remove"
                                    >
                                      ✕
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="small text-secondary">
                          Қоида: ҳадди ақал 1 сатри vocab бо RU+TJ лозим.
                        </div>
                      </div>

                      {/* QUIZ ARRAY EDITOR */}
                      <div className="card-mini mt-3">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="fw-bold">Quiz (8–10+)</div>
                          <button className="btn btn-soft rounded-4" onClick={addQuizQuestion}>
                            + Add question
                          </button>
                        </div>

                        <div className="small text-secondary mt-1">
                          Ҳадди ақал 8 савол пур кунед. Correct = Option 1/2/3
                        </div>

                        <div className="mt-3 d-grid gap-3">
                          {(form.quiz || []).map((qq, i) => (
                            <div
                              key={i}
                              className="p-3 rounded-4"
                              style={{ background: "rgba(15,23,42,.04)" }}
                            >
                              <div className="d-flex justify-content-between align-items-center">
                                <div className="fw-bold">Question {i + 1}</div>
                                <button
                                  className="btn btn-danger rounded-4"
                                  onClick={() => removeQuizQuestion(i)}
                                  title="Remove question"
                                >
                                  ✕
                                </button>
                              </div>

                              <label className="form-label mt-2 fw-bold small">Question</label>
                              <input
                                className="form-control rounded-4"
                                value={qq.q}
                                onChange={(e) => setQuizField(i, "q", e.target.value)}
                                placeholder="Савол..."
                              />

                              <label className="form-label mt-2 fw-bold small">Options</label>
                              {[0, 1, 2].map((optIdx) => (
                                <input
                                  key={optIdx}
                                  className="form-control rounded-4 mt-2"
                                  value={(qq.options || [])[optIdx] || ""}
                                  onChange={(e) => setQuizOption(i, optIdx, e.target.value)}
                                  placeholder={`Option ${optIdx + 1}`}
                                />
                              ))}

                              <label className="form-label mt-3 fw-bold small">Correct option</label>
                              <select
                                className="form-select rounded-4"
                                value={qq.correct ?? 0}
                                onChange={(e) => setQuizField(i, "correct", Number(e.target.value))}
                              >
                                <option value={0}>Option 1</option>
                                <option value={1}>Option 2</option>
                                <option value={2}>Option 3</option>
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="col-lg-4">
                      <div className="card-mini">
                        <div className="fw-bold">Listening</div>

                        <label className="form-label mt-2 fw-bold small">Text (RU)</label>
                        <textarea
                          className="form-control rounded-4"
                          rows={4}
                          value={form.listening.textRu}
                          onChange={(e) => setListening("textRu", e.target.value)}
                          placeholder="Здравствуйте, как вас зовут?"
                        />

                        <label className="form-label mt-2 fw-bold small">Audio URL (optional)</label>
                        <input
                          className="form-control rounded-4"
                          value={form.listening.audioUrl}
                          onChange={(e) => setListening("audioUrl", e.target.value)}
                          placeholder="https://..."
                        />
                      </div>

                      <div className="alert alert-info rounded-4 mt-3 mb-0">
                        User дар app → “Generate Cards” пахш мекунад ва флешкортҳо автоматӣ аз vocab месозад.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="btn btn-soft rounded-4" onClick={close}>
                    Close
                  </button>
                  <button className="btn btn-primary rounded-4" onClick={save} disabled={loading}>
                    {loading ? "..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

// import React, { useEffect, useMemo, useState } from "react";
// import AdminTopbar from "../../components/AdminTopbar";
// import {
//   apiAdminLessons,
//   apiCreateLesson,
//   apiUpdateLesson,
//   apiDeleteLesson,
// } from "../../api/api";

// function emptyLesson() {
//   return {
//     title: "",
//     level: "A1",
//     topic: "General",
//     isPublished: true,
//     vocab: [{ ru: "", tj: "", exampleRu: "", exampleTj: "" }],
//     listening: { textRu: "", audioUrl: "" },
//     quiz: Array.from({ length: 8 }).map((_, i) => ({
//     q: "",
//     options: ["", "", ""],
//     correct: 0
//     })),
//     // quiz: { q: "", options: ["", "", ""], correct: 0 },
//   };
// }

// export default function AdminLessons() {
//   const [list, setList] = useState([]);
//   const [q, setQ] = useState("");
//   const [loading, setLoading] = useState(false);

//   const [err, setErr] = useState("");
//   const [msg, setMsg] = useState("");

//   // editor state
//   const [open, setOpen] = useState(false);
//   const [mode, setMode] = useState("create"); // create | edit
//   const [currentId, setCurrentId] = useState(null);
//   const [form, setForm] = useState(emptyLesson());

//   async function load() {
//     setErr(""); setMsg("");
//     setLoading(true);
//     try {
//       const lessons = await apiAdminLessons();
//       setList(lessons);
//     } catch (e) {
//       setErr(e.message);
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => { load(); }, []);

//   const filtered = useMemo(() => {
//     const s = q.toLowerCase();
//     return list.filter(l => {
//       const txt = `${l.title || ""} ${l.level || ""} ${l.topic || ""}`.toLowerCase();
//       return txt.includes(s);
//     });
//   }, [list, q]);

//   function openCreate() {
//     setMode("create");
//     setCurrentId(null);
//     setForm(emptyLesson());
//     setOpen(true);
//   }

//   function openEdit(item) {
//     setMode("edit");
//     setCurrentId(item._id);
//     // normalize missing fields
//     setForm({
//       title: item.title || "",
//       level: item.level || "A1",
//       topic: item.topic || "General",
//       isPublished: !!item.isPublished,
//       vocab: (item.vocab?.length ? item.vocab : [{ ru: "", tj: "", exampleRu: "", exampleTj: "" }]).map(v => ({
//         ru: v.ru || "",
//         tj: v.tj || "",
//         exampleRu: v.exampleRu || "",
//         exampleTj: v.exampleTj || "",
//       })),
//       listening: {
//         textRu: item.listening?.textRu || "",
//         audioUrl: item.listening?.audioUrl || "",
//       },

//       quiz: Array.isArray(item.quiz) && item.quiz.length
//         ? item.quiz.map(q => ({
//             q: q.q || "",
//             options: q.options?.length ? q.options : ["", "", ""],
//             correct: typeof q.correct === "number" ? q.correct : 0
//             }))
//         : Array.from({ length: 8 }).map(() => ({ q: "", options: ["", "", ""], correct: 0 })),

//     //   quiz: {
//     //     q: item.quiz?.q || "",
//     //     options: item.quiz?.options?.length ? item.quiz.options : ["", "", ""],
//     //     correct: typeof item.quiz?.correct === "number" ? item.quiz.correct : 0,
//     //   },

//     });
//     setOpen(true);
//   }

//   function close() {
//     setOpen(false);
//     setErr("");
//     setMsg("");
//   }

//   function setField(key, val) {
//     setForm(prev => ({ ...prev, [key]: val }));
//   }

//   function setListening(key, val) {
//     setForm(prev => ({ ...prev, listening: { ...prev.listening, [key]: val } }));
//   }

//   function setQuiz(key, val) {
//     setForm(prev => ({ ...prev, quiz: { ...prev.quiz, [key]: val } }));
//   }

//   function setQuizOption(idx, val) {
//     setForm(prev => {
//       const options = [...(prev.quiz.options || [])];
//       options[idx] = val;
//       return { ...prev, quiz: { ...prev.quiz, options } };
//     });
//   }

//   function setVocab(idx, key, val) {
//     setForm(prev => {
//       const vocab = [...prev.vocab];
//       vocab[idx] = { ...vocab[idx], [key]: val };
//       return { ...prev, vocab };
//     });
//   }

//   function addVocabRow() {
//     setForm(prev => ({
//       ...prev,
//       vocab: [...prev.vocab, { ru: "", tj: "", exampleRu: "", exampleTj: "" }],
//     }));
//   }

//   function removeVocabRow(idx) {
//     setForm(prev => {
//       const vocab = prev.vocab.filter((_, i) => i !== idx);
//       return { ...prev, vocab: vocab.length ? vocab : [{ ru: "", tj: "", exampleRu: "", exampleTj: "" }] };
//     });
//   }

//   function validateLesson(payload) {
//     if (!payload.title?.trim()) return "Title required";
//     const cleanVocab = (payload.vocab || [])
//       .map(v => ({
//         ru: (v.ru || "").trim(),
//         tj: (v.tj || "").trim(),
//         exampleRu: (v.exampleRu || "").trim(),
//         exampleTj: (v.exampleTj || "").trim(),
//       }))
//       .filter(v => v.ru && v.tj);

//     if (cleanVocab.length === 0) return "Vocab: ҳадди ақал 1 калима (ru+tj) лозим";
//     return null;
//   }

//   async function save() {
//     setErr(""); setMsg("");
//     const payload = {
//       ...form,
//       title: form.title.trim(),
//       topic: (form.topic || "").trim(),
//       level: form.level || "A1",
//       isPublished: !!form.isPublished,
//       vocab: (form.vocab || []).map(v => ({
//         ru: (v.ru || "").trim(),
//         tj: (v.tj || "").trim(),
//         exampleRu: (v.exampleRu || "").trim(),
//         exampleTj: (v.exampleTj || "").trim(),
//       })),
//       listening: {
//         textRu: (form.listening?.textRu || "").trim(),
//         audioUrl: (form.listening?.audioUrl || "").trim(),
//       },
//       quiz: {
//         q: (form.quiz?.q || "").trim(),
//         options: (form.quiz?.options || []).map(x => (x || "").trim()),
//         correct: Number(form.quiz?.correct || 0),
//       },
//     };

//     const vErr = validateLesson(payload);
//     if (vErr) { setErr(vErr); return; }

//     try {
//       setLoading(true);
//       if (mode === "create") {
//         await apiCreateLesson(payload);
//         setMsg("✅ Lesson created");
//       } else {
//         await apiUpdateLesson(currentId, payload);
//         setMsg("✅ Lesson updated");
//       }
//       await load();
//       setOpen(false);
//     } catch (e) {
//       setErr(e.message);
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function remove(item) {
//     const ok = confirm(`Delete lesson: "${item.title}" ?`);
//     if (!ok) return;
//     setErr(""); setMsg("");
//     try {
//       setLoading(true);
//       await apiDeleteLesson(item._id);
//       setMsg("✅ Deleted");
//       await load();
//     } catch (e) {
//       setErr(e.message);
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function togglePublish(item) {
//     setErr(""); setMsg("");
//     try {
//       setLoading(true);
//       await apiUpdateLesson(item._id, { isPublished: !item.isPublished });
//       setMsg("✅ Updated publish");
//       await load();
//     } catch (e) {
//       setErr(e.message);
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <>
//       <AdminTopbar />
//       <main className="container py-4">
//         {err && !open && <div className="alert alert-danger rounded-4">{err}</div>}
//         {msg && !open && <div className="alert alert-success rounded-4">{msg}</div>}

//         <div className="glass p-4">
//           <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
//             <div>
//               <div className="small text-secondary">Lessons</div>
//               <div className="h4 m-0" style={{ fontWeight: 900 }}>Дарсҳо (CRUD)</div>
//               <div className="small text-secondary mt-1">Create / Edit / Delete / Publish</div>
//             </div>

//             <div className="d-flex gap-2 flex-wrap">
//               <input
//                 className="form-control rounded-4"
//                 style={{ maxWidth: 320 }}
//                 placeholder="Search…"
//                 value={q}
//                 onChange={(e) => setQ(e.target.value)}
//               />
//               <button className="btn btn-primary rounded-4" onClick={openCreate}>
//                 + Создани дарс
//               </button>
//             </div>
//           </div>

//           <div className="table-responsive mt-3">
//             <table className="table align-middle">
//               <thead>
//                 <tr className="text-secondary">
//                   <th>Title</th>
//                   <th>Level</th>
//                   <th>Topic</th>
//                   <th>Vocab</th>
//                   <th>Status</th>
//                   <th style={{ width: 260 }}>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filtered.map(item => (
//                   <tr key={item._id}>
//                     <td className="fw-bold">{item.title}</td>
//                     <td className="text-secondary">{item.level || "A1"}</td>
//                     <td className="text-secondary">{item.topic || "—"}</td>
//                     <td className="text-secondary">{item.vocab?.length || 0}</td>
//                     <td>
//                       <span className={"badge rounded-pill px-3 py-2 " + (item.isPublished ? "bg-success" : "bg-secondary")}>
//                         {item.isPublished ? "Published" : "Hidden"}
//                       </span>
//                     </td>
//                     <td>
//                       <div className="d-flex gap-2 flex-wrap">
//                         <button className="btn btn-soft rounded-4" onClick={() => openEdit(item)}>
//                           Edit
//                         </button>
//                         <button
//                           className={"btn rounded-4 " + (item.isPublished ? "btn-warning" : "btn-success")}
//                           style={{ fontWeight: 900 }}
//                           onClick={() => togglePublish(item)}
//                         >
//                           {item.isPublished ? "Unpublish" : "Publish"}
//                         </button>
//                         <button className="btn btn-danger rounded-4" onClick={() => remove(item)}>
//                           Delete
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             {loading && <div className="text-secondary">Loading…</div>}
//             {!loading && filtered.length === 0 && <div className="text-secondary">Натиҷа нест.</div>}
//           </div>
//         </div>

//         {/* Editor Modal */}
//         {open && (
//           <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(15,23,42,.45)" }}>
//             <div className="modal-dialog modal-xl modal-dialog-scrollable" role="document">
//               <div className="modal-content rounded-4">
//                 <div className="modal-header">
//                   <h5 className="modal-title fw-bold">
//                     {mode === "create" ? "Create Lesson" : "Edit Lesson"}
//                   </h5>
//                   <button type="button" className="btn-close" onClick={close} />
//                 </div>

//                 <div className="modal-body">
//                   {err && <div className="alert alert-danger rounded-4 py-2">{err}</div>}

//                   <div className="row g-3">
//                     <div className="col-lg-8">
//                       <div className="card-mini">
//                         <div className="row g-3">
//                           <div className="col-md-6">
//                             <label className="form-label fw-bold">Title</label>
//                             <input
//                               className="form-control rounded-4"
//                               value={form.title}
//                               onChange={(e) => setField("title", e.target.value)}
//                               placeholder="مث: Приветствия"
//                             />
//                           </div>

//                           <div className="col-md-3">
//                             <label className="form-label fw-bold">Level</label>
//                             <select
//                               className="form-select rounded-4"
//                               value={form.level}
//                               onChange={(e) => setField("level", e.target.value)}
//                             >
//                               <option>A1</option><option>A2</option><option>B1</option><option>B2</option>
//                             </select>
//                           </div>

//                           <div className="col-md-3">
//                             <label className="form-label fw-bold">Published</label>
//                             <select
//                               className="form-select rounded-4"
//                               value={form.isPublished ? "yes" : "no"}
//                               onChange={(e) => setField("isPublished", e.target.value === "yes")}
//                             >
//                               <option value="yes">Yes</option>
//                               <option value="no">No</option>
//                             </select>
//                           </div>

//                           <div className="col-md-6">
//                             <label className="form-label fw-bold">Topic</label>
//                             <input
//                               className="form-control rounded-4"
//                               value={form.topic}
//                               onChange={(e) => setField("topic", e.target.value)}
//                               placeholder="General / Start / Travel ..."
//                             />
//                           </div>
//                         </div>
//                       </div>

//                       <div className="card-mini mt-3">
//                         <div className="d-flex align-items-center justify-content-between">
//                           <div className="fw-bold">Vocab (RU/TJ)</div>
//                           <button className="btn btn-soft rounded-4" onClick={addVocabRow}>
//                             + Add row
//                           </button>
//                         </div>

//                         <div className="table-responsive mt-2">
//                           <table className="table align-middle">
//                             <thead>
//                               <tr className="text-secondary">
//                                 <th>RU</th>
//                                 <th>TJ</th>
//                                 <th>Example RU</th>
//                                 <th>Example TJ</th>
//                                 <th></th>
//                               </tr>
//                             </thead>
//                             <tbody>
//                               {form.vocab.map((v, idx) => (
//                                 <tr key={idx}>
//                                   <td>
//                                     <input className="form-control rounded-4"
//                                       value={v.ru}
//                                       onChange={(e) => setVocab(idx, "ru", e.target.value)}
//                                       placeholder="Привет"
//                                     />
//                                   </td>
//                                   <td>
//                                     <input className="form-control rounded-4"
//                                       value={v.tj}
//                                       onChange={(e) => setVocab(idx, "tj", e.target.value)}
//                                       placeholder="Салом"
//                                     />
//                                   </td>
//                                   <td>
//                                     <input className="form-control rounded-4"
//                                       value={v.exampleRu}
//                                       onChange={(e) => setVocab(idx, "exampleRu", e.target.value)}
//                                       placeholder="Привет! Как дела?"
//                                     />
//                                   </td>
//                                   <td>
//                                     <input className="form-control rounded-4"
//                                       value={v.exampleTj}
//                                       onChange={(e) => setVocab(idx, "exampleTj", e.target.value)}
//                                       placeholder="Салом! Чӣ хел?"
//                                     />
//                                   </td>
//                                   <td>
//                                     <button className="btn btn-danger rounded-4"
//                                       onClick={() => removeVocabRow(idx)}
//                                       title="Remove"
//                                     >
//                                       ✕
//                                     </button>
//                                   </td>
//                                 </tr>
//                               ))}
//                             </tbody>
//                           </table>
//                         </div>

//                         <div className="small text-secondary">
//                           Қоида: ҳадди ақал 1 сатри vocab бо RU+TJ лозим.
//                         </div>
//                       </div>
//                     </div>

//                     <div className="col-lg-4">
//                       <div className="card-mini">
//                         <div className="fw-bold">Listening</div>
//                         <label className="form-label mt-2 fw-bold small">Text (RU)</label>
//                         <textarea
//                           className="form-control rounded-4"
//                           rows={4}
//                           value={form.listening.textRu}
//                           onChange={(e) => setListening("textRu", e.target.value)}
//                           placeholder="Здравствуйте, как вас зовут?"
//                         />
//                         <label className="form-label mt-2 fw-bold small">Audio URL (optional)</label>
//                         <input
//                           className="form-control rounded-4"
//                           value={form.listening.audioUrl}
//                           onChange={(e) => setListening("audioUrl", e.target.value)}
//                           placeholder="https://..."
//                         />
//                       </div>

//                       <div className="card-mini mt-3">
//                         <div className="fw-bold">Quiz</div>
//                         <label className="form-label mt-2 fw-bold small">Question</label>
//                         <input
//                           className="form-control rounded-4"
//                           value={form.quiz.q}
//                           onChange={(e) => setQuiz("q", e.target.value)}
//                           placeholder="«Спасибо» ба тоҷикӣ чӣ мешавад?"
//                         />

//                         <label className="form-label mt-2 fw-bold small">Options</label>
//                         {[0,1,2].map(i => (
//                           <input
//                             key={i}
//                             className="form-control rounded-4 mt-2"
//                             value={form.quiz.options[i] || ""}
//                             onChange={(e) => setQuizOption(i, e.target.value)}
//                             placeholder={`Option ${i+1}`}
//                           />
//                         ))}

//                         <label className="form-label mt-3 fw-bold small">Correct index</label>
//                         <select
//                           className="form-select rounded-4"
//                           value={form.quiz.correct}
//                           onChange={(e) => setQuiz("correct", Number(e.target.value))}
//                         >
//                           <option value={0}>Option 1</option>
//                           <option value={1}>Option 2</option>
//                           <option value={2}>Option 3</option>
//                         </select>
//                       </div>

//                       <div className="alert alert-info rounded-4 mt-3 mb-0">
//                         User дар app → “Generate Cards” пахш мекунад ва флешкортҳо автоматӣ аз vocab месозад.
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="modal-footer">
//                   <button className="btn btn-soft rounded-4" onClick={close}>
//                     Close
//                   </button>
//                   <button className="btn btn-primary rounded-4" onClick={save} disabled={loading}>
//                     {loading ? "..." : "Save"}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//       </main>
//     </>
//   );
// }