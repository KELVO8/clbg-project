// 1. Initialize Supabase Client
const SUPABASE_URL = 'https://dwqifavfgggrdzimvrfx.supabase.co'; // Ensure your verified URL is here
const SUPABASE_KEY = 'sb_publishable_8BoKa-IB_kQPtt2rhi2X4w_or0ImSFV'; // Replace with your actual anon public key
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
const eventsList = document.getElementById('events-list');
const formTitle = document.getElementById('form-title');
const cancelBtn = document.getElementById('cancel-btn');
const statusMessage = document.getElementById('status-message');

// Helper: Display Status Messages
function showMessage(msg, isError = false) {
  statusMessage.textContent = msg;
  statusMessage.className = `message ${isError ? 'error' : 'success'}`;
  statusMessage.classList.remove('hidden');
  setTimeout(() => statusMessage.classList.add('hidden'), 4000);
}

// 2. READ: Fetch and display all events
async function fetchEvents() {
  const { data, error } = await supabaseClient
    .from('events')
    .select('*')
    .order('event_date', { ascending: true });

  if (error) {
    showMessage('Error fetching events: ' + error.message, true);
    return;
  }

  if (!data || data.length === 0) {
    eventsList.innerHTML = '<p>No upcoming events found. Create one above!</p>';
    return;
  }

  eventsList.innerHTML = data.map(event => `
    <div class="event-card">
      <h3>${event.title}</h3>
      <p>📍 <strong>Venue:</strong> ${event.venue}</p>
      <p>📅 <strong>Date:</strong> ${event.event_date} at ${event.event_time}</p>
      <p>👤 <strong>Organiser:</strong> ${event.organiser_name}</p>
      <p>${event.description || ''}</p>
      
      <div class="event-actions">
        <button onclick="toggleRegisterForm(${event.id})" class="btn primary">Register</button>
        <button onclick="editEvent(${event.id}, '${event.title.replace(/'/g, "\\'")}', '${event.venue.replace(/'/g, "\\'")}', '${event.event_date}', '${event.event_time}', '${event.organiser_name.replace(/'/g, "\\'")}', '${(event.description || '').replace(/'/g, "\\'")}')" class="btn warning">Edit</button>
        <button onclick="deleteEvent(${event.id})" class="btn danger">Delete</button>
      </div>

      <!-- Registration Form Container (Hidden by default) -->
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
            <input type="email" id="reg-email-${event.id}" placeholder="Your Student/User Email" required>
          </div>
          <button type="submit" class="btn success">Confirm Registration</button>
        </form>
      </div>
    </div>
  `).join('');
}

// 3. CREATE / UPDATE Event (Organiser Action)
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
    if (error) showMessage(error.message, true);
    else showMessage('Event updated successfully!');
  } else {
    const { error } = await supabaseClient.from('events').insert([eventData]);
    if (error) showMessage(error.message, true);
    else showMessage('Event created successfully!');
  }

  resetForm();
  fetchEvents();
});

// 4. Toggle Registration Form Display
window.toggleRegisterForm = (eventId) => {
  const box = document.getElementById(`register-box-${eventId}`);
  box.classList.toggle('hidden');
};

// 5. SUBMIT Registration to Supabase
window.submitRegistration = async (e, eventId) => {
  e.preventDefault();

  const isStudent = document.getElementById(`reg-status-${eventId}`).value;
  const attendeeName = document.getElementById(`reg-name-${eventId}`).value.trim();
  const attendeeEmail = document.getElementById(`reg-email-${eventId}`).value.trim();

  // Combine student status into name or record if needed
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
    showMessage('🎉 Registration successful! See you at the event.');
    document.getElementById(`register-box-${eventId}`).classList.add('hidden');
  }
};

// Populate Form for EDIT
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
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

cancelBtn.addEventListener('click', resetForm);

function resetForm() {
  eventIdInput.value = '';
  eventForm.reset();
  formTitle.textContent = 'Create New Event';
  cancelBtn.style.display = 'none';
}

// DELETE Event
window.deleteEvent = async (id) => {
  if (!confirm('Are you sure you want to delete this event?')) return;

  const { error } = await supabaseClient.from('events').delete().eq('id', id);
  if (error) showMessage(error.message, true);
  else showMessage('Event deleted successfully!');

  fetchEvents();
};

// Initial Load
fetchEvents();