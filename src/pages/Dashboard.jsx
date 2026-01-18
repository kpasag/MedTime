import { useEffect, useRef, useState } from "react";
import { auth } from "../../firebase.config";
import "./Dashboard.css";

function Dashboard() {
    const [currentPills, setCurrentPills] = useState([
    ]);

    const notifications = [
    ];

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [editingPillId, setEditingPillId] = useState(null);

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

    const DPD_BASE = "https://health-products.canada.ca/api/drug/drugproduct/";

    // Brand search state
    const [brandQuery, setBrandQuery] = useState("");
    const [brandGroups, setBrandGroups] = useState([]); // [{ label: "TYLENOL", count: 42 }]
    const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);

    const [selectedBrand, setSelectedBrand] = useState(""); // e.g., "TYLENOL"
    const [productOptions, setProductOptions] = useState([]); // [{ id, label, din }]
    const [selectedProductId, setSelectedProductId] = useState("");

    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [suggestionsError, setSuggestionsError] = useState("");
    const [formError, setFormError] = useState('');

    const abortRef = useRef(null);
    const cacheRef = useRef(new Map()); // key: query -> raw normalized list

    const totalPills = currentPills.length;

    const closeAddModal = () => {
        setIsAddModalOpen(false);
        setEditingPillId(null);
        setPillForm({ pillName: "", dosage: "", takeTimes: [""], intervalDays: 1 });

        setBrandQuery("");
        setBrandGroups([]);
        setIsBrandDropdownOpen(false);

        setSelectedBrand("");
        setProductOptions([]);
        setSelectedProductId("");
        setSuggestionsError("");
        setIsLoadingSuggestions(false);
        setFormError('');

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

    // Close dropdown menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (openMenuId && !e.target.closest('.pill-menu-wrapper')) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [openMenuId]);

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
    }, [isAddModalOpen]);

    // Fetch brand search results (fast + cached + debounced)
    useEffect(() => {
        if (!isAddModalOpen) return;

        const q = brandQuery.trim();
        setSuggestionsError("");

        // Show dropdown while typing, require 3+ characters before fetching
        if (q.length === 0) {
            setBrandGroups([]);
            setIsBrandDropdownOpen(false);
            setSelectedBrand("");
            setProductOptions([]);
            setSelectedProductId("");
            return;
        }

        if (q.length < 3) {
            setBrandGroups([{ label: "Type at least 3 characters...", count: 0 }]);
            setIsBrandDropdownOpen(true);
            setSelectedBrand("");
            setProductOptions([]);
            setSelectedProductId("");
            return;
        }

        const timeoutId = setTimeout(async () => {
            try {
                setIsLoadingSuggestions(true);

                const cacheKey = q.toLowerCase();
                if (cacheRef.current.has(cacheKey)) {
                    const cached = cacheRef.current.get(cacheKey);
                    const groups = buildBrandGroups(cached, q);
                    setBrandGroups(groups);
                    setIsBrandDropdownOpen(true);
                    return;
                }

                if (abortRef.current) abortRef.current.abort();
                const controller = new AbortController();
                abortRef.current = controller;

                const url = new URL(DPD_BASE);
                url.searchParams.set("brandname", q);
                url.searchParams.set("status", "2"); // marketed
                url.searchParams.set("lang", "en");
                url.searchParams.set("type", "json");

                const res = await fetch(url.toString(), {
                    method: "GET",
                    signal: controller.signal,
                    headers: { Accept: "application/json" },
                });

                if (!res.ok) throw new Error(`DPD search failed (${res.status})`);

                const data = await res.json();

                const normalized = Array.isArray(data)
                    ? data
                        .map((x) => ({
                            id: x.drug_code,
                            label: x.brand_name,
                            din: x.drug_identification_number,
                        }))
                        .filter((x) => x.label)
                    : [];

                cacheRef.current.set(cacheKey, normalized);

                const groups = buildBrandGroups(normalized, q);
                setBrandGroups(groups);
                setIsBrandDropdownOpen(true);
            } catch (err) {
                if (err?.name === "AbortError") return;
                setBrandGroups([]);
                setIsBrandDropdownOpen(true);
                setSuggestionsError(err?.message || "Failed to load suggestions");
            } finally {
                setIsLoadingSuggestions(false);
            }
        }, 250);

        return () => clearTimeout(timeoutId);
    }, [brandQuery, isAddModalOpen]);

    const buildBrandGroups = (normalized, q) => {
        // Prioritize items that contain the query (DPD already does contains),
        // then build "brand groups" using first word.
        const qLower = q.toLowerCase();

        const relevant = normalized
            .filter((x) => x.label && x.label.toLowerCase().includes(qLower))
            .slice(0, 500); // guardrail: avoid grouping an enormous list

        const counts = new Map();
        for (const item of relevant) {
            const firstWord = item.label.split(" ")[0]?.trim();
            if (!firstWord) continue;
            const key = firstWord.toUpperCase();
            counts.set(key, (counts.get(key) || 0) + 1);
        }

        // Sort by count desc, but also make sure groups that start with query float to top
        const qUpper = q.toUpperCase();
        const groups = Array.from(counts.entries()).map(([label, count]) => ({
            label,
            count,
        }));

        groups.sort((a, b) => {
            const aStarts = a.label.startsWith(qUpper) ? 1 : 0;
            const bStarts = b.label.startsWith(qUpper) ? 1 : 0;
            if (aStarts !== bStarts) return bStarts - aStarts;
            return b.count - a.count;
        });

        return groups.slice(0, 10);
    };

    const chooseBrandGroup = (groupLabel) => {
        if (groupLabel === "Keep typing...") return;

        setSelectedBrand(groupLabel);
        setIsBrandDropdownOpen(false);

        // Build product list under this brand group using cached results for the current query
        const q = brandQuery.trim().toLowerCase();
        const normalized = cacheRef.current.get(q) || [];

        const products = normalized
            .filter((x) => x.label && x.label.toUpperCase().startsWith(groupLabel))
            .map((x) => ({
                id: x.id,
                label: x.label,
                din: x.din,
            }));


        const seen = new Set();
        const deduped = [];
        for (const p of products) {
            const key = p.label.toUpperCase();
            if (seen.has(key)) continue;
            seen.add(key);
            deduped.push(p);
            if (deduped.length >= 25) break;
        }

        setProductOptions(deduped);
        setSelectedProductId("");
        // Set pillName to the selected brand so form validation passes
        setPillForm((prev) => ({ ...prev, pillName: groupLabel }));
    };

    const chooseProduct = (productId) => {
        setSelectedProductId(productId);

        const chosen = productOptions.find(
            (p) => String(p.id) === String(productId),
        );
        if (!chosen) return;

        setPillForm((prev) => ({ ...prev, pillName: chosen.label }));
    };

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

    // Load pills from backend on mount
    useEffect(() => {
        const loadPills = async () => {
            try {
                const token = await auth.currentUser?.getIdToken();
                if (!token) return;

                const res = await fetch('http://localhost:3000/api/users/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!res.ok) return;

                const user = await res.json();
                if (user.pillReminders && user.pillReminders.length > 0) {
                    const pills = user.pillReminders.map((reminder) => ({
                        id: reminder._id,
                        name: "You",
                        medicine: `${reminder.name} (${reminder.dosage})`,
                        time: `${reminder.timesPerDay.join(", ")} (${reminder.frequencyInDays === 1 ? 'daily' : `every ${reminder.frequencyInDays} days`})`,
                        status: "pending",
                    }));
                    setCurrentPills(pills);
                }
            } catch (err) {
                console.error('Error loading pills:', err);
            }
        };

        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) loadPills();
        });

        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        // Use brandQuery as pillName if no brand was selected from dropdown
        const pillName = pillForm.pillName.trim() || brandQuery.trim();
        const dosage = pillForm.dosage.trim();
        const intervalDays = pillForm.intervalDays;

        const cleanedTimes = pillForm.takeTimes
            .map((t) => t.trim())
            .filter(Boolean);

        if (!pillName) {
            setFormError('Please enter a medicine name');
            return;
        }
        if (!dosage) {
            setFormError('Please enter a dosage');
            return;
        }
        if (!intervalDays || intervalDays < 1) {
            setFormError('Please enter a valid repeat interval');
            return;
        }
        if (cleanedTimes.length === 0) {
            setFormError('Please enter at least one time');
            return;
        }

        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) {
                console.error('Not authenticated');
                return;
            }

            if (editingPillId) {
                // Update existing pill
                const res = await fetch(`http://localhost:3000/api/users/update-reminder/${editingPillId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: pillName,
                        dosage: dosage,
                        timesPerDay: cleanedTimes,
                        frequencyInDays: intervalDays
                    })
                });

                if (!res.ok) {
                    const data = await res.json();
                    console.error('Failed to update pill:', data.error);
                    return;
                }

                const updatedReminder = await res.json();
                const timesLabel = cleanedTimes.map(formatTime).join(", ");
                const timeLabel = `${timesLabel} (${frequencyText(intervalDays)})`;

                setCurrentPills((prev) => prev.map(pill => 
                    pill.id === editingPillId
                        ? {
                            ...pill,
                            medicine: `${pillName} (${dosage})`,
                            time: timeLabel
                          }
                        : pill
                ));
            } else {
                // Add new pill
                const res = await fetch('http://localhost:3000/api/users/add-reminder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: pillName,
                        dosage: dosage,
                        timesPerDay: cleanedTimes,
                        frequencyInDays: intervalDays
                    })
                });

                if (!res.ok) {
                    const data = await res.json();
                    console.error('Failed to save pill:', data.error);
                    return;
                }

                const savedReminder = await res.json();
                const timesLabel = cleanedTimes.map(formatTime).join(", ");
                const timeLabel = `${timesLabel} (${frequencyText(intervalDays)})`;

                const newPill = {
                    id: savedReminder._id,
                    name: "You",
                    medicine: `${pillName} (${dosage})`,
                    time: timeLabel,
                    status: "pending",
                };

                setCurrentPills((prev) => [...prev, newPill]);
            }
            closeAddModal();
        } catch (err) {
            console.error('Error saving pill:', err);
        }
    };

    const handleDeletePill = async (pillId) => {
        if (!window.confirm('Are you sure you want to delete this medication?')) {
            return;
        }

        try {
            const token = await auth.currentUser?.getIdToken();
            const response = await fetch(`http://localhost:3000/api/users/delete-reminder/${pillId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Remove from local state
                setCurrentPills(prev => prev.filter(pill => pill.id !== pillId));
            } else {
                console.error('Failed to delete pill');
                alert('Failed to delete medication. Please try again.');
            }
        } catch (err) {
            console.error('Error deleting pill:', err);
            alert('Error deleting medication. Please try again.');
        }
    };

    const handleEditPill = async (pillId) => {
        try {
            const token = await auth.currentUser?.getIdToken();
            const response = await fetch(`http://localhost:3000/api/users/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const user = await response.json();
            const reminder = user.pillReminders?.find(r => r._id === pillId);
            
            if (reminder) {
                setEditingPillId(pillId);
                setPillForm({
                    pillName: reminder.name,
                    dosage: reminder.dosage,
                    takeTimes: reminder.timesPerDay || [''],
                    intervalDays: reminder.frequencyInDays
                });
                setBrandQuery(reminder.name);
                setIsAddModalOpen(true);
            }
        } catch (err) {
            console.error('Error loading pill for edit:', err);
        }
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
                                    <div className="pill-header-left">
                                        <span className={`status-badge ${status}`}>
                                            {status === "taken" && "Taken"}
                                            {status === "missed" && "Missed"}
                                            {status === "pending" && "Pending"}
                                        </span>
                                        <span className="medicine-name">{medicine}</span>
                                    </div>
                                    <div className="pill-menu-wrapper">
                                        <button
                                            className="pill-menu-btn"
                                            onClick={() => setOpenMenuId(openMenuId === id ? null : id)}
                                            title="Options"
                                        >
                                            ⋮
                                        </button>
                                        {openMenuId === id && (
                                            <div className="pill-dropdown-menu">
                                                <button
                                                    className="dropdown-item"
                                                    onClick={() => {
                                                        setOpenMenuId(null);
                                                        handleEditPill(id);
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="dropdown-item delete"
                                                    onClick={() => {
                                                        setOpenMenuId(null);
                                                        handleDeletePill(id);
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
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
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            <span className="plus-sign">+</span>
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
                                x
                            </button>
                        </div>

                        <form className="modal-body" onSubmit={handleSubmit}>
                            <label className="modal-label" style={{ position: "relative" }}>
                                Medicine
                                <input
                                    className="modal-input"
                                    value={brandQuery}
                                    onChange={(e) => {
                                        setBrandQuery(e.target.value);
                                        setSelectedBrand("");
                                        setProductOptions([]);
                                        setSelectedProductId("");
                                        setPillForm((prev) => ({ ...prev, pillName: "" }));
                                        setIsBrandDropdownOpen(true);
                                    }}
                                    onFocus={() => {
                                        if (brandQuery.trim().length > 0)
                                            setIsBrandDropdownOpen(true);
                                    }}
                                    onBlur={() => {
                                        setTimeout(() => setIsBrandDropdownOpen(false), 150);
                                    }}
                                    placeholder="Type a brand (e.g., tylenol)"
                                    autoComplete="off"
                                    autoFocus
                                    required
                                />
                                {isBrandDropdownOpen && (
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
                                            brandGroups.length === 0 && (
                                                <div className="autocomplete-item">No matches</div>
                                            )}

                                        {!isLoadingSuggestions &&
                                            !suggestionsError &&
                                            brandGroups.map((g) => (
                                                <button
                                                    key={g.label}
                                                    type="button"
                                                    className="autocomplete-item autocomplete-button"
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => chooseBrandGroup(g.label)}
                                                    disabled={g.label === "Keep typing..."}
                                                >
                                                    {g.label}
                                                    {g.count > 0 ? ` (${g.count})` : ""}
                                                </button>
                                            ))}
                                    </div>
                                )}
                            </label>

                            {/* <label className="modal-label">
                                Product type
                                <select
                                    className="modal-input"
                                    value={selectedProductId}
                                    onChange={(e) => chooseProduct(e.target.value)}
                                    disabled={!selectedBrand || productOptions.length === 0}
                                    required
                                >
                                    <option value="">
                                        {selectedBrand
                                            ? productOptions.length
                                                ? "Select a product"
                                                : "No products found"
                                            : "Select a brand first"}
                                    </option>
                                    {productOptions.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.label}
                                            {p.din ? ` (DIN ${p.din})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </label> */}

                            <label className="modal-label">
                                Dosage
                                <input
                                    className="modal-input"
                                    name="dosage"
                                    value={pillForm.dosage}
                                    onChange={handleChange}
                                    placeholder="e.g., 500 mg"
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
                                                x
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
                                <div className="repeat-options">
                                    <button
                                        type="button"
                                        className={`repeat-btn ${pillForm.intervalDays === 1 ? 'active' : ''}`}
                                        onClick={() => setPillForm(prev => ({ ...prev, intervalDays: 1 }))}
                                    >
                                        Daily
                                    </button>
                                    <button
                                        type="button"
                                        className={`repeat-btn ${pillForm.intervalDays === 2 ? 'active' : ''}`}
                                        onClick={() => setPillForm(prev => ({ ...prev, intervalDays: 2 }))}
                                    >
                                        Every 2 days
                                    </button>
                                    <button
                                        type="button"
                                        className={`repeat-btn ${pillForm.intervalDays === 3 ? 'active' : ''}`}
                                        onClick={() => setPillForm(prev => ({ ...prev, intervalDays: 3 }))}
                                    >
                                        Every 3 days
                                    </button>
                                    <button
                                        type="button"
                                        className={`repeat-btn ${pillForm.intervalDays === 7 ? 'active' : ''}`}
                                        onClick={() => setPillForm(prev => ({ ...prev, intervalDays: 7 }))}
                                    >
                                        Weekly
                                    </button>
                                    <div className="repeat-custom">
                                        <span>Custom:</span>
                                        <select
                                            className="modal-input repeat-days-select"
                                            name="intervalDays"
                                            value={pillForm.intervalDays}
                                            onChange={(e) => setPillForm(prev => ({ ...prev, intervalDays: Number(e.target.value) }))}
                                        >
                                            {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
                                                <option key={day} value={day}>
                                                    {day} {day === 1 ? 'day' : 'days'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </label>

                            {formError && <p className="error-message">{formError}</p>}

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
