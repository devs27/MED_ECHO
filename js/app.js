document.addEventListener('DOMContentLoaded', () => {

    // --- DATA MANAGEMENT ---
    // The data structure is an array of reminder objects.
    // We use localStorage to persist data between page loads.
    const getReminders = () => {
        return JSON.parse(localStorage.getItem('medReminders')) || [];
    };

    const saveReminders = (reminders) => {
        localStorage.setItem('medReminders', JSON.stringify(reminders));
    };
    
    const getPrescriptions = () => {
        return JSON.parse(localStorage.getItem('medPrescriptions')) || [];
    };
    
    const savePrescriptions = (prescriptions) => {
        localStorage.setItem('medPrescriptions', JSON.stringify(prescriptions));
    };


    // --- PAGE-SPECIFIC LOGIC ---
    const page = window.location.pathname.split("/").pop();

    if (page === 'schedule.html') {
        const scheduleForm = document.getElementById('schedule-form');
        scheduleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const reminders = getReminders();
            const newReminder = {
                id: Date.now(), // Unique ID
                name: document.getElementById('med-name').value,
                time: document.getElementById('med-time').value,
                dosage: document.getElementById('med-dosage').value,
                taken: false // Default status
            };
            reminders.push(newReminder);
            saveReminders(reminders);
            alert('Reminder saved!');
            scheduleForm.reset();
            window.location.href = 'reminders.html';
        });
    }

    if (page === 'reminders.html') {
        const remindersList = document.getElementById('reminders-list');
        const reminders = getReminders();
        
        if (reminders.length === 0) {
            remindersList.innerHTML = '<p class="card">No reminders scheduled yet. Add one from the dashboard!</p>';
        } else {
            reminders.forEach(reminder => {
                const item = document.createElement('div');
                item.className = 'reminder-item';
                item.innerHTML = `
                    <div>
                        <h3>${reminder.name}</h3>
                        <p>Time: ${reminder.time} | Dosage: ${reminder.dosage}</p>
                    </div>
                    <button class="status-btn ${reminder.taken ? 'taken' : 'missed'}" data-id="${reminder.id}">
                        ${reminder.taken ? 'Taken' : 'Mark as Taken'}
                    </button>
                `;
                remindersList.appendChild(item);
            });

            remindersList.addEventListener('click', (e) => {
                if(e.target.classList.contains('status-btn')) {
                    const reminderId = parseInt(e.target.dataset.id);
                    const currentReminders = getReminders();
                    const updatedReminders = currentReminders.map(r => {
                        if (r.id === reminderId) {
                            r.taken = !r.taken; // Toggle status
                        }
                        return r;
                    });
                    saveReminders(updatedReminders);
                    window.location.reload(); // Refresh to show changes
                }
            });
        }
    }

    if (page === 'progress.html') {
        const progressList = document.getElementById('progress-list');
        const reminders = getReminders();

        if (reminders.length === 0) {
            progressList.innerHTML = '<p class="card">No medication data available to track progress.</p>';
        } else {
            const takenCount = reminders.filter(r => r.taken).length;
            const totalCount = reminders.length;
            const percentage = totalCount > 0 ? (takenCount / totalCount) * 100 : 0;

            const progressItem = document.createElement('div');
            progressItem.className = 'progress-item card';
            progressItem.innerHTML = `
                <div>
                    <h3>Overall Adherence</h3>
                    <div class="progress-bar">
                        <div class="progress-bar-fill" style="width: ${percentage}%;"></div>
                    </div>
                </div>
                <div class="progress-text">${Math.round(percentage)}%</div>
            `;
            progressList.appendChild(progressItem);
        }
    }
    
    if (page === 'prescription.html') {
        const prescriptionForm = document.getElementById('prescription-form');
        const prescriptionList = document.getElementById('prescription-list');
        
        const renderPrescriptions = () => {
            prescriptionList.innerHTML = '';
            const prescriptions = getPrescriptions();
            if (prescriptions.length === 0) {
                 prescriptionList.innerHTML = '<p>No prescriptions added yet.</p>';
            } else {
                prescriptions.forEach(p => {
                    const item = document.createElement('div');
                    item.className = 'card';
                    item.innerHTML = `<p>${p.details}</p>`;
                    prescriptionList.appendChild(item);
                });
            }
        };

        prescriptionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const prescriptions = getPrescriptions();
            const newPrescription = {
                id: Date.now(),
                details: document.getElementById('prescription-details').value
            };
            prescriptions.push(newPrescription);
            savePrescriptions(prescriptions);
            alert('Prescription saved!');
            prescriptionForm.reset();
            renderPrescriptions();
        });

        renderPrescriptions(); // Initial render
    }

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
            text = text.toLowerCase();
            if (text.includes('schedule') || text.includes('remind')) {
                if (reminders.length === 0) return "You have no upcoming reminders.";
                const upcoming = reminders.find(r => !r.taken);
                return upcoming ? `Your next dose is ${upcoming.name} at ${upcoming.time}.` : "You have taken all your doses for now!";
            }
            if (text.includes('prescription')) {
                const prescriptions = getPrescriptions();
                return prescriptions.length > 0 ? `You have ${prescriptions.length} prescription(s) saved.` : "You have not saved any prescriptions yet.";
            }
            if (text.includes('hello') || text.includes('hi')) {
                return "Hello! How can I assist with your medications today?";
            }
            return "I'm sorry, I can only answer questions about your 'schedule' or 'prescriptions'.";
        };

        sendBtn.addEventListener('click', () => {
            const userText = userInput.value.trim();
            if (userText) {
                addMessage(userText, 'user');
                setTimeout(() => {
                    const botText = getBotResponse(userText);
                    addMessage(botText, 'bot');
                }, 500);
                userInput.value = '';
            }
        });
    }

});