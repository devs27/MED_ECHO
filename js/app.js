document.addEventListener('DOMContentLoaded', () => {
    // --- DATA MANAGEMENT (using localStorage) ---
    // Correct Data Structure: [{ id, name, dosage, time, frequency, takenStatus: {'YYYY-MM-DD': true/false} }]
    const getReminders = () => JSON.parse(localStorage.getItem('medReminders')) || [];
    const saveReminders = (reminders) => localStorage.setItem('medReminders', JSON.stringify(reminders));
    const getPrescriptions = () => JSON.parse(localStorage.getItem('medPrescriptions')) || [];
    const savePrescriptions = (prescriptions) => localStorage.setItem('medPrescriptions', JSON.stringify(prescriptions));

    const todayKey = new Date().toISOString().split('T')[0]; // Format: "2025-09-22"
    const daysOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const todayDayAbbr = daysOfWeek[new Date().getDay()]; // e.g., "mon"

    // --- PAGE-SPECIFIC LOGIC ---
    const page = window.location.pathname.split("/").pop();

    // Schedule Page
    if (page === 'schedule.html') {
        document.getElementById('schedule-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const reminders = getReminders();
            const newReminder = {
                id: Date.now(),
                name: document.getElementById('med-name').value,
                dosage: document.getElementById('med-dosage').value,
                time: document.getElementById('med-time').value,
                frequency: document.getElementById('med-frequency').value,
                takenStatus: {} // An object to store taken status by date
            };
            reminders.push(newReminder);
            saveReminders(reminders);
            alert('Reminder saved!');
            window.location.href = 'reminders.html';
        });
    }

    // Reminders Page
    if (page === 'reminders.html') {
        const remindersList = document.getElementById('reminders-list');
        // Filter for reminders that are daily (for now, weeklies need more logic)
        const todaysReminders = getReminders().filter(r => r.frequency === 'daily');

        if (todaysReminders.length === 0) {
            remindersList.innerHTML = '<p class="card">No reminders scheduled for today.</p>';
        } else {
            todaysReminders.forEach(r => {
                const isTakenToday = r.takenStatus[todayKey] === true;
                const item = document.createElement('div');
                item.className = 'reminder-item';
                item.innerHTML = `
                    <div class="reminder-item-info">
                        <strong>${r.name}</strong> (${r.dosage}) at ${r.time}
                    </div>
                    <button class="status-toggle ${isTakenToday ? 'taken' : 'pending'}" data-id="${r.id}">
                        ${isTakenToday ? 'Taken' : 'Mark as Taken'}
                    </button>`;
                remindersList.appendChild(item);
            });

            remindersList.addEventListener('click', e => {
                if (e.target.classList.contains('status-toggle')) {
                    const id = parseInt(e.target.dataset.id, 10);
                    const allReminders = getReminders();
                    const reminderToUpdate = allReminders.find(rem => rem.id === id);
                    if (reminderToUpdate) {
                        // Toggle the status for today's date
                        reminderToUpdate.takenStatus[todayKey] = !reminderToUpdate.takenStatus[todayKey];
                        saveReminders(allReminders);
                        window.location.reload(); // Refresh page to show the change
                    }
                }
            });
        }
    }

    // Progress Page
    if (page === 'progress.html') {
        const progressContainer = document.getElementById('progress-container');
        const reminders = getReminders().filter(r => r.frequency === 'daily');
        const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

        if (reminders.length === 0) {
             progressContainer.innerHTML = '<p class="card">No daily medication is scheduled to track progress.</p>';
        } else {
            weekDays.forEach((day, index) => {
                // This is a simplified progress view. It checks if *any* med was taken on a day.
                // A real app would need a more complex check against historical dates.
                const dayAbbr = daysOfWeek[index + 1] || daysOfWeek[0]; // Adjust for week start
                
                const totalDosesForDay = reminders.length;
                // For this demo, we'll just check today's status for today's bar
                let takenDoses = 0;
                if (dayAbbr === todayDayAbbr) {
                    takenDoses = reminders.filter(r => r.takenStatus[todayKey] === true).length;
                }
                
                const adherence = totalDosesForDay > 0 ? (takenDoses / totalDosesForDay) * 100 : 0;
    
                const dayElement = document.createElement('div');
                dayElement.className = 'progress-day';
                dayElement.innerHTML = `
                    <div class="day-label">${day}</div>
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill" style="width:${adherence}%"></div>
                    </div>`;
                progressContainer.appendChild(dayElement);
            });
        }
    }

    // Missed Medicines Page
    if (page === 'missed.html') {
        const missedList = document.getElementById('missed-list');
        // Find daily reminders that are NOT marked as taken for today
        const missedMeds = getReminders().filter(r => r.frequency === 'daily' && r.takenStatus[todayKey] !== true);

        if (missedMeds.length === 0) {
            missedList.innerHTML = '<p class="card">No missed medicines for today! Great job!</p>';
        } else {
            missedList.innerHTML = `<div class="day-group"><div class="day-group-header">Today</div></div>`;
            const dayGroup = missedList.querySelector('.day-group');
            missedMeds.forEach(r => {
                const item = document.createElement('div');
                item.className = 'reminder-item';
                item.innerHTML = `<div class="reminder-item-info"><strong>${r.name}</strong> (${r.dosage}) at ${r.time}</div>`;
                dayGroup.appendChild(item);
            });
        }
    }

    // Prescription Page
    if (page === 'prescription.html') {
        const form = document.getElementById('prescription-form');
        const list = document.getElementById('prescription-list');
        const renderPrescriptions = () => {
            list.innerHTML = '';
            getPrescriptions().forEach(p => {
                const item = document.createElement('div');
                item.className = 'card';
                item.innerHTML = `<p>${p.details}</p>`;
                list.appendChild(item);
            });
        };
        form.addEventListener('submit', e => {
            e.preventDefault();
            const prescriptions = getPrescriptions();
            prescriptions.push({ id: Date.now(), details: document.getElementById('prescription-details').value });
            savePrescriptions(prescriptions);
            form.reset();
            renderPrescriptions();
        });
        renderPrescriptions();
    }

    // AI Assistant Page
    if (page === 'assistant.html') {
        const sendBtn = document.getElementById('send-btn');
        const userInput = document.getElementById('user-input');
        const chatBox = document.getElementById('chat-box');

        const addMessage = (text, sender) => {
            const message = document.createElement('div');
            message.className = `chat-message ${sender}`;
            message.textContent = text;
            chatBox.appendChild(message);
            chatBox.scrollTop = chatBox.scrollHeight;
        };

        const getBotResponse = (text) => {
            const reminders = getReminders();
            const lowerCaseText = text.toLowerCase();

            if (lowerCaseText.includes('schedule') || lowerCaseText.includes('remind') || lowerCaseText.includes('dose')) {
                const upcoming = reminders.sort((a, b) => a.time.localeCompare(b.time))
                                         .find(r => r.takenStatus[todayKey] !== true);
                if (upcoming) {
                    return `Your next dose is ${upcoming.name} at ${upcoming.time}.`;
                } else {
                    return "You have taken all your doses for today!";
                }
            }
            return "Sorry, I can only answer questions about your 'schedule'.";
        };

        const sendMessage = () => {
            const userText = userInput.value.trim();
            if (userText) {
                addMessage(userText, 'user');
                userInput.value = '';
                setTimeout(() => {
                    addMessage(getBotResponse(userText), 'bot');
                }, 500);
            }
        };

        sendBtn.addEventListener('click', sendMessage);
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });

        addMessage("Hello! How can I help you today?", 'bot');
    }
});