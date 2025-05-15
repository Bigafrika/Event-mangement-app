// Form validation
const eventFormSchema = {
  name: {
    minLength: 3,
    errorMessage: 'Event name must be at least 3 characters'
  },
  date: {
    required: true,
    errorMessage: 'Event date is required'
  },
  time: {
    pattern: /^([01]\d|2[0-3]):([0-5]\d)$/,
    errorMessage: 'Invalid time format (HH:MM)'
  },
  location: {
    minLength: 3,
    errorMessage: 'Location must be at least 3 characters'
  },
  description: {
    minLength: 10,
    errorMessage: 'Description must be at least 10 characters'
  }
};

// DOM elements
const eventForm = document.getElementById('eventForm');
const nameInput = document.getElementById('name');
const dateTrigger = document.getElementById('dateTrigger');
const dateDisplay = document.getElementById('dateDisplay');
const datePicker = document.getElementById('datePicker');
const currentMonth = document.getElementById('currentMonth');
const calendarDays = document.getElementById('calendarDays');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const timeInput = document.getElementById('time');
const locationInput = document.getElementById('location');
const descriptionInput = document.getElementById('description');
const imageInput = document.getElementById('imageUrl');
const submitBtn = document.getElementById('submitBtn');
const submitText = document.getElementById('submitText');
const spinner = document.getElementById('spinner');
const backButton = document.getElementById('backButton');

// Error elements
const nameError = document.getElementById('nameError');
const dateError = document.getElementById('dateError');
const timeError = document.getElementById('timeError');
const locationError = document.getElementById('locationError');
const descriptionError = document.getElementById('descriptionError');

// Calendar state
let currentDate = new Date();
let selectedDate = null;

// Initialize the form
function initForm() {
  // Set up event listeners
  setupEventListeners();
  
  // Initialize calendar
  renderCalendar();
  
  // Set up back button
  if (backButton) {
    backButton.addEventListener('click', () => {
      window.location.href = 'dashboard.html';
    });
  }
}

// Set up event listeners
function setupEventListeners() {
  if (!eventForm) return;

  // Date picker toggle
  if (dateTrigger) {
    dateTrigger.addEventListener('click', toggleDatePicker);
  }

  // Month navigation
  if (prevMonthBtn) {
    prevMonthBtn.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar();
    });
  }

  if (nextMonthBtn) {
    nextMonthBtn.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar();
    });
  }

  // Form submission
  eventForm.addEventListener('submit', handleFormSubmit);

  // Input validation
  if (nameInput) nameInput.addEventListener('blur', validateName);
  if (timeInput) timeInput.addEventListener('blur', validateTime);
  if (locationInput) locationInput.addEventListener('blur', validateLocation);
  if (descriptionInput) descriptionInput.addEventListener('blur', validateDescription);
}

// Toggle date picker visibility
function toggleDatePicker() {
  datePicker.classList.toggle('show');
}

// Render the calendar
function renderCalendar() {
  if (!currentMonth || !calendarDays) return;

  // Update month display
  currentMonth.textContent = new Intl.DateTimeFormat('en-US', { 
    month: 'long', 
    year: 'numeric' 
  }).format(currentDate);

  // Clear previous days
  calendarDays.innerHTML = '';

  // Get first day of month and total days in month
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  // Get day of week for first day (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = firstDay.getDay();

  // Add empty cells for days before first day of month
  for (let i = 0; i < firstDayOfWeek; i++) {
    const emptyCell = document.createElement('div');
    calendarDays.appendChild(emptyCell);
  }

  // Add day cells
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = day.toString();

    // Highlight selected date
    if (selectedDate && isSameDay(date, selectedDate)) {
      dayElement.classList.add('selected');
    }

    // Disable past dates
    if (date < today) {
      dayElement.classList.add('disabled');
    } else {
      dayElement.addEventListener('click', () => selectDate(date));
    }

    calendarDays.appendChild(dayElement);
  }
}

