// 1. CONNECT TO SUPABASE
// Replace both placeholders with the values from your Supabase project.
const SUPABASE_URL = "https://dwqifavfgggrdzimvrfx.supabase.co/rest/v1/";
const SUPABASE_KEY = "sb_publishable_8BoKa-IB_kQPtt2rhi2X4w_or0ImSFV";

// The Supabase CDN in index.html makes window.supabase available.
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. GET THE HTML ELEMENTS WE NEED
const eventForm = document.getElementById("event-form");
const eventIdInput = document.getElementById("event-id");
const titleInput = document.getElementById("title");
const venueInput = document.getElementById("venue");
const dateInput = document.getElementById("event_date");
const timeInput = document.getElementById("event_time");
const organiserInput = document.getElementById("organiser_name");
const descriptionInput = document.getElementById("description");
const eventsList = document.getElementById("events-list");
const formTitle = document.getElementById("form-title");
const cancelBtn = document.getElementById("cancel-btn");
const submitBtn = document.getElementById("submit-btn");
const statusMessage = document.getElementById("status-message");

// 3. SHOW A MESSAGE AFTER AN OPERATION
let messageTimer;

function showMessage(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.className = isError ? "message error" : "message success";

  clearTimeout(messageTimer);
  messageTimer = setTimeout(() => {
    statusMessage.className = "message hidden";
  }, 4000);
}

// 4. READ: GET EVENTS FROM THE SUPABASE DATABASE
async function fetchEvents() {
  eventsList.textContent = "Loading events...";

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  if (error) {
    eventsList.textContent = "Could not load events.";
    showMessage("Error loading events: " + error.message, true);
    return;
  }

  if (!data || data.length === 0) {
    eventsList.textContent = "No events found. Add one above!";
    return;
  }

  // Build each card using textContent, rather than inserting user text as HTML.
  eventsList.replaceChildren();

  data.forEach((event) => {
    const card = document.createElement("article");
    card.className = "event-card";

    const heading = document.createElement("h3");
    heading.textContent = event.title;

    const venue = document.createElement("p");
    venue.textContent = "📍 Venue: " + event.venue;

    const date = document.createElement("p");
    date.textContent = "📅 Date: " + event.event_date + " at " + event.event_time;

    const organiser = document.createElement("p");
    organiser.textContent = "👤 Organiser: " + event.organiser_name;

    const description = document.createElement("p");
    description.textContent = event.description || "";

    const actions = document.createElement("div");
    actions.className = "event-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "btn warning";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => editEvent(event));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "btn danger";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteEvent(event.id));

    actions.append(editButton, deleteButton);
    card.append(heading, venue, date, organiser, description, actions);
    eventsList.appendChild(card);
  });
}

// 5. CREATE OR UPDATE: SAVE THE FORM TO SUPABASE
eventForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const id = eventIdInput.value;

  const eventData = {
    title: titleInput.value.trim(),
    venue: venueInput.value.trim(),
    event_date: dateInput.value,
    event_time: timeInput.value.trim(),
    organiser_name: organiserInput.value.trim(),
    description: descriptionInput.value.trim()
  };

  if (
    !eventData.title ||
    !eventData.venue ||
    !eventData.event_date ||
    !eventData.event_time ||
    !eventData.organiser_name
  ) {
    showMessage("Please complete all required fields.", true);
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = id ? "Updating..." : "Saving...";

  try {
    let error;

    if (id) {
      // UPDATE an existing event whose ID matches.
      ({ error } = await supabase
        .from("events")
        .update(eventData)
        .eq("id", id));
    } else {
      // CREATE a new event.
      ({ error } = await supabase
        .from("events")
        .insert([eventData]));
    }

    if (error) {
      showMessage("Could not save event: " + error.message, true);
      return;
    }

    showMessage(id ? "Event updated successfully!" : "Event created successfully!");
    resetForm();
    await fetchEvents();
  } catch (error) {
    showMessage("Something went wrong: " + error.message, true);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Save Event";
  }
});

// 6. PUT AN EXISTING EVENT INTO THE FORM FOR EDITING
function editEvent(event) {
  eventIdInput.value = event.id;
  titleInput.value = event.title || "";
  venueInput.value = event.venue || "";
  dateInput.value = event.event_date || "";
  timeInput.value = event.event_time || "";
  organiserInput.value = event.organiser_name || "";
  descriptionInput.value = event.description || "";

  formTitle.textContent = "Edit Event";
  submitBtn.textContent = "Update Event";
  cancelBtn.style.display = "inline-block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// 7. RESET THE FORM
function resetForm() {
  eventIdInput.value = "";
  eventForm.reset();
  formTitle.textContent = "Create New Event";
  submitBtn.textContent = "Save Event";
  cancelBtn.style.display = "none";
}

cancelBtn.addEventListener("click", resetForm);

// 8. DELETE: REMOVE AN EVENT FROM SUPABASE
async function deleteEvent(id) {
  const confirmed = window.confirm("Are you sure you want to delete this event?");
  if (!confirmed) return;

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id);

  if (error) {
    showMessage("Could not delete event: " + error.message, true);
    return;
  }

  showMessage("Event deleted successfully!");
  await fetchEvents();
}

// 9. LOAD SAVED EVENTS WHEN THE PAGE OPENS
fetchEvents();
