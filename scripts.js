const form = document.getElementById('loginForm');
const passwordInput = document.getElementById('password');
const visibilityToggle = document.querySelector('.visibility-toggle');

visibilityToggle.addEventListener('click', () => {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  visibilityToggle.textContent = isPassword ? 'Ficha' : 'Onyesha';
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert('Tafadhali jaza barua pepe na nenosiri kwa usahihi.');
    return;
  }

  // Example client-side validation only.
  // Replace with real authentication call to backend API.
  if (!email.includes('@')) {
    alert('Tafadhali tumia barua pepe halali.');
    return;
  }

  alert('Hongera! Umekamilisha hatua ya kwanza. Ingiashida inaendelea...');
});
