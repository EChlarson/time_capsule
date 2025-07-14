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