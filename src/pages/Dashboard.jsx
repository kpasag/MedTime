import { useEffect, useRef, useState } from "react";
import { auth } from "../../firebase.config";
import "./Dashboard.css";

function Dashboard() {
  const [currentPills, setCurrentPills] = useState([
    {
      id: 1,
      name: "John Doe",
      medicine: "Aspirin",
      time: "08:00 AM",
      status: "missed",
    },
    {
      id: 2,
      name: "Jane Smith",
      medicine: "Vitamin D",
      time: "01:00 PM",
      status: "taken",
    },
  ]);

  const notifications = [
    { id: 1, message: "Aspirin taken", date: "Jan 15, 08:05" },
    { id: 2, message: "Vitamin D missed", date: "Jan 14, 13:30" },
    { id: 3, message: "New Vitamin C scheduled", date: "Jan 13, 09:00" },
  ];

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Link caregiver/patient modal state
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkType, setLinkType] = useState(''); // 'caregiver' or 'patient'
  const [linkEmail, setLinkEmail] = useState('');
  const [linkError, setLinkError] = useState('');
  const [linkSuccess, setLinkSuccess] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  const [pillForm, setPillForm] = useState({
    pillName: "",
    dosage: "",
    takeTimes: [""], // multiple times per day
    intervalDays: 1, // repeat every N days
  });

  // RxNorm base (US NLM)
  const RX_BASE = "https://rxnav.nlm.nih.gov/REST/";

  // Autocomplete / search state
  const [pillQuery, setPillQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState("");
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  const abortRef = useRef(null);
  const cacheRef = useRef(new Map()); // key: query -> suggestions array

  const chooseSuggestion = (s) => {
    setPillQuery(s.label);
    setPillForm((prev) => ({ ...prev, pillName: s.label }));
    setIsSuggestionsOpen(false);
  };

  const totalPills = currentPills.length;

  const openAddModal = () => setIsAddModalOpen(true);

  const closeAddModal = () => {
    setIsAddModalOpen(false);

    // reset form + search UI state
    setPillForm({ pillName: "", dosage: "", takeTimes: [""], intervalDays: 1 });
    setPillQuery("");
    setSuggestions([]);
    setSuggestionsError("");
    setIsSuggestionsOpen(false);
    setIsLoadingSuggestions(false);

    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  };

  // Link modal functions
  const openLinkModal = (type) => {
    setLinkType(type);
    setLinkEmail('');
    setLinkError('');
    setLinkSuccess('');
    setIsLinkModalOpen(true);
  };

  const closeLinkModal = () => {
    setIsLinkModalOpen(false);
    setLinkType('');
    setLinkEmail('');
    setLinkError('');
    setLinkSuccess('');
  };

  const handleLinkUser = async (e) => {
    e.preventDefault();
    if (!linkEmail.trim()) {
      setLinkError('Please enter an email');
      return;
    }

    setIsLinking(true);
    setLinkError('');
    setLinkSuccess('');

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        setLinkError('Not authenticated');
        return;
      }

      const endpoint = linkType === 'caregiver' ? 'link-caregiver' : 'link-patient';
      const res = await fetch(`http://localhost:3000/api/users/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: linkEmail.toLowerCase() })
      });

      const data = await res.json();

      if (!res.ok) {
        setLinkError(data.error || 'Failed to link user');
        return;
      }

      setLinkSuccess(`${linkType === 'caregiver' ? 'Caregiver' : 'Patient'} linked successfully!`);
      setLinkEmail('');
    } catch (err) {
      setLinkError(err.message || 'Failed to link user');
    } finally {
      setIsLinking(false);
    }
  };

  useEffect(() => {
    if (!isAddModalOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeAddModal();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddModalOpen]);

  const normalizeConceptProperties = (cp) => {
    if (!cp) return [];
    return Array.isArray(cp) ? cp : [cp];
  };

  const buildSuggestionsFromDrugs = (data) => {
    const groups = data?.drugGroup?.conceptGroup;
    const groupsArr = Array.isArray(groups) ? groups : groups ? [groups] : [];

    // Prefer branded products first (SBD, BPCK), then clinical (SCD, GPCK), then anything else
    const order = ["SBD", "BPCK", "SCD", "GPCK"];
    const sortedGroups = [...groupsArr].sort((a, b) => {
      const ai = order.indexOf(a.tty);
      const bi = order.indexOf(b.tty);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });

    const out = [];
    for (const g of sortedGroups) {
      const cps = normalizeConceptProperties(g.conceptProperties);
      for (const c of cps) {
        if (!c?.name || !c?.rxcui) continue;
        out.push({
          id: c.rxcui,
          label: c.name,
          tty: g.tty || c.tty,
          psn: c.psn || "",
        });
      }
    }

    // Dedup by label (case-insensitive), keep first occurrence
    const seen = new Set();
    const deduped = [];
    for (const s of out) {
      const key = s.label.toUpperCase();
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(s);
      if (deduped.length >= 10) break;
    }

    return deduped;
  };

  const buildSuggestionsFromApprox = (data) => {
    const candidates = data?.approximateGroup?.candidate;
    const arr = Array.isArray(candidates)
      ? candidates
      : candidates
        ? [candidates]
        : [];

    const out = arr
      .map((c) => ({
        id: c.rxaui ? `${c.rxcui}-${c.rxaui}` : c.rxcui,
        label: c.name || "",
        rxcui: c.rxcui || "",
        score: c.score || "",
        rank: c.rank || "",
        source: c.source || "",
      }))
      .filter((x) => x.label);

    const seen = new Set();
    const deduped = [];
    for (const s of out) {
      const key = s.label.toUpperCase();
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(s);
      if (deduped.length >= 10) break;
    }

    return deduped;
  };

  useEffect(() => {
    const q = pillQuery.trim();
    setSuggestionsError("");

    if (!isAddModalOpen) return;

    // Feel free to change to 3 if you want fewer calls
    if (q.length < 2) {
      setSuggestions([]);
      setIsSuggestionsOpen(false);
      return;
    }

    // cached results
    const cached = cacheRef.current.get(q.toLowerCase());
    if (cached) {
      setSuggestions(cached);
      setIsSuggestionsOpen(true);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsLoadingSuggestions(true);

        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        // 1) Try drugs.json first (best for "brand -> different strengths/forms")
        const drugsUrl = new URL(`${RX_BASE}drugs.json`);
        drugsUrl.searchParams.set("name", q);
        // Optional: prescribable name field
        drugsUrl.searchParams.set("expand", "psn");

        const drugsRes = await fetch(drugsUrl.toString(), {
          method: "GET",
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (drugsRes.ok) {
          const drugsJson = await drugsRes.json();
          const s1 = buildSuggestionsFromDrugs(drugsJson?.rxnormdata);

          if (s1.length > 0) {
            cacheRef.current.set(q.toLowerCase(), s1);
            setSuggestions(s1);
            setIsSuggestionsOpen(true);
            return;
          }
        }

        // 2) Fallback: approximateTerm (helps when drugs.json returns nothing)
        const approxUrl = new URL(`${RX_BASE}approximateTerm.json`);
        approxUrl.searchParams.set("term", q);
        approxUrl.searchParams.set("maxEntries", "20");
        approxUrl.searchParams.set("option", "1"); // Active concepts

        const approxRes = await fetch(approxUrl.toString(), {
          method: "GET",
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (!approxRes.ok)
          throw new Error(`RxNorm search failed (${approxRes.status})`);

        const approxJson = await approxRes.json();
        const s2 = buildSuggestionsFromApprox(approxJson?.rxnormdata);

        cacheRef.current.set(q.toLowerCase(), s2);
        setSuggestions(s2);
        setIsSuggestionsOpen(true);
      } catch (err) {
        if (err?.name === "AbortError") return;
        setSuggestions([]);
        setIsSuggestionsOpen(true);
        setSuggestionsError(err?.message || "Failed to load suggestions");
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [pillQuery, isAddModalOpen, RX_BASE]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPillForm((prev) => ({
      ...prev,
      [name]: name === "intervalDays" ? Number(value) : value,
    }));
  };

  const updateTimeAtIndex = (index, value) => {
    setPillForm((prev) => {
      const next = [...prev.takeTimes];
      next[index] = value;
      return { ...prev, takeTimes: next };
    });
  };

  const addTimeField = () => {
    setPillForm((prev) => ({ ...prev, takeTimes: [...prev.takeTimes, ""] }));
  };

  const removeTimeField = (index) => {
    setPillForm((prev) => {
      const next = prev.takeTimes.filter((_, i) => i !== index);
      return { ...prev, takeTimes: next.length ? next : [""] };
    });
  };

  const formatTime = (value) => {
    if (!value) return "";
    const d = new Date(`1970-01-01T${value}:00`);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const frequencyText = (days) => {
    if (days === 1) return "daily";
    return `every ${days} days`;
  };

  const updateDatabasePills = async (pillReminder) => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
      console.error('No auth token available');
      return;
    }

    await fetch('http://localhost:3000/api/users', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(pillReminder)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const pillName = pillForm.pillName.trim();
    const dosage = pillForm.dosage.trim();
    const intervalDays = pillForm.intervalDays;

    const cleanedTimes = pillForm.takeTimes
      .map((t) => t.trim())
      .filter(Boolean);

    if (
      !pillName ||
      !dosage ||
      !intervalDays ||
      intervalDays < 1 ||
      cleanedTimes.length === 0
    )
      return;

    const timesLabel = cleanedTimes.map(formatTime).join(", ");
    // const timeLabel = `${timesLabel} (${frequencyText(intervalDays)})`;

    const newPill = {
      createdAt: Date.now(),
      name: pillName,
      timesPerDay: timesLabel,
      repeatFrequency: intervalDays,
      dosage: dosage
    };

    updateDatabasePills(newPill);

    setCurrentPills((prev) => [...prev, newPill]);
    closeAddModal();
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="header-actions">
          <button
            className="add-link-btn"
            onClick={() => openLinkModal('caregiver')}
          >
            + Add Caregiver
          </button>
          <button
            className="add-link-btn"
            onClick={() => openLinkModal('patient')}
          >
            + Add Patient
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="current-pills-section">
          <h2>
            Current Pills{" "}
            <span style={{ fontWeight: 500, fontSize: "0.95rem" }}>
              ({totalPills} total)
            </span>
          </h2>

          <div className="pill-cards-container">
            {currentPills.map(({ id, name, medicine, time, status }) => (
              <div key={id} className="pill-card">
                <div className="pill-header">
                  <span className="medicine-name">{medicine}</span>
                  <span className={`status-icon ${status}`}>
                    {status === "taken" && "✓"}
                    {status === "missed" && "✕"}
                    {status === "pending" && "..."}
                  </span>
                </div>

                <div className="pill-details">
                  <div className="person-name">{name}</div>
                  <div className="pill-time">{time}</div>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="pill-card add-card"
              onClick={openAddModal}
            >
              <span className="plus-sign">＋</span>
              <div>Add Pill</div>
            </button>
          </div>
        </section>

        <section className="notifications-section">
          <h2>Notifications</h2>
          {notifications.map(({ id, message, date }) => (
            <div key={id} className="notification-item">
              <div>{message}</div>
              <small>{date}</small>
            </div>
          ))}
        </section>
      </main>

      {isAddModalOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeAddModal();
          }}
        >
          <div className="modal" role="dialog" aria-modal="true">
            <div className="modal-header">
              <h3 className="modal-title">Add Pill</h3>
              <button
                type="button"
                className="modal-close"
                onClick={closeAddModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form className="modal-body" onSubmit={handleSubmit}>
              <label className="modal-label" style={{ position: "relative" }}>
                Pill / Brand search
                <input
                  className="modal-input"
                  name="pillName"
                  value={pillQuery}
                  onChange={(e) => {
                    const v = e.target.value;
                    setPillQuery(v);
                    setPillForm((prev) => ({ ...prev, pillName: v }));

                    if (v.trim().length >= 2) setIsSuggestionsOpen(true);
                  }}
                  onFocus={() => {
                    if (pillQuery.trim().length >= 2)
                      setIsSuggestionsOpen(true);
                  }}
                  onBlur={() => {
                    setTimeout(() => setIsSuggestionsOpen(false), 150);
                  }}
                  placeholder="Start typing (e.g., Tylenol)"
                  autoComplete="off"
                  autoFocus
                  required
                />
                {isSuggestionsOpen && (
                  <div className="autocomplete-dropdown">
                    {isLoadingSuggestions && (
                      <div className="autocomplete-item">Loading...</div>
                    )}

                    {!isLoadingSuggestions && suggestionsError && (
                      <div className="autocomplete-item">
                        {suggestionsError}
                      </div>
                    )}

                    {!isLoadingSuggestions &&
                      !suggestionsError &&
                      suggestions.length === 0 && (
                        <div className="autocomplete-item">No matches</div>
                      )}

                    {!isLoadingSuggestions &&
                      !suggestionsError &&
                      suggestions.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          className="autocomplete-item autocomplete-button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => chooseSuggestion(s)}
                        >
                          {s.label}
                        </button>
                      ))}
                  </div>
                )}
              </label>

              <label className="modal-label">
                Dosage
                <input
                  className="modal-input"
                  name="dosage"
                  value={pillForm.dosage}
                  onChange={handleChange}
                  placeholder="e.g., 81 mg"
                  required
                />
              </label>

              <label className="modal-label">
                Times per day
                <div className="times-list">
                  {pillForm.takeTimes.map((t, idx) => (
                    <div key={idx} className="time-row">
                      <input
                        className="modal-input"
                        type="time"
                        value={t}
                        onChange={(e) => updateTimeAtIndex(idx, e.target.value)}
                        required={idx === 0}
                      />
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => removeTimeField(idx)}
                        aria-label="Remove time"
                        title="Remove time"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="link-btn"
                    onClick={addTimeField}
                  >
                    + Add another time
                  </button>
                </div>
              </label>

              <label className="modal-label">
                Repeat
                <div className="repeat-row">
                  <span>Once every</span>
                  <input
                    className="modal-input repeat-days"
                    name="intervalDays"
                    value={pillForm.intervalDays}
                    onChange={handleChange}
                    type="number"
                    min="1"
                    step="1"
                    required
                  />
                  <span>day(s)</span>
                </div>
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-btn secondary"
                  onClick={closeAddModal}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-btn primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLinkModalOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeLinkModal();
          }}
        >
          <div className="modal" role="dialog" aria-modal="true">
            <div className="modal-header">
              <h3 className="modal-title">
                Add {linkType === 'caregiver' ? 'Caregiver' : 'Patient'}
              </h3>
              <button
                type="button"
                className="modal-close"
                onClick={closeLinkModal}
                aria-label="Close"
              >
                x
              </button>
            </div>

            <form className="modal-body" onSubmit={handleLinkUser}>
              <p className="modal-hint">
                Enter the email of the {linkType} you want to link with.
              </p>

              <label className="modal-label">
                Email
                <input
                  className="modal-input"
                  type="email"
                  value={linkEmail}
                  onChange={(e) => setLinkEmail(e.target.value)}
                  placeholder="Enter email address"
                  autoFocus
                  required
                />
              </label>

              {linkError && <p className="error-message">{linkError}</p>}
              {linkSuccess && <p className="success-message">{linkSuccess}</p>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-btn secondary"
                  onClick={closeLinkModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-btn primary"
                  disabled={isLinking}
                >
                  {isLinking ? 'Linking...' : 'Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
