const API_URL = 'http://localhost:8080/api/users';

document.addEventListener('DOMContentLoaded', () => {

    // Login Form handling - REPLACED BY SPRING SECURITY FORM LOGIN
    // The form in login.html now posts directly to /login

    // Register Form handling

    // Register Form handling
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role') ? document.getElementById('role').value : 'STUDENT';
            const interests = document.getElementById('interests') ? document.getElementById('interests').value : '';

            try {
                const response = await fetch(`${API_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password, role, interests })
                });

                if (response.ok) {
                    alert('Registration Successful! Please login.');
                    window.location.href = '/login';
                } else {
                    alert('Registration Failed: ' + await response.text());
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred during registration.');
            }
        });
    }
});
