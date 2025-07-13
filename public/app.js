let currentMessageId = null;

// public/app.js
const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000/api/capsules' : 'https://time-capsule-3kgt.onrender.com/api/capsules';
const authUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000/api/auth' : 'https://time-capsule-3kgt.onrender.com/api/auth';

let capsules = [];

// login
const loginBtn = document.getElementById('loginBtn');

if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    window.location.href = '/api/auth/login';
  });
}

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
   logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('user');
      window.location.href = 'index.html';
   });
}

// On dashboard load
if (window.location.pathname.includes('dashboard.html')) {

   if (window.location.pathname.includes('dashboard.html')) {
   getUserInfo(); // ✅ This now handles login check
   fetchMessages();
   setupForm();
   }
}

// Fetch user session info
async function getUserInfo() {
  try {
    const res = await fetch('/api/auth/user', { credentials: 'include' });
    if (!res.ok) {
      window.location.href = '/login.html';
      return;
    }
    const data = await res.json();
    // Update username display
    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay) {
      usernameDisplay.textContent = data.username || 'User';
    }
  } catch (err) {
    console.error('Error checking login:', err);
    window.location.href = '/login.html';
  }
}

// Fetch and display messages
async function fetchMessages() {
   try {
      const res = await fetch(apiUrl, {
         credentials: 'include', // ✅ This tells the browser to send cookies (session)
      });
      if (!res.ok) throw new Error('Unauthorized or error fetching data');
      const data = await res.json();
      displayMessages(data);
   } catch (err) {
      console.error('Error loading messages:', err);
      window.location.href = 'index.html'; // Optional fallback
   }
}

// Display messages in grid
function displayMessages(messages) {
   const grid = document.getElementById('messageGrid');
   grid.innerHTML = '';
   messages.forEach(msg => {
      const now = new Date();
      const revealed = new Date(msg.revealDate) <= now;
      const card = document.createElement('div');
      card.className = `message-card ${revealed ? 'unlocked' : 'locked'}`;
      card.innerHTML = `
         <h4>${revealed ? msg.title : '🔒 Locked Message'}</h4>
         <p><strong>Date:</strong> ${new Date(msg.revealDate).toLocaleDateString()}</p>
      `;
      card.addEventListener('click', () => showPopup(msg, revealed));
      grid.appendChild(card);
   });
}

// Show popup
function showPopup(messageData, isUnlocked) {
  console.log('showPopup called with:', messageData);
  if (!messageData._id) {
    console.warn('No _id found in messageData!');
  }
  
  currentMessageId = messageData._id;
  currentCapsule = messageData;
  const popup = document.getElementById('popup');
  const titleEl = document.getElementById('popupTitle');
  const messageEl = document.getElementById('popupMessage');
  const imageEl = document.getElementById('popupImage');
  const dateEl = document.getElementById('popupDate');

  if (!isUnlocked) {
    titleEl.textContent = '🔒 Locked Message';
    messageEl.textContent = '';
    imageEl.style.display = 'none';
    dateEl.textContent = `Unlocks on: ${new Date(messageData.revealDate).toLocaleDateString()}`;
  } else {
    titleEl.textContent = messageData.title;
    messageEl.textContent = messageData.message;
    dateEl.textContent = `Revealed on: ${new Date(messageData.revealDate).toLocaleDateString()}`;

    if (messageData.imageUrl) {
      imageEl.src = messageData.imageUrl;
      imageEl.style.display = 'block';
    } else {
      imageEl.style.display = 'none';
    }
  }

  popup.classList.add('visible');
}

function closePopup() {
  document.getElementById('popup').classList.remove('visible');
}

document.getElementById('closePopup').addEventListener('click', closePopup);

// Edit & Delete button logic
document.addEventListener('DOMContentLoaded', () => {
  const editBtn = document.getElementById('editMessageBtn');
  const deleteBtn = document.getElementById('deleteMessageBtn');
  const editPopup = document.getElementById('editPopup');
  const closeEditBtn = document.getElementById('closeEditPopup');
  const editForm = document.getElementById('editForm');

  if (!editBtn || !deleteBtn || !editForm || !editPopup || !closeEditBtn) {
    console.error('Edit/delete popup or form elements missing in the DOM.');
    return;
  }

  // Close the edit popup
  closeEditBtn.addEventListener('click', () => {
    editPopup.classList.remove('visible');
  });

  // Open the edit popup
  editBtn.addEventListener('click', () => {
    if (!currentCapsule) {
      alert('No message selected.');
      return;
    }

    // Hide view popup
    closePopup();

    // Populate form
    document.getElementById('editTitle').value = currentCapsule.title;
    document.getElementById('editMessage').value = currentCapsule.message;
    document.getElementById('editRevealDate').value = currentCapsule.revealDate.split('T')[0];

    // Show edit popup
    editPopup.classList.add('visible');
  });

  // Handle edit form submission
  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageId = currentCapsule?._id;
    if (!messageId) return;

    const payload = {
      title: document.getElementById('editTitle').value,
      message: document.getElementById('editMessage').value,
      revealDate: document.getElementById('editRevealDate').value,
    };

    try {
      const response = await fetch(`/api/capsules/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Edit failed:', error);
        alert('Failed to update the message.');
        return;
      }

      alert('Message updated successfully!');
      editPopup.classList.remove('visible');
      fetchMessages(); // Refresh list
    } catch (err) {
      console.error('Update error:', err);
      alert('Error updating message.');
    }
  });
});

//Edit Form
function openEditForm() {
  if (!currentCapsule) {
    alert('Message not loaded.');
    return;
  }

  document.getElementById('editTitle').value = currentCapsule.title;
  document.getElementById('editMessage').value = currentCapsule.message;
  document.getElementById('editRevealDate').value = currentCapsule.revealDate.split('T')[0];

  document.getElementById('editForm').style.display = 'block';
}

// Form handler
function setupForm() {
  const form = document.getElementById('messageForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const payload = {
      title: formData.get('title'),
      message: formData.get('message'),
      revealDate: formData.get('revealDate'),
      imageUrl: '', // We'll add image support later
    };

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json();

        //Show confirmation
        alert('Message created successfully!');
        form.reset();
        fetchMessages(); // Refresh messages
      } else {
        const errorData = await res.json();
        console.error('Server error:', errorData);
        alert('Message creation failed: ' + (errorData.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('Failed to send message. Please try again.');
    }
  });
}

// Message Filters
function filterMessages(type) {
  const allCards = document.querySelectorAll('.message-card');

  allCards.forEach(card => {
    if (type === 'all') {
      card.style.display = 'block';
    } else if (type === 'unlocked' && card.classList.contains('unlocked')) {
      card.style.display = 'block';
    } else if (type === 'locked' && card.classList.contains('locked')) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });

  // Remove 'active' class from all buttons
  const buttons = document.querySelectorAll('.filters button');
  buttons.forEach(btn => btn.classList.remove('active'));

  // Add 'active' class to the clicked button
  const activeButton = document.getElementById('btn-' + type);
  if (activeButton) {
    activeButton.classList.add('active');
  }
}
