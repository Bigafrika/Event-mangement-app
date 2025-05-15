// dashboard.js

// Auth state management - This will be updated by init() from localStorage
const authState = {
  isAuthenticated: false, // Default to false, init() will update
  user: null,             // Default to null
  loading: false
};

// Navigation links
const navLinks = [
  { 
    href: 'dashboard.html', 
    label: 'Dashboard', 
    icon: `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`
  },
  { 
    href: 'eventform.html', 
    label: 'Create Event', 
    icon: `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>`
  },
  { 
    href: 'eventlog.html', 
    label: 'Event Log', 
    icon: `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`
  }
];

// State management
let state = {
  user: null, 
  allEvents: [],
  bookedEventIds: [],
  searchTerm: '',
  sortBy: 'date',
};

// Initialize the app
function init() {
  const sessionString = localStorage.getItem('eventlog_session');
  if (sessionString) {
    try {
      const session = JSON.parse(sessionString);
      if (session.user && session.user.username) {
        authState.isAuthenticated = true;
        authState.user = session.user; 
        state.user = session.user;     
      } else {
        console.warn('Session found but user data is invalid or missing username.');
        clearUserSession(); 
      }
    } catch (e) {
      console.error("Error parsing eventlog_session from localStorage:", e);
      clearUserSession(); 
    }
  } else {
    clearUserSession();
  }

  renderUserDropdown(); 
  renderDesktopNav();
  renderMobileNav();
  setupMobileMenu();
  
  loadEvents(); 
  if (authState.isAuthenticated) { 
    loadBookedEvents(); 
  }
  setupEventListeners(); 
  renderEvents(); 
}

function clearUserSession() {
    authState.isAuthenticated = false;
    authState.user = null;
    state.user = null;
    localStorage.removeItem('eventlog_session'); 
}

// Navbar functions
function renderUserDropdown() {
  const container = document.getElementById('userDropdownContainer');
  if (!container) return;

  if (state.user && state.user.username) { 
    container.innerHTML = `
      <div class="dropdown-menu">
        <button id="dropdownTrigger" class="button button-ghost relative h-10 w-10 rounded-full p-0" aria-haspopup="true" aria-expanded="false" aria-label="User menu">
          <div class="avatar h-10 w-10 border-2 border-transparent hover:border-accent-foreground/50 transition-colors">
            <img src="${state.user.avatarUrl}" alt="Avatar for ${state.user.username}" class="avatar-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="avatar-fallback" style="display:none;">${state.user.username.substring(0, 2).toUpperCase()}</div>
          </div>
        </button>
        <div id="dropdownContent" class="dropdown-menu-content hidden" role="menu">
          <div class="dropdown-menu-label">
            <div class="flex flex-col space-y-1">
              <p class="text-sm font-medium leading-none">${state.user.username}</p>
              <p class="text-xs leading-none text-muted-foreground">Welcome!</p>
            </div>
          </div>
          <div class="dropdown-menu-separator"></div>
          <div class="dropdown-menu-item" id="logoutButton" role="menuitem" tabindex="0" style="cursor:pointer;">
            <svg class="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <span>Log out</span>
          </div>
        </div>
      </div>`;

    const trigger = document.getElementById('dropdownTrigger');
    const content = document.getElementById('dropdownContent');
    
    trigger?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = content.classList.toggle('hidden');
      trigger.setAttribute('aria-expanded', String(!isHidden));
      if(!isHidden) content.querySelector('#logoutButton')?.focus();
    });

    document.getElementById('logoutButton')?.addEventListener('click', () => {
      const currentUsername = state.user?.username; 
      clearUserSession(); 
      if (currentUsername) {
        localStorage.removeItem(`eventlog_bookings_${currentUsername}`); 
      }
      showToast('Logged Out', 'You have been successfully logged out.', 'success');
      renderUserDropdown(); 
      renderEvents(); 
    });

    document.addEventListener('click', (e) => {
      if (content && !content.classList.contains('hidden') && !trigger?.contains(e.target) && !content.contains(e.target)) {
        content.classList.add('hidden');
        trigger?.setAttribute('aria-expanded', 'false');
      }
    });
  } else {
    container.innerHTML = `<a href="login.html" class="button button-ghost text-sm font-medium text-accent-foreground hover:bg-accent-foreground/10">Login</a>`;
  }
}

function renderDesktopNav() {
  const nav = document.getElementById('desktopNav');
  if (!nav) return;
  nav.innerHTML = navLinks.map(link => `
    <a href="${link.href}" class="button button-ghost text-sm font-medium text-accent-foreground hover:bg-accent-foreground/10">
      ${link.icon}
      <span class="ml-2">${link.label}</span>
    </a>
  `).join('');
}

function renderMobileNav() {
  const nav = document.getElementById('mobileNav');
  if (!nav) return;
  nav.innerHTML = navLinks.map(link => `
    <a href="${link.href}" class="button button-ghost justify-start text-base font-medium text-accent-foreground hover:bg-accent-foreground/10">
      ${link.icon}
      <span class="ml-2">${link.label}</span>
    </a>
  `).join('');
}

