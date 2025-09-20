document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignupLink = document.getElementById('show-signup');
    const showLoginLink = document.getElementById('show-login');

    // Switch to Signup form
    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    });

    // Switch to Login form
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
    });

    // Handle Login
    const login = document.getElementById('login');
    login.addEventListener('submit', (e) => {
        e.preventDefault();
        // In a real app, you would validate credentials here.
        // For this demo, we'll just redirect to the dashboard.
        alert('Login successful!');
        window.location.href = 'dashboard.html';
    });
    
    // Handle Signup
    const signup = document.getElementById('signup');
    signup.addEventListener('submit', (e) => {
        e.preventDefault();
        // In a real app, you would register the user here.
        alert('Signup successful! Please log in.');
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
    });
});