import { useEffect, useState } from "react";
import { auth } from "../../firebase.config";
import "./Dashboard.css";

// Common drugs database
const COMMON_DRUGS = [
  { label: "Acetaminophen", synonyms: ["Tylenol", "Panadol"] },
  { label: "Ibuprofen", synonyms: ["Advil", "Motrin"] },
  { label: "Naproxen", synonyms: ["Aleve"] },
  { label: "Aspirin", synonyms: ["ASA"] },
  { label: "Diclofenac", synonyms: ["Voltaren"] },
  { label: "Loratadine", synonyms: ["Claritin"] },
  { label: "Cetirizine", synonyms: ["Reactine", "Zyrtec"] },
  { label: "Fexofenadine", synonyms: ["Allegra"] },
  { label: "Diphenhydramine", synonyms: ["Benadryl"] },
  { label: "Fluticasone (nasal)", synonyms: ["Flonase"] },
  { label: "Omeprazole", synonyms: ["Prilosec"] },
  { label: "Esomeprazole", synonyms: ["Nexium"] },
  { label: "Pantoprazole", synonyms: [] },
  { label: "Famotidine", synonyms: ["Pepcid"] },
  { label: "Calcium carbonate", synonyms: ["Tums"] },
  { label: "Bismuth subsalicylate", synonyms: ["Pepto-Bismol"] },
  { label: "Polyethylene glycol 3350", synonyms: ["PEG 3350", "RestoraLAX", "MiraLAX"] },
  { label: "Docusate", synonyms: ["Colace"] },
  { label: "Senna", synonyms: ["Senokot"] },
  { label: "Loperamide", synonyms: ["Imodium"] },
  { label: "Dextromethorphan", synonyms: ["DM"] },
  { label: "Guaifenesin", synonyms: ["Mucinex"] },
  { label: "Pseudoephedrine", synonyms: ["Sudafed"] },
  { label: "Phenylephrine", synonyms: [] },
  { label: "Metformin", synonyms: ["Glucophage"] },
  { label: "Insulin glargine", synonyms: ["Lantus"] },
  { label: "Insulin lispro", synonyms: ["Humalog"] },
  { label: "Atorvastatin", synonyms: ["Lipitor"] },
  { label: "Rosuvastatin", synonyms: ["Crestor"] },
  { label: "Simvastatin", synonyms: ["Zocor"] },
  { label: "Amlodipine", synonyms: ["Norvasc"] },
  { label: "Lisinopril", synonyms: [] },
  { label: "Ramipril", synonyms: ["Altace"] },
  { label: "Losartan", synonyms: ["Cozaar"] },
  { label: "Valsartan", synonyms: ["Diovan"] },
  { label: "Hydrochlorothiazide", synonyms: ["HCTZ"] },
  { label: "Chlorthalidone", synonyms: [] },
  { label: "Metoprolol", synonyms: [] },
  { label: "Atenolol", synonyms: [] },
  { label: "Carvedilol", synonyms: [] },
  { label: "Furosemide", synonyms: ["Lasix"] },
  { label: "Spironolactone", synonyms: ["Aldactone"] },
  { label: "Clopidogrel", synonyms: ["Plavix"] },
  { label: "Warfarin", synonyms: ["Coumadin"] },
  { label: "Apixaban", synonyms: ["Eliquis"] },
  { label: "Rivaroxaban", synonyms: ["Xarelto"] },
  { label: "Levothyroxine", synonyms: ["Synthroid"] },
  { label: "Sertraline", synonyms: ["Zoloft"] },
  { label: "Escitalopram", synonyms: ["Cipralex", "Lexapro"] },
  { label: "Fluoxetine", synonyms: ["Prozac"] },
  { label: "Citalopram", synonyms: ["Celexa"] },
  { label: "Venlafaxine", synonyms: ["Effexor"] },
  { label: "Duloxetine", synonyms: ["Cymbalta"] },
  { label: "Bupropion", synonyms: ["Wellbutrin"] },
  { label: "Trazodone", synonyms: [] },
  { label: "Amitriptyline", synonyms: [] },
  { label: "Quetiapine", synonyms: ["Seroquel"] },
  { label: "Risperidone", synonyms: ["Risperdal"] },
  { label: "Gabapentin", synonyms: ["Neurontin"] },
  { label: "Pregabalin", synonyms: ["Lyrica"] },
  { label: "Albuterol (salbutamol)", synonyms: ["Ventolin"] },
  { label: "Budesonide/formoterol", synonyms: ["Symbicort"] },
  { label: "Fluticasone/salmeterol", synonyms: ["Advair"] },
  { label: "Tiotropium", synonyms: ["Spiriva"] },
  { label: "Amoxicillin", synonyms: [] },
  { label: "Amoxicillin/clavulanate", synonyms: ["Augmentin"] },
  { label: "Azithromycin", synonyms: ["Zithromax"] },
  { label: "Cephalexin", synonyms: ["Keflex"] },
  { label: "Cefuroxime", synonyms: [] },
  { label: "Ceftriaxone", synonyms: [] },
  { label: "Ciprofloxacin", synonyms: ["Cipro"] },
  { label: "Doxycycline", synonyms: [] },
  { label: "Clindamycin", synonyms: [] },
  { label: "Trimethoprim/sulfamethoxazole", synonyms: ["TMP-SMX", "Bactrim", "Septra"] },
  { label: "Metronidazole", synonyms: ["Flagyl"] },
  { label: "Acyclovir", synonyms: ["Zovirax"] },
  { label: "Valacyclovir", synonyms: ["Valtrex"] },
  { label: "Oseltamivir", synonyms: ["Tamiflu"] },
  { label: "Fluconazole", synonyms: ["Diflucan"] },
  { label: "Hydroxyzine", synonyms: ["Atarax"] },
  { label: "Meclizine", synonyms: [] },
  { label: "Ondansetron", synonyms: ["Zofran"] },
  { label: "Tamsulosin", synonyms: ["Flomax"] },
  { label: "Finasteride", synonyms: ["Proscar"] },
  { label: "Sildenafil", synonyms: ["Viagra"] },
  { label: "Tadalafil", synonyms: ["Cialis"] },
  { label: "Allopurinol", synonyms: ["Zyloprim"] },
  { label: "Colchicine", synonyms: [] },
  { label: "Calcium", synonyms: [] },
  { label: "Vitamin D", synonyms: ["Cholecalciferol"] },
  { label: "Iron", synonyms: ["Ferrous sulfate", "Ferrous gluconate"] },
  { label: "Magnesium", synonyms: [] },
  { label: "Vitamin B12", synonyms: ["Cyanocobalamin"] },
  { label: "Insulin aspart", synonyms: ["NovoRapid", "Novolog"] },
  { label: "Gliclazide", synonyms: [] },
  { label: "Empagliflozin", synonyms: ["Jardiance"] },
  { label: "Semaglutide", synonyms: ["Ozempic", "Rybelsus"] },
  { label: "Montelukast", synonyms: ["Singulair"] },
  { label: "Prednisone", synonyms: [] },
  { label: "Clotrimazole", synonyms: ["Canesten"] },
  { label: "Hydrocortisone (topical)", synonyms: [] },
  { label: "Nicotine replacement", synonyms: ["Nicorette"] }
];

