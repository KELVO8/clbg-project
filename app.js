// 1. Initialize Supabase Client
const SUPABASE_URL = 'https://dwqifavfgggrdzimvrfx.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_8BoKa-IB_kQPtt2rhi2X4w_or0ImSFV';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM Elements
const eventForm = document.getElementById('event-form');
const eventIdInput = document.getElementById('event-id');
const titleInput = document.getElementById('title');
const venueInput = document.getElementById('venue');
const dateInput = document.getElementById('event_date');
const timeInput = document.getElementById('event_time');
const organiserInput = document.getElementById('organiser_name');
const descriptionInput = document.getElementById('description');
const registerEventsList = document.getElementById('register-events-list');
const formTitle = document.getElementById('form-title');
const cancelBtn = document.getElementById('cancel-btn');
const statusMessage = document.getElementById('status-message');

// Set minimum date selector to Today
if (dateInput) {
  dateInput.min = new Date().toISOString().split('T')[0];
}

// 2. PAGE SWITCHER FUNCTION
window.switchPage = (pageName) => {
  // Hide all views
  document.querySelectorAll('.page-view').forEach(view => view.classList.add('hidden'));
  // Remove active class from nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

  // Show target page & activate button
  document.getElementById(`page-${pageName}`).classList.remove('hidden');
  document.getElementById(`nav-${pageName}`).classList.add('active');

  // Refresh data whenever page is switched
  fetchEvents();
};

// Helper: Display Messages
function showMessage(msg, isError = false) {
  statusMessage.textContent = msg;
  statusMessage.className = `message ${isError ? 'error' : 'success'}`;
  statusMessage.classList.remove('hidden');
  setTimeout(() => statusMessage.classList.add('hidden'), 4000);
}

// 3. READ: Fetch Events & Update Home Stats + Register Page
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

  // Update Home Page Summary Stats
  document.getElementById('stat-total-events').textContent = events ? events.length : 0;
  document.getElementById('stat-total-regs').textContent = registrations ? registrations.length : 0;

  // Handle empty event list state on Register Page
  if (!events || events.length === 0) {
    registerEventsList.innerHTML = '<div class="card"><p>No events available right now. Click "Create Event" in the sidebar to add one!</p></div>';
    return;
  }

  const regMap = {};
  if (registrations) {
    registrations.forEach(r => {
      if (!regMap[r.event_id]) regMap[r.event_id] = [];
      regMap[r.event_id].push(r.attendee_name);
    });
  }

  // Render events on the Register Page
  registerEventsList.innerHTML = events.map(event => {
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
          <button onclick="toggleAttendeesList(${event.id})" class="btn secondary">View List (${count})</button>
          <button onclick="editEvent(${event.id}, '${event.title.replace(/'/g, "\\'")}', '${event.venue.replace(/'/g, "\\'")}', '${event.event_date}', '${event.event_time}', '${event.organiser_name.replace(/'/g, "\\'")}', '${(event.description || '').replace(/'/g, "\\'")}')" class="btn warning">Edit</button>
          <button onclick="deleteEvent(${event.id})" class="btn danger">Delete</button>
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

        <!-- Attendees List Container -->
        <div id="attendees-box-${event.id}" class="registration-box hidden">
          <h4>Registered Attendees (${count})</h4>
          ${count === 0 ? '<p>No registrations yet.</p>' : `<ul style="padding-left: 1.2rem; font-size: 0.9rem;">${attendeeList.map(name => `<li>${name}</li>`).join('')}</ul>`}
        </div>
      </div>
    `;
  }).join('');
}

// 4. CREATE / UPDATE Event
eventForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = eventIdInput.value;
  const eventData = {
    title: titleInput.value.trim(),
    venue: venueInput.value.trim(),
    event_date: dateInput.value,
    event_time: timeInput.value.trim(),
    organiser_name: organiserInput.value.trim(),
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
  switchPage('register'); // Switch user straight to the Register Page to see their new event!
});

// 5. Registration Toggle & Submission
window.toggleRegisterForm = (eventId) => {
  const box = document.getElementById(`register-box-${eventId}`);
  const list = document.getElementById(`attendees-box-${eventId}`);
  if (list) list.classList.add('hidden');
  box.classList.toggle('hidden');
};

window.toggleAttendeesList = (eventId) => {
  const list = document.getElementById(`attendees-box-${eventId}`);
  const box = document.getElementById(`register-box-${eventId}`);
  if (box) box.classList.add('hidden');
  list.classList.toggle('hidden');
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

// EDIT & DELETE Functions
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
  switchPage('create'); // Switch to Create Form view for editing
};

cancelBtn.addEventListener('click', resetForm);

function resetForm() {
  eventIdInput.value = '';
  eventForm.reset();
  formTitle.textContent = 'Create New Event';
  cancelBtn.style.display = 'none';
}

window.deleteEvent = async (id) => {
  if (!confirm('Are you sure you want to delete this event? Linked registrations will be cleared.')) return;

  const { error } = await supabaseClient.from('events').delete().eq('id', id);
  if (error) showMessage('Delete failed: ' + error.message, true);
  else showMessage('Event deleted successfully!');

  fetchEvents();
};

// Initial Load
fetchEvents();