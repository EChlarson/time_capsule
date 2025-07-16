document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('settingsForm');
  const usernameInput = document.getElementById('usernameInput');
  const emailDisplay = document.getElementById('emailDisplay');

  async function loadUserInfo() {
    try {
      const res = await fetch('/api/auth/user', {
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error('Not authorized');
      }

      const user = await res.json();

      if (emailDisplay) emailDisplay.textContent = user.email;
      if (usernameInput) usernameInput.value = user.username;

    } catch (err) {
      console.error('Failed to load user info:', err);
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/auth/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: usernameInput.value }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Update failed');

      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Update error:', err);
      alert(err.message);
    }
  });

  loadUserInfo();
});

document.getElementById('viewMyCapsulesBtn').addEventListener('click', () => {
   window.location.href = '/dashboard.html';
});

document.getElementById('logoutBtn').addEventListener('click', () => {
   window.location.href = '/api/auth/logout';
});