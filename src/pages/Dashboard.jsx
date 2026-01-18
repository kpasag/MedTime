import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const commonDrugs = COMMON_DRUGS;
  console.log('CommonDrugs loaded:', commonDrugs.length, 'drugs');
  const [currentPills, setCurrentPills] = useState([]);
  const [patientList, setPatientList] = useState([]);

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [notificationFilter, setNotificationFilter] = useState('all'); // 'all', 'upcoming', 'pending', 'taken', 'missed'
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

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

  // Medicine autocomplete state
  const [medicineInput, setMedicineInput] = useState("");
  const [drugSuggestions, setDrugSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const totalPills = currentPills.length;

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setEditingPillId(null);
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

  // Handle Patient list
  useEffect(() => {

    const loadPatients = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();

        const response = await fetch('http://localhost:3000/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const patients = await response.json();
          setPatientList(patients);
        }
      } catch (error) {
        console.error('Error loading patients:', error);
      }
    };
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadPatients();
      }
    });

    return () => unsubscribe();
  }, []);


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

  // Load pill reminders from backend
  useEffect(() => {
    const loadReminders = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();

        const response = await fetch('http://localhost:3000/api/users/reminders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const reminders = await response.json();
          const pills = reminders.flatMap(reminder =>
            reminder.timesPerDay.map(time => ({
              id: `${reminder._id}-${time}`,
              reminderId: reminder._id,
              name: "You",
              medicine: `${reminder.name} (${reminder.dosage})`,
              time,
              intervalDays: reminder.frequencyInDays,
              lastTaken: reminder.lastTaken || [],
              scheduledFor: new Date(),
              status: calculateStatus(time, reminder.lastTaken, reminder.frequencyInDays)
            }))
          );
          setCurrentPills(pills);
        }
      } catch (error) {
        console.error('Error loading reminders:', error);
      }
    };
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadReminders();
      }
    });

    return () => unsubscribe();
  }, []);

  // Load page
  const loadPatientPage = (patientId) => {
    sessionStorage.setItem("viewedPatientID", patientId);
    navigate("/pdashboard");
  };

  // Auto-refresh pill statuses every minute
  useEffect(() => {
    const refreshStatuses = () => {
      setCurrentPills(prev => prev.map(pill => ({
        ...pill,
        status: calculateStatus(pill.time, pill.lastTaken, pill.intervalDays)
      })));
    };

    // Refresh every minute
    const interval = setInterval(refreshStatuses, 60000);

    return () => clearInterval(interval);
  }, []);

  // Load notifications from backend
  const fetchNotifications = async (filterType = 'all') => {
    setLoadingNotifications(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const queryParams = filterType !== 'all' ? `?type=${filterType}` : '';

      const response = await fetch(`http://localhost:3000/api/users/notifications${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch('http://localhost:3000/api/users/notifications/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Load notifications on mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchNotifications(notificationFilter);
        fetchUnreadCount();
      }
    });

    return () => unsubscribe();
  }, []);

  // Reload notifications when filter changes
  useEffect(() => {
    if (auth.currentUser) {
      fetchNotifications(notificationFilter);
    }
  }, [notificationFilter]);

  // Mark notification as read
  const markNotificationRead = async (notificationId) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      await fetch(`http://localhost:3000/api/users/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsRead = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      await fetch('http://localhost:3000/api/users/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      await fetch(`http://localhost:3000/api/users/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const notification = notifications.find(n => n._id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Create a notification (used when medication status changes)
  const createNotification = async (type, pillReminder, scheduledTime) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const titles = {
        upcoming: 'Upcoming Medication',
        pending: 'Time to Take Medication',
        taken: 'Medication Taken',
        missed: 'Missed Medication'
      };

      const messages = {
        upcoming: `${pillReminder.name} is coming up at ${scheduledTime}`,
        pending: `It's time to take ${pillReminder.name}`,
        taken: `You've taken ${pillReminder.name}`,
        missed: `You missed ${pillReminder.name} scheduled for ${scheduledTime}`
      };

      await fetch('http://localhost:3000/api/users/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type,
          title: titles[type],
          message: messages[type],
          pillReminderId: pillReminder._id,
          scheduledTime
        })
      });

      // Refresh notifications
      fetchNotifications(notificationFilter);
      fetchUnreadCount();
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  // Format notification date
  const formatNotificationDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Calculate status based on time and last taken
  const calculateStatus = (time, lastTakenArray = [], frequencyInDays) => {
    const now = new Date();

    // Parse time - handle both "HH:MM" and "H:MM AM/PM (frequency)" formats
    let hours, minutes;
    if (time.includes('AM') || time.includes('PM')) {
      // Old format like "1:59 AM (daily)"
      const timeMatch = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/);
      if (!timeMatch) return 'upcoming';

      hours = parseInt(timeMatch[1]);
      minutes = parseInt(timeMatch[2]);
      const period = timeMatch[3];

      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
    } else {
      // New format like "01:59"
      const parts = time.split(':').map(Number);
      if (parts.length !== 2) return 'upcoming';
      [hours, minutes] = parts;
    }

    // Create today's scheduled time
    const scheduledToday = new Date();
    scheduledToday.setHours(hours, minutes, 0, 0);

    // Extract raw time for comparison
    const rawTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    // Check if this dose was taken today
    const takenToday = lastTakenArray.find(lt => {
      const ltDate = new Date(lt.scheduledFor);
      return lt.time === rawTime &&
        ltDate.toDateString() === now.toDateString();
    });

    if (takenToday) {
      return 'taken';
    }

    // Grace period: 1 hour after scheduled time
    const missedTime = new Date(scheduledToday);
    missedTime.setHours(missedTime.getHours() + 1);

    if (now > missedTime) {
      return 'missed';
    }

    if (now >= scheduledToday) {
      return 'pending';
    }

    // Not yet time
    return 'upcoming';
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

  const handleSubmit = async (e) => {
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

        // Remove old pills with this reminderId and add new ones
        setCurrentPills((prev) => {
          const filtered = prev.filter(p => p.reminderId !== editingPillId);
          const newPills = updatedReminder.timesPerDay.map(time => ({
            id: `${updatedReminder._id}-${time}`,
            reminderId: updatedReminder._id,
            name: "You",
            medicine: `${updatedReminder.name} (${updatedReminder.dosage})`,
            time: time,
            intervalDays: updatedReminder.frequencyInDays,
            lastTaken: updatedReminder.lastTaken || [],
            scheduledFor: new Date(),
            status: calculateStatus(time, updatedReminder.lastTaken || [], updatedReminder.frequencyInDays)
          }));
          return [...filtered, ...newPills];
        });
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

        // Create a pill for each scheduled time
        const newPills = savedReminder.timesPerDay.map(time => ({
          id: `${savedReminder._id}-${time}`,
          reminderId: savedReminder._id,
          name: "You",
          medicine: `${savedReminder.name} (${savedReminder.dosage})`,
          time: time,
          intervalDays: savedReminder.frequencyInDays,
          lastTaken: savedReminder.lastTaken || [],
          scheduledFor: new Date(),
          status: calculateStatus(time, savedReminder.lastTaken || [], savedReminder.frequencyInDays)
        }));

        setCurrentPills((prev) => [...prev, ...newPills]);
      }
      closeAddModal();
    } catch (err) {
      console.error('Error saving pill:', err);
    }
  };

  const handleMarkAsTaken = async (pillId) => {
    try {
      const pill = currentPills.find(p => p.id === pillId);
      console.log('Found pill:', pill);
      if (!pill) {
        console.error('Pill not found');
        return;
      }

      // Support both old and new structure
      const reminderId = pill.reminderId || pill.id;
      // Extract raw time if it's formatted (e.g., "1:59 AM (daily)" -> "01:59")
      let rawTime = pill.time;
      if (pill.time.includes('AM') || pill.time.includes('PM')) {
        // Old format, parse it
        const timeMatch = pill.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1]);
          const minutes = timeMatch[2];
          const period = timeMatch[3];

          if (period === 'PM' && hours !== 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;

          rawTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
        }
      }

      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const currentStatus = pill.status;
      const endpoint = currentStatus === 'taken'
        ? 'unmark-taken'
        : 'mark-taken';

      const response = await fetch(`http://localhost:3000/api/users/${endpoint}/${reminderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          time: rawTime,
          scheduledFor: pill.scheduledFor || new Date()
        })
      });

      if (response.ok) {
        const updatedReminder = await response.json();
        const newStatus = currentStatus === 'taken' ? 'pending' : 'taken';

        // Update the pill status locally
        setCurrentPills(prev => prev.map(p =>
          p.id === pillId
            ? {
              ...p,
              status: newStatus,
              lastTaken: updatedReminder.lastTaken
            }
            : p
        ));

        // Create notification for taken medication
        if (newStatus === 'taken') {
          const medicineName = pill.medicine.split(' (')[0];
          createNotification('taken', { _id: reminderId, name: medicineName }, rawTime);
        }
      }
    } catch (error) {
      console.error('Error marking pill:', error);
    }
  };

  const handleDeletePill = async (pillId) => {
    if (!window.confirm('Are you sure you want to delete this medication?')) {
      return;
    }

    try {
      const pill = currentPills.find(p => p.id === pillId);
      if (!pill) return;

      // Support both old and new structure
      const reminderId = pill.reminderId || pill.id.split('-')[0];

      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`http://localhost:3000/api/users/delete-reminder/${reminderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Remove all pills with this reminderId
        setCurrentPills(prev => prev.filter(p => {
          const pReminderId = p.reminderId || p.id.split('-')[0];
          return pReminderId !== reminderId;
        }));
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
      const pill = currentPills.find(p => p.id === pillId);
      if (!pill) return;

      // Support both old and new structure
      const reminderId = pill.reminderId || pill.id.split('-')[0];

      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`http://localhost:3000/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const user = await response.json();
      const reminder = user.pillReminders?.find(r => r._id === reminderId);

      if (reminder) {
        setEditingPillId(reminderId);
        setPillForm({
          pillName: reminder.name,
          dosage: reminder.dosage,
          takeTimes: reminder.timesPerDay || [''],
          intervalDays: reminder.frequencyInDays
        });
        setMedicineInput(reminder.name);
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
        <div className="dashboard-user-info">  
          <section className="current-pills-section">
            <h2>
              Current Pills{" "}
              <span style={{ fontWeight: 500, fontSize: "0.95rem" }}>
                ({totalPills} total)
              </span>
            </h2>

            <div className="pill-cards-container">
              {currentPills.map(({ id, name, medicine, time, status, intervalDays }) => {
                // Extract medicine name and dosage
                const medicineMatch = medicine.match(/^(.+?)\s*\((.+?)\)$/);
                const medicineName = medicineMatch ? medicineMatch[1] : medicine;
                const dosage = medicineMatch ? medicineMatch[2] : '';

                return (
                  <div
                    key={id}
                    className={`pill-card ${status} clickable`}
                    onClick={() => {
                      handleMarkAsTaken(id);
                    }}
                  >
                    <div className="pill-header">
                      <div className="pill-header-left">
                        <span className={`status-badge ${status}`}>
                          {status === "taken" && "Taken"}
                          {status === "missed" && "Missed"}
                          {status === "pending" && "Pending"}
                          {status === "upcoming" && "Upcoming"}
                        </span>
                        <div className="medicine-info">
                          <span
                            className="medicine-name"
                            style={{
                              fontSize: medicineName.length > 20 ? '0.85rem' :
                                medicineName.length > 15 ? '0.95rem' : '1.15rem'
                            }}
                          >
                            {medicineName}
                          </span>
                          {dosage && <span className="medicine-dosage">{dosage}</span>}
                        </div>
                      </div>
                      <div className="pill-menu-wrapper">
                        <button
                          className="pill-menu-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === id ? null : id);
                          }}
                          title="Options"
                        >
                          •••
                        </button>
                        {openMenuId === id && (
                          <div className="pill-dropdown-menu">
                            {(status === 'pending' || status === 'upcoming' || status === 'missed') && (
                              <button
                                className="dropdown-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  handleMarkAsTaken(id);
                                }}
                              >
                                Mark as Taken
                              </button>
                            )}
                            {status === 'taken' && (
                              <button
                                className="dropdown-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  handleMarkAsTaken(id);
                                }}
                              >
                                Mark as Pending
                              </button>
                            )}
                            <button
                              className="dropdown-item"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(null);
                                handleEditPill(id);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="dropdown-item delete"
                              onClick={(e) => {
                                e.stopPropagation();
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
                      {intervalDays && (
                        <div className="pill-frequency">
                          {intervalDays === 1 ? 'Daily' :
                            intervalDays === 7 ? 'Weekly' :
                              intervalDays === 30 ? 'Monthly' :
                                `Every ${intervalDays} days`}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

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
            <div className="notifications-header">
              <h2>
                Notifications
                {unreadCount > 0 && (
                  <span className="unread-badge">{unreadCount}</span>
                )}
              </h2>
              {notifications.length > 0 && (
                <button
                  className="mark-all-read-btn"
                  onClick={markAllNotificationsRead}
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="notification-filters">
              {['all', 'upcoming', 'pending', 'taken', 'missed'].map((filter) => (
                <button
                  key={filter}
                  className={`filter-btn ${notificationFilter === filter ? 'active' : ''} ${filter !== 'all' ? filter : ''}`}
                  onClick={() => setNotificationFilter(filter)}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            {loadingNotifications ? (
              <div className="notification-placeholder">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-placeholder">
                No {notificationFilter !== 'all' ? notificationFilter : ''} notifications
              </div>
            ) : (
              <div className="notifications-list">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`notification-item ${notification.type} ${notification.read ? 'read' : 'unread'}`}
                    onClick={() => !notification.read && markNotificationRead(notification._id)}
                  >
                    <div className="notification-content">
                      <div className="notification-type-badge">{notification.type}</div>
                      <div className="notification-title">{notification.title}</div>
                      <div className="notification-message">{notification.message}</div>
                      <small className="notification-time">{formatNotificationDate(notification.createdAt)}</small>
                    </div>
                    <button
                      className="notification-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification._id);
                      }}
                      title="Delete notification"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
        <section className="patients-list">
          <h2>Patients</h2>
          {patientList?.linkedPatients && patientList.linkedPatients.length > 0 ? (
            <ul style={{ margin: '6px 0', paddingLeft: '0', listStyle: 'none' }}>
              {patientList.linkedPatients.map((patient) => (
                <li key={patient._id} className="relationship-item">
                  <span>{patient.email}</span>
                  <button
                    onClick={() => loadPatientPage(patient.email)}
                    className="profile-btn profile-btn-remove"
                  >
                    View
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="profile-muted">No patients linked yet.</div>
          )}
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
                <img src="/images/mdi--close-box-outline.svg" alt="Close" />
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
                        <img src="/images/mdi--close-box-outline.svg" alt="Remove" />
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
                <select
                  className="modal-input"
                  name="intervalDays"
                  value={pillForm.intervalDays}
                  onChange={handleChange}
                  required
                >
                  <option value="1">Daily</option>
                  <option value="2">Every Other Day</option>
                  <option value="7">Weekly</option>
                  <option value="30">Monthly</option>
                  {Array.from({ length: 28 }, (_, i) => i + 3).filter(d => d !== 7 && d !== 30).map(days => (
                    <option key={days} value={days}>Every {days} Days</option>
                  ))}
                </select>
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
                <img src="/images/mdi--close-box-outline.svg" alt="Close" />
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
