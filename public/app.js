const apiUrl = 'https://time-capsule-3kgt.onrender.com/api/capsules';

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
    if (res.ok) {
      const user = await res.json();
      document.getElementById('username').textContent = user.name;
    } else {
      // Not logged in, redirect
      window.location.href = '/login.html';
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
  const popup = document.getElementById('popup');
  const content = document.querySelector('#popup .popup-content');

  content.innerHTML = '';

  if (!isUnlocked) {
    content.innerHTML = `<p>🔒 This message is locked until ${new Date(messageData.revealDate).toLocaleDateString()}</p>`;
  } else {
    content.innerHTML = `
      <h3>${messageData.title}</h3>
      <p>${messageData.message}</p>
      ${messageData.imageUrl ? `<img src="${messageData.imageUrl}" alt="Capsule Image" style="max-width:100%;">` : ''}
      <p><strong>Reveal Date:</strong> ${new Date(messageData.revealDate).toLocaleDateString()}</p>
    `;
  }

  popup.classList.add('visible');
}

  popup.classList.add('visible');
}

function closePopup() {
  document.getElementById('popup').classList.remove('visible');
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