function Dashboard() {
    const commonDrugs = COMMON_DRUGS;
    console.log('CommonDrugs loaded:', commonDrugs.length, 'drugs');
    const [currentPills, setCurrentPills] = useState([
    ]);

    const notifications = [
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

    // Medicine autocomplete state
    const [medicineInput, setMedicineInput] = useState("");
    const [drugSuggestions, setDrugSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const totalPills = currentPills.length;

    const closeAddModal = () => {
        setIsAddModalOpen(false);
        setPillForm({ pillName: "", dosage: "", takeTimes: [""], intervalDays: 1 });
        setMedicineInput("");
        setDrugSuggestions([]);
        setShowSuggestions(false);
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
    }, [isAddModalOpen]);

    // Handle medicine input and filter suggestions
    useEffect(() => {
        if (!medicineInput.trim()) {
            setDrugSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const query = medicineInput.toLowerCase();
        console.log('Searching for:', query, 'in', commonDrugs.length, 'drugs');
        
        const filtered = commonDrugs.filter((drug) => {
            if (!drug || !drug.label) return false;
            
            const labelMatch = drug.label.toLowerCase().includes(query);
            const synonymMatch = Array.isArray(drug.synonyms) && 
                drug.synonyms.some((syn) => syn && syn.toLowerCase().includes(query));
            
            return labelMatch || synonymMatch;
        });

        console.log('Found', filtered.length, 'matches');
        setDrugSuggestions(filtered);
        setShowSuggestions(true);
    }, [medicineInput, commonDrugs]);

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
        const timeLabel = `${timesLabel} (${frequencyText(intervalDays)})`;

        const newPill = {
            id: Date.now(),
            name: "New Person",
            medicine: `${pillName} (${dosage})`,
            time: timeLabel,
            status: "pending",
        };

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
                                        {status === "missed" && "x"}
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
                                    value={medicineInput}
                                    onChange={(e) => setMedicineInput(e.target.value)}
                                    onFocus={() => {
                                        if (medicineInput.trim().length > 0) {
                                            setShowSuggestions(true);
                                        }
                                    }}
                                    onBlur={() => {
                                        setTimeout(() => setShowSuggestions(false), 150);
                                    }}
                                    placeholder="Type a medicine (e.g., tylenol)"
                                    autoComplete="off"
                                    autoFocus
                                    required
                                />
                                {showSuggestions && (
                                    <div className="autocomplete-dropdown">
                                        {drugSuggestions.length > 0 ? (
                                            drugSuggestions.map((drug) => (
                                                <button
                                                    key={drug.label}
                                                    type="button"
                                                    className="autocomplete-item autocomplete-button"
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => {
                                                        setPillForm((prev) => ({
                                                            ...prev,
                                                            pillName: drug.label,
                                                        }));
                                                        setMedicineInput(drug.label);
                                                        setShowSuggestions(false);
                                                    }}
                                                >
                                                    <strong>{drug.label}</strong>
                                                    {Array.isArray(drug.synonyms) && drug.synonyms.length > 0 &&
                                                        ` (${drug.synonyms.join(", ")})`}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="autocomplete-item">No matches found</div>
                                        )}
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
