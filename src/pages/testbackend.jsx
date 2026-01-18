import { useState } from 'react'

function TestBackend() {
  const [currentPills, setCurrentPills] = useState([])

  const updateDatabasePills = async (pillReminder) => {
    const token = await fetch('http://localhost:5173/api/users/me');
    const id = await token.json()
    console.log(id);
    await fetch('http://localhost:5173/api/users/add-reminder', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.uid}`
      },
      body: pillReminder
    });
  };

  const onClick = () => {
    const pillName = "Hellp";
    const dosage = 4;
    const intervalDays = 5;
    const timesLabel = ["9-0-9"];
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
  };

  return (
    <>
      <button onClick={onClick}>
        bruh
      </button>
      <div>
        {currentPills.map(({ createdAt, name, timesPerDay, repeatFrequency, dosage }) => (
          <div key={createdAt}>
            <p>{name}</p>
            <p>{timesPerDay}</p>
            <p>{repeatFrequency}</p>
            <p>{dosage}</p>
          </div>
        )
        )}
      </div>
    </>
  )
}

export default TestBackend; 
