// 1. Initialize Supabase Client
const SUPABASE_URL = 'https://dwqifavfgggrdzimvrfx.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_8BoKa-IB_kQPtt2rhi2X4w_or0ImSFV'; // Keep your actual anon public key here
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM Elements
const eventForm = document.getElementById('event-form');
const eventIdInput = document.getElementById('event-id');
const titleInput = document.getElementById('title');
const venueInput = document.getElementById('venue');
const dateInput = document.getElementById('event_date');
const timeInput = document.getElementById('event_time');
const organiserInput = document.getElementById('organiser_name');
const passcodeInput = document.getElementById('passcode');
const descriptionInput = document.getElementById('description');
const registerEventsList = document.getElementById('register-events-list');
const formTitle = document.getElementById('form-title');
const cancelBtn = document.getElementById('cancel-btn');
const statusMessage = document.getElementById('status-message');

if (dateInput) {
  dateInput.min = new Date().toISOString().split('T')[0];
}

// Global Memory Arrays for Client-Side Filtering
let allEvents = [];
let allRegistrations = [];

// TOGGLE SIDEBAR VISIBILITY
window.toggleSidebar = () => {
  const sidebar = document.getElementById('sidebar');
  const showBtn = document.getElementById('show-sidebar-btn');
  sidebar.classList.toggle('collapsed');
  showBtn.classList.toggle('hidden');
};

// PAGE SWITCHER
window.switchPage = (pageName) => {
  document.querySelectorAll('.page-view').forEach(view => view.classList.add('hidden'));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

  document.getElementById(`page-${pageName}`).classList.remove('hidden');
  document.getElementById(`nav-${pageName}`).classList.add('active');

  fetchEvents();
};

function showMessage(msg, isError = false) {
  statusMessage.textContent = msg;
  statusMessage.className = `message ${isError ? 'error' : 'success'}`;
  statusMessage.classList.remove('hidden');
  setTimeout(() => statusMessage.classList.add('hidden'), 4000);
}

// READ: Fetch Events & Store in Memory
async function fetchEvents() {
  const { data: events, error: eventError } = await supabaseClient
    .from('events')
    .select('*')
    .order('event_date', { ascending: true });

  if (eventError) {
    showMessage('Error fetching events: ' + eventError.message, true);
    return;
  }

  const { data: registrations } = await supabaseClient
    .from('registrations')
    .select('event_id, attendee_name');

  allEvents = events || [];
  allRegistrations = registrations || [];

  document.getElementById('stat-total-events').textContent = allEvents.length;
  document.getElementById('stat-total-regs').textContent = allRegistrations.length;

  filterEvents();
}

// REAL-TIME FILTER FUNCTION
window.filterEvents = () => {
  const searchInput = document.getElementById('search-input');
  const filterStatus = document.getElementById('filter-status');

  const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const statusFilter = filterStatus ? filterStatus.value : 'all';
  const todayStr = new Date().toISOString().split('T')[0];

  const filtered = allEvents.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm) ||
      event.venue.toLowerCase().includes(searchTerm) ||
      event.organiser_name.toLowerCase().includes(searchTerm);

    let matchesStatus = true;
    if (statusFilter === 'upcoming') matchesStatus = event.event_date >= todayStr;
    else if (statusFilter === 'past') matchesStatus = event.event_date < todayStr;

    return matchesSearch && matchesStatus;
  });

  renderEventsList(filtered);
};