function setupMobileMenu() {
  const button = document.getElementById('mobileMenuButton');
  const menu = document.getElementById('mobileMenu');
  if (!button || !menu) return;
  
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = menu.classList.toggle('open');
    button.setAttribute('aria-expanded', String(isOpen));
  });

  document.querySelectorAll('#mobileNav a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', (e) => {
    if (menu.classList.contains('open') && !menu.contains(e.target) && !button.contains(e.target)) {
        menu.classList.remove('open');
        button.setAttribute('aria-expanded', 'false');
    }
  });
}

// Dashboard data functions
function loadEvents() {
  const storedEvents = localStorage.getItem('eventlog_all_events');
  try {
    state.allEvents = storedEvents ? JSON.parse(storedEvents) : [];
    if (state.allEvents.length === 0) {
        state.allEvents = [
            { id: 'evt1', name: 'Sample Tech Conference', date: '2025-10-15', time: '09:00', location: 'Online', description: 'A great conference.', image: 'https://placehold.co/600x400/2563eb/ffffff?text=Event+1' },
            { id: 'evt2', name: 'Music Workshop', date: '2025-11-02', time: '14:00', location: 'Community Hall', description: 'Learn new music skills.', image: 'https://placehold.co/600x400/16a34a/ffffff?text=Event+2' }
        ];
        localStorage.setItem('eventlog_all_events', JSON.stringify(state.allEvents));
    }
  } catch (e) {
    console.error("Error parsing allEvents from localStorage:", e);
    state.allEvents = [];
  }
}

function loadBookedEvents() {
  if (state.user && state.user.username) { 
    const userKey = `eventlog_bookings_${state.user.username}`;
    const storedBookedEvents = localStorage.getItem(userKey);
    try {
      state.bookedEventIds = storedBookedEvents ? JSON.parse(storedBookedEvents) : [];
    } catch (e) {
      console.error(`Error parsing bookedEvents for ${userKey} from localStorage:`, e);
      state.bookedEventIds = [];
    }
  } else {
    state.bookedEventIds = []; 
  }
}

function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  searchInput?.addEventListener('input', (e) => {
    state.searchTerm = e.target.value;
    renderEvents();
  });
  
  const selectTrigger = document.getElementById('selectTrigger');
  const selectContent = document.getElementById('selectContent');

  selectTrigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = selectContent.classList.toggle('hidden');
    selectTrigger.setAttribute('aria-expanded', String(!isHidden));
  });
  
  document.querySelectorAll('.select-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const target = e.currentTarget; 
      state.sortBy = target.getAttribute('data-value');
      document.getElementById('selectValue').textContent = target.textContent;
      selectContent?.classList.add('hidden');
      selectTrigger.setAttribute('aria-expanded', 'false');
      renderEvents();
    });
  });
  
  document.addEventListener('click', (e) => {
    if (selectContent && !selectContent.classList.contains('hidden') && !selectTrigger?.contains(e.target) && !selectContent.contains(e.target)) {
      selectContent.classList.add('hidden');
      selectTrigger?.setAttribute('aria-expanded', 'false');
    }
  });

  // Event delegation for book and edit buttons
  const eventsContainer = document.getElementById('eventsContainer');
  eventsContainer?.addEventListener('click', (e) => {
    const targetButton = e.target.closest('button');
    if (!targetButton) return;

    const eventId = targetButton.dataset.eventId;
    if (!eventId) return;

    if (targetButton.classList.contains('event-card-button') && !targetButton.classList.contains('edit-event-button')) {
        handleBookEvent(eventId);
    } else if (targetButton.classList.contains('edit-event-button')) {
        handleEditEventPrompt(eventId);
    }
  });
}

// --- Event Management (Book, Edit) ---
function handleBookEvent(eventId) {
  if (!authState.isAuthenticated || !state.user) { 
    showToast('Login Required', 'Please log in to book events.', 'destructive');
    return;
  }
  
  if (state.bookedEventIds.includes(eventId)) {
    showToast('Already Booked', 'You have already booked this event.', '');
    return;
  }
  
  state.bookedEventIds.push(eventId); 
  
  const userKey = `eventlog_bookings_${state.user.username}`;
  localStorage.setItem(userKey, JSON.stringify(state.bookedEventIds));
  
  renderEvents(); 
  showToast('Event Booked!', 'You can view it in your Event Log.', 'success');
}

