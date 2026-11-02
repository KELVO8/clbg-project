// 1. Initialize Supabase Client
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
  setTimeout(() => statusMessage.classList.add('hidden'), 4000);
}

// 2. READ: Fetch and display all events
async function fetchEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true });

  if (error) {
    showMessage('Error fetching events: ' + error.message, true);
    return;
  }

  if (!data || data.length === 0) {
    eventsList.innerHTML = '<p>No upcoming events found. Add one above!</p>';
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
        <button onclick="editEvent(${event.id}, '${event.title.replace(/'/g, "\\'")}', '${event.venue.replace(/'/g, "\\'")}', '${event.event_date}', '${event.event_time}', '${event.organiser_name.replace(/'/g, "\\'")}', '${(event.description || '').replace(/'/g, "\\'")}')" class="btn warning">Edit</button>
        <button onclick="deleteEvent(${event.id})" class="btn danger">Delete</button>
      </div>
    </div>
  `).join('');
}

// 3. CREATE / UPDATE Event
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
    // UPDATE
    const { error } = await supabase.from('events').update(eventData).eq('id', id);
    if (error) showMessage(error.message, true);
    else showMessage('Event updated successfully!');
  } else {
    // CREATE
    const { error } = await supabase.from('events').insert([eventData]);
    if (error) showMessage(error.message, true);
    else showMessage('Event created successfully!');
  }

  resetForm();
  fetchEvents();
});

// 4. Populate Form for EDIT
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

// Cancel Edit
cancelBtn.addEventListener('click', resetForm);

function resetForm() {
  eventIdInput.value = '';
  eventForm.reset();
  formTitle.textContent = 'Create New Event';
  cancelBtn.style.display = 'none';
}

// 5. DELETE Event
window.deleteEvent = async (id) => {
  if (!confirm('Are you sure you want to delete this event?')) return;

  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) showMessage(error.message, true);
  else showMessage('Event deleted successfully!');

  fetchEvents();
};

// Initial Fetch on Load
fetchEvents();