// RENDER FILTERED EVENTS TO DOM
function renderEventsList(eventsToRender) {
  if (!eventsToRender || eventsToRender.length === 0) {
    registerEventsList.innerHTML = `
      <div class="card" style="grid-column: 1 / -1;">
        <p>🔍 No matching events found.</p>
      </div>`;
    return;
  }

  const regMap = {};
  allRegistrations.forEach(r => {
    if (!regMap[r.event_id]) regMap[r.event_id] = [];
    regMap[r.event_id].push(r.attendee_name);
  });

  registerEventsList.innerHTML = eventsToRender.map(event => {
    const attendeeList = regMap[event.id] || [];
    const count = attendeeList.length;

    return `
      <div class="event-card">
        <h3>${event.title}</h3>
        <p>📍 <strong>Venue:</strong> ${event.venue}</p>
        <p>📅 <strong>Date:</strong> ${event.event_date} at ${event.event_time}</p>
        <p>👤 <strong>Organiser:</strong> ${event.organiser_name}</p>
        <p>🎟️ <strong>Registered Attendees:</strong> ${count}</p>
        <p><em>${event.description || ''}</em></p>
        
        <div class="event-actions">
          <button onclick="toggleRegisterForm(${event.id})" class="btn primary">Register</button>
          <button onclick="toggleManageAuth(${event.id})" class="btn secondary">🔒 Manage Event</button>
        </div>

        <!-- Registration Form Container -->
        <div id="register-box-${event.id}" class="registration-box hidden">
          <h4>Register for this Event</h4>
          <form onsubmit="submitRegistration(event, ${event.id})">
            <div class="form-group">
              <label>Are you a student?</label>
              <select id="reg-status-${event.id}" required>
                <option value="Yes">Yes, I am a student</option>
                <option value="No">No, Guest/Staff</option>
              </select>
            </div>
            <div class="form-group">
              <input type="text" id="reg-name-${event.id}" placeholder="Your Full Name" required>
            </div>
            <div class="form-group">
              <input type="email" id="reg-email-${event.id}" placeholder="Your Email Address" required>
            </div>
            <button type="submit" class="btn success">Confirm Registration</button>
          </form>
        </div>

        <!-- Passcode Prompt Container -->
        <div id="manage-auth-box-${event.id}" class="manage-box hidden">
          <h4>Enter Creator Passcode</h4>
          <div class="form-group" style="margin-top:0.5rem;">
            <input type="password" id="auth-input-${event.id}" placeholder="Enter passcode">
          </div>
          <button onclick="verifyPasscode(${event.id}, '${event.passcode.replace(/'/g, "\\'")}')" class="btn warning" style="width:100%;">Unlock Controls</button>
        </div>

        <!-- Unlocked Organizer Controls -->
        <div id="manage-controls-box-${event.id}" class="manage-box hidden" style="background-color: #f8fafc; border-color: #2563eb;">
          <h4 style="color:#2563eb;">🔓 Organizer Controls Unlocked</h4>
          <div class="manage-actions">
            <button onclick="toggleAttendeesList(${event.id})" class="btn secondary">View Attendees (${count})</button>
            <button onclick="editEvent(${event.id}, '${event.title.replace(/'/g, "\\'")}', '${event.venue.replace(/'/g, "\\'")}', '${event.event_date}', '${event.event_time}', '${event.organiser_name.replace(/'/g, "\\'")}', '${(event.description || '').replace(/'/g, "\\'")}')" class="btn warning">Edit Event</button>
            <button onclick="deleteEvent(${event.id}, '${event.passcode.replace(/'/g, "\\'")}')" class="btn danger">Delete</button>
          </div>
          <div id="attendees-box-${event.id}" class="hidden" style="margin-top:0.8rem;">
            <hr style="margin-bottom:0.5rem; border:0; border-top:1px solid #cbd5e1;">
            <h5>Attendee List:</h5>
            ${count === 0 ? '<p style="font-size:0.85rem;">No registrations yet.</p>' : `<ul style="padding-left:1.2rem; font-size:0.85rem;">${attendeeList.map(name => `<li>${name}</li>`).join('')}</ul>`}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// PASSCODE VERIFICATION LOGIC
window.toggleManageAuth = (eventId) => {
  const authBox = document.getElementById(`manage-auth-box-${eventId}`);
  const regBox = document.getElementById(`register-box-${eventId}`);
  if (regBox) regBox.classList.add('hidden');
  authBox.classList.toggle('hidden');
};

window.verifyPasscode = (eventId, correctPasscode) => {
  const inputVal = document.getElementById(`auth-input-${eventId}`).value;
  if (inputVal === correctPasscode) {
    document.getElementById(`manage-auth-box-${eventId}`).classList.add('hidden');
    document.getElementById(`manage-controls-box-${eventId}`).classList.remove('hidden');
    showMessage('Passcode verified! Management controls unlocked.');
  } else {
    showMessage('Incorrect passcode! Access denied.', true);
  }
};

window.toggleAttendeesList = (eventId) => {
  const list = document.getElementById(`attendees-box-${eventId}`);
  list.classList.toggle('hidden');
};

// CREATE / UPDATE EVENT
eventForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = eventIdInput.value;
  const eventData = {
    title: titleInput.value.trim(),
    venue: venueInput.value.trim(),
    event_date: dateInput.value,
    event_time: timeInput.value.trim(),
    organiser_name: organiserInput.value.trim(),
    passcode: passcodeInput.value.trim(),
    description: descriptionInput.value.trim()
  };

  if (id) {
    const { error } = await supabaseClient.from('events').update(eventData).eq('id', id);
    if (error) showMessage('Update failed: ' + error.message, true);
    else showMessage('Event updated successfully!');
  } else {
    const { error } = await supabaseClient.from('events').insert([eventData]);
    if (error) showMessage('Creation failed: ' + error.message, true);
    else showMessage('Event created successfully!');
  }

  resetForm();
  switchPage('register');
});

// SUBMIT REGISTRATION
window.toggleRegisterForm = (eventId) => {
  const regBox = document.getElementById(`register-box-${eventId}`);
  const authBox = document.getElementById(`manage-auth-box-${eventId}`);
  if (authBox) authBox.classList.add('hidden');
  regBox.classList.toggle('hidden');
};

window.submitRegistration = async (e, eventId) => {
  e.preventDefault();

  const isStudent = document.getElementById(`reg-status-${eventId}`).value;
  const attendeeName = document.getElementById(`reg-name-${eventId}`).value.trim();
  const attendeeEmail = document.getElementById(`reg-email-${eventId}`).value.trim().toLowerCase();

  const displayName = isStudent === 'Yes' ? `${attendeeName} (Student)` : attendeeName;

  const { error } = await supabaseClient
    .from('registrations')
    .insert([{
      event_id: eventId,
      attendee_name: displayName,
      attendee_email: attendeeEmail
    }]);

  if (error) {
    showMessage('Registration failed: ' + error.message, true);
  } else {
    showMessage('🎉 Registration confirmed!');
    document.getElementById(`register-box-${eventId}`).classList.add('hidden');
    fetchEvents();
  }
};

// EDIT & DELETE
window.editEvent = (id, title, venue, date, time, organiser, description) => {
  eventIdInput.value = id;
  titleInput.value = title;
  venueInput.value = venue;
  dateInput.value = date;
  timeInput.value = time;
  organiserInput.value = organiser;
  descriptionInput.value = description;

  formTitle.textContent = 'Edit Event';
  cancelBtn.style.display = 'inline-block';
  switchPage('create');
};

cancelBtn.addEventListener('click', resetForm);

function resetForm() {
  eventIdInput.value = '';
  eventForm.reset();
  formTitle.textContent = 'Create New Event';
  cancelBtn.style.display = 'none';
}

window.deleteEvent = async (id, passcode) => {
  if (!confirm('Are you sure you want to delete this event? Linked registrations will be cleared.')) return;

  const { error } = await supabaseClient.from('events').delete().eq('id', id);
  if (error) showMessage('Delete failed: ' + error.message, true);
  else showMessage('Event deleted successfully!');

  fetchEvents();
};

// Initial Load
fetchEvents();