function handleEditEventPrompt(eventId) {
    if (!authState.isAuthenticated) {
        showToast('Login Required', 'Please log in to edit events.', 'destructive');
        return;
    }

    const eventIndex = state.allEvents.findIndex(event => event.id === eventId);
    if (eventIndex === -1) {
        showToast('Error', 'Event not found.', 'destructive');
        return;
    }

    const currentEvent = state.allEvents[eventIndex];

    const newLocation = prompt("Enter new location (or leave blank to keep current):", currentEvent.location);
    const newTime = prompt("Enter new time (e.g., HH:MM, or leave blank to keep current):", currentEvent.time);

    const updatedDetails = { ...currentEvent }; 
    let changesMade = false;

    if (newLocation !== null && newLocation.trim() !== "" && newLocation !== currentEvent.location) {
        updatedDetails.location = newLocation.trim();
        changesMade = true;
    }
    if (newTime !== null && newTime.trim() !== "" && newTime !== currentEvent.time) {
        if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(newTime.trim())) {
            updatedDetails.time = newTime.trim();
            changesMade = true;
        } else if (newTime.trim() !== "") { // If user entered something but it's invalid
            showToast('Invalid Format', 'Time should be in HH:MM format.', 'destructive');
            return; // Don't proceed with invalid time
        }
    }

    if (changesMade) {
        state.allEvents[eventIndex] = updatedDetails; // Update in state array
        localStorage.setItem('eventlog_all_events', JSON.stringify(state.allEvents)); // Update localStorage
        renderEvents(); // Re-render the UI
        showToast('Event Updated', `"${updatedDetails.name}" has been updated.`, 'success');
    } else {
        showToast('No Changes', 'No changes were made to the event.', '');
    }
}


function getFilteredAndSortedEvents() {
  return state.allEvents
    .filter(event => 
      event.name.toLowerCase().includes(state.searchTerm.toLowerCase()) || 
      (event.location && event.location.toLowerCase().includes(state.searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (state.sortBy === 'date') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (state.sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
}

function renderEvents() {
  const filteredEvents = getFilteredAndSortedEvents();
  const eventsContainer = document.getElementById('eventsContainer');
  const noEventsMessage = document.getElementById('noEventsMessage');
  const noEventsText = document.getElementById('noEventsText');
  
  if (!eventsContainer || !noEventsMessage || !noEventsText) {
      console.warn("One or more event rendering containers not found.");
      return;
  }
  
  if (filteredEvents.length === 0) {
    eventsContainer.innerHTML = '';
    noEventsMessage.classList.remove('hidden');
    noEventsText.textContent = state.allEvents.length === 0 
      ? "There are no events available right now. Check back later or create one!" 
      : "No events match your current search or filter criteria.";
  } else {
    noEventsMessage.classList.add('hidden');
    eventsContainer.innerHTML = filteredEvents.map(event => {
      const isBooked = state.user ? state.bookedEventIds.includes(event.id) : false; 
      const fallbackImage = `https://placehold.co/600x400/e2e8f0/64748b?text=${encodeURIComponent(event.name.substring(0,10))}`;
      // Determine if the current user can edit (e.g., if they created the event, or are an admin)
      // For this demo, we'll assume any logged-in user can edit any event.
      const canEdit = authState.isAuthenticated; 

      return `
      <div class="event-card" data-id="${event.id}">
        <img src="${event.image || fallbackImage}" alt="${event.name}" class="event-card-image" onerror="this.onerror=null;this.src='${fallbackImage}';">
        <div class="event-card-content">
          <h3 class="event-card-title">${event.name}</h3>
          <div class="event-card-details">
            <p><strong>Date:</strong> ${formatDate(event.date)}</p>
            <p><strong>Time:</strong> ${event.time || 'N/A'}</p>
            <p><strong>Location:</strong> ${event.location || 'N/A'}</p>
            <p>${event.description || 'No description available.'}</p>
          </div>
          <div class="event-card-actions" style="margin-top: auto; display: flex; gap: 0.5rem;">
            <button 
              class="button event-card-button flex-1 ${isBooked ? 'booked' : ''}" 
              data-event-id="${event.id}"
              ${isBooked ? 'disabled' : ''} 
              aria-label="${isBooked ? 'Event ' + event.name + ' is booked' : 'Book event ' + event.name}"
            >
              ${isBooked ? 'Booked' : 'Book Event'}
            </button>
            ${canEdit ? `
            <button 
              class="button edit-event-button flex-1 button-ghost" 
              data-event-id="${event.id}"
              aria-label="Edit event ${event.name}"
              style="background-color: #6c757d; color: white;" 
            >
              Edit
            </button>
            ` : ''}
          </div>
        </div>
      </div>
    `}).join('');
  }
}

// Helper functions
function formatDate(dateString) {
  if (!dateString) return 'Date TBD';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  try {
    return new Date(dateString).toLocaleDateString(undefined, options);
  } catch (e) {
    return dateString; 
  }
}

function showToast(title, description, variant = '') {
  const toastContainer = document.getElementById('toastContainer') || document.body; 
  const toast = document.createElement('div');
  toast.className = `toast ${variant}`; 
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <div class="toast-title">${title}</div>
    <div>${description}</div>
  `;
  
  toastContainer.appendChild(toast);
  
  toast.style.opacity = '1'; 
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 300); 
  }, 3000); 
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
