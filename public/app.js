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
   const user = JSON.parse(localStorage.getItem('user'));
   if (!user) window.location.href = 'index.html';
   document.getElementById('username').textContent = user.name;

   getUserInfo();
   fetchMessages();
   setupForm();
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
         headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}` }
      });
      const data = await res.json();
      displayMessages(data);
   } catch (err) {
      console.error('Error loading messages:', err);
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
      card.addEventListener('click', () => openPopup(msg, revealed));
      grid.appendChild(card);
   });
}

// Show popup
function showPopup(messageData) {
  const popup = document.getElementById('popup');
  const content = document.getElementById('popup-content');

  // Clear old content
  content.innerHTML = '';

  if (messageData.locked) {
    content.innerHTML = `<p>🔒 This message is locked until ${messageData.revealDate}</p>`;
  } else {
    content.innerHTML = `
      <h3>${messageData.title}</h3>
      <p>${messageData.message}</p>
      ${messageData.imageUrl ? `<img src="${messageData.imageUrl}" alt="Capsule Image" style="max-width:100%;">` : ''}
    `;
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
         imageUrl: '', // You can implement image uploading to add real URLs
      };

      try {
         const res = await fetch(apiUrl, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}`,
         },
         body: JSON.stringify(payload),
         });
         if (res.ok) {
         form.reset();
         fetchMessages();
         } else {
         alert('Error submitting message');
         }
      } catch (err) {
         console.error('Submission failed:', err);
      }
   });
}
