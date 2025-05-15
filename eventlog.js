document.addEventListener('DOMContentLoaded', function() {
  // Get user from the session stored by dashboard.js (or a login page)
  const sessionString = localStorage.getItem('eventlog_session');
  let username;

  if (sessionString) {
    try {
      const session = JSON.parse(sessionString);
      username = session.user?.username;
    } catch (e) {
      console.error("Error parsing session data:", e);
      // Potentially redirect to login or show error
    }
  }
  
  if (!username) {
    // If no username found, redirect to login or show a message.
    // This indicates that the user is not logged in or session is missing/corrupted.
    console.warn('No username found in session. Redirecting to login.');
    // window.location.href = 'login.html'; // Uncomment to enforce login
    // For demo purposes, if login isn't set up, you might fall back or show an error.
    const eventsList = document.getElementById('bookedEventsList');
    if (eventsList) {
        eventsList.innerHTML = `<div class="no-events"><p>Please <a href="login.html">log in</a> to see your booked events.</p></div>`;
    }
    return;
  }

  // DOM elements
  const eventsList = document.getElementById('bookedEventsList');
  if (!eventsList) {
    console.error("Element with ID 'bookedEventsList' not found.");
    return;
  }
  
  // Load and show events
  loadAndDisplayBookedEvents();

  function loadAndDisplayBookedEvents() {
    let allEvents = [];
    let bookedIds = [];

    // Get all events
    const allEventsString = localStorage.getItem('eventlog_all_events');
    if (allEventsString) {
      try {
        allEvents = JSON.parse(allEventsString);
      } catch (e) {
        console.error("Error parsing allEvents from localStorage:", e);
        allEvents = []; // Default to empty if parsing fails
      }
    }
    
    // Get user's booked event IDs
    const bookedIdsString = localStorage.getItem(`eventlog_bookings_${username}`);
    if (bookedIdsString) {
      try {
        bookedIds = JSON.parse(bookedIdsString);
      } catch (e) {
        console.error(`Error parsing bookedIds for ${username} from localStorage:`, e);
        bookedIds = []; // Default to empty
      }
    }
    
    // Filter to get the actual booked event objects
    const bookedEvents = allEvents.filter(event => bookedIds.includes(event.id));
    
    if (bookedEvents.length === 0) {
      eventsList.innerHTML = `
        <div class="no-events" style="text-align: center; padding: 20px; color: #555;">
          <p>You haven't booked any events yet.</p>
          <a href="dashboard.html" style="display: inline-block; margin-top: 10px; padding: 8px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">Browse Events</a>
        </div>
      `;
    } else {
      eventsList.innerHTML = bookedEvents.map(event => {
        const fallbackImage = `https://placehold.co/300x200/e2e8f0/64748b?text=${encodeURIComponent(event.name.substring(0,10))}`;
        return `
        <div class="event-card" data-event-id="${event.id}" style="border: 1px solid #ddd; border-radius: 5px; margin-bottom: 15px; padding: 10px; box-shadow: 2px 2px 5px rgba(0,0,0,0.1);">
          <img src="${event.image || fallbackImage}" alt="${event.name}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 4px;" onerror="this.onerror=null;this.src='${fallbackImage}';">
          <h3 style="margin-top: 10px; margin-bottom: 5px; font-size: 1.2em;">${event.name}</h3>
          <p style="font-size: 0.9em; color: #333;">${new Date(event.date).toLocaleDateString()} at ${event.time || 'N/A'}</p>
          <p style="font-size: 0.9em; color: #333;">${event.location || 'N/A'}</p>
          <button class="delete-btn" data-id="${event.id}" style="margin-top: 10px; padding: 5px 10px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">Remove</button>
        </div>
      `}).join('');
      
      // Add delete handlers
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const eventIdToRemove = this.dataset.id;
          if (confirm('Are you sure you want to remove this event from your bookings?')) {
            // Remove from bookedIds array
            const updatedBookedIds = bookedIds.filter(id => id !== eventIdToRemove);
            // Save updated array to localStorage
            localStorage.setItem(`eventlog_bookings_${username}`, JSON.stringify(updatedBookedIds));
            // Reload/re-render the list
            loadAndDisplayBookedEvents(); 
            // Optionally, show a toast message
            // showToast('Event Removed', 'The event has been removed from your log.', 'success'); 
          }
        });
      });
    }
  }
});