// Select a date
function selectDate(date) {
  selectedDate = date;
  updateDateDisplay();
  datePicker.classList.remove('show');
  validateDate();
}

// Update the date display
function updateDateDisplay() {
  if (!dateDisplay) return;

  if (selectedDate) {
    dateDisplay.textContent = new Intl.DateTimeFormat('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(selectedDate);
    dateDisplay.dataset.date = selectedDate.toISOString().split('T')[0];
  } else {
    dateDisplay.textContent = 'Pick a date';
    dateDisplay.dataset.date = '';
  }
}

// Check if two dates are the same day
function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

// Form validation functions
function validateName() {
  if (!nameInput || !nameError) return false;
  
  const isValid = nameInput.value.length >= eventFormSchema.name.minLength;
  nameError.textContent = isValid ? '' : eventFormSchema.name.errorMessage;
  nameError.style.display = isValid ? 'none' : 'block';
  return isValid;
}

function validateDate() {
  if (!dateError) return false;
  
  const isValid = selectedDate !== null;
  dateError.textContent = isValid ? '' : eventFormSchema.date.errorMessage;
  dateError.style.display = isValid ? 'none' : 'block';
  return isValid;
}

function validateTime() {
  if (!timeInput || !timeError) return false;
  
  const isValid = eventFormSchema.time.pattern.test(timeInput.value);
  timeError.textContent = isValid ? '' : eventFormSchema.time.errorMessage;
  timeError.style.display = isValid ? 'none' : 'block';
  return isValid;
}

function validateLocation() {
  if (!locationInput || !locationError) return false;
  
  const isValid = locationInput.value.length >= eventFormSchema.location.minLength;
  locationError.textContent = isValid ? '' : eventFormSchema.location.errorMessage;
  locationError.style.display = isValid ? 'none' : 'block';
  return isValid;
}

function validateDescription() {
  if (!descriptionInput || !descriptionError) return false;
  
  const isValid = descriptionInput.value.length >= eventFormSchema.description.minLength;
  descriptionError.textContent = isValid ? '' : eventFormSchema.description.errorMessage;
  descriptionError.style.display = isValid ? 'none' : 'block';
  return isValid;
}

function validateForm() {
  const isNameValid = validateName();
  const isDateValid = validateDate();
  const isTimeValid = validateTime();
  const isLocationValid = validateLocation();
  const isDescriptionValid = validateDescription();

  return isNameValid && isDateValid && isTimeValid && isLocationValid && isDescriptionValid;
}

// Form submission handler
async function handleFormSubmit(e) {
  e.preventDefault();

  if (!validateForm()) return;

  // Show loading state
  submitBtn.disabled = true;
  spinner.style.display = 'inline-block';
  submitText.textContent = 'Creating...';

  try {
    // Create new event
    const newEvent = {
      id: 'event-' + Date.now(),
      name: nameInput.value,
      date: dateDisplay.dataset.date,
      time: timeInput.value,
      location: locationInput.value,
      description: descriptionInput.value,
      image: imageInput.value || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
    };

    // Save to localStorage
    const existingEvents = JSON.parse(localStorage.getItem('eventlog_all_events') || '[]');
    existingEvents.push(newEvent);
    localStorage.setItem('eventlog_all_events', JSON.stringify(existingEvents));

    // Show success and redirect
    showToast('Event Created!', 'Redirecting to dashboard...', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1500);

  } catch (error) {
    console.error('Error creating event:', error);
    showToast('Error', 'Failed to create event. Please try again.', 'destructive');
  } finally {
    // Reset loading state
    submitBtn.disabled = false;
    spinner.style.display = 'none';
    submitText.textContent = 'Create Event';
  }
}

// Show toast notification
function showToast(title, description, variant = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${variant}`;
  toast.innerHTML = `
    <div class="toast-title">${title}</div>
    <div class="toast-description">${description}</div>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-hide');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initForm);