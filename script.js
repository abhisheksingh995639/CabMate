document.addEventListener('DOMContentLoaded', function() {
   // Hamburger menu functionality
    var hamburger = document.querySelector('.hamburger');
    var navList = document.querySelector('.nav-list');
    if (hamburger && navList) {
        hamburger.addEventListener('click', function() {
            navList.classList.toggle('open');
            hamburger.classList.toggle('open');
            hamburger.setAttribute('aria-expanded', navList.classList.contains('open'));
        });
    }

    // Signup form functionality
    var signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async function(event) { // Made async
            event.preventDefault();

            var user = {
                name: document.getElementById('name').value,
                batch: document.getElementById('batch').value,
                regno: document.getElementById('regno').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            };

            // Basic client-side password confirmation check
            const confirmPassword = document.getElementById('confirm-password').value;
            if (user.password !== confirmPassword) {
                alert('Passwords do not match.');
                return;
            }

            try {
                const response = await fetch('https://cabmate-backend.onrender.com/api/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(user)
                });

                const result = await response.json();

                if (response.ok) {
                    // Registration successful
                    alert(result.message);
                    window.location.href = 'login.html'; // Redirect to login page
                } else {
                    // Registration failed
                    alert(result.message || 'Signup failed. Please try again.');
                    console.error('Signup error:', result);
                }
            } catch (error) {
                console.error('Network error during signup:', error);
                alert('An error occurred during signup. Please try again later.');
            }
        });
    }

    // Login form functionality
    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) { // Made async
            event.preventDefault();
            var username = document.getElementById('username').value; // Can be regno or email
            var password = document.getElementById('password').value;

            try {
                const response = await fetch('https://cabmate-backend.onrender.com/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const result = await response.json();

                if (response.ok) {
                    // Login successful
                    alert(result.message);
                    // Store the user object returned from the backend (without password)
                    localStorage.setItem('cabshareUser', JSON.stringify(result.user));
                    window.location.href = 'dashboard.html';
                } else {
                    // Login failed
                    alert(result.message || 'Login failed. Please check your credentials.');
                    console.error('Login error:', result);
                }
            } catch (error) {
                console.error('Network error during login:', error);
                alert('An error occurred during login. Please try again later.');
            }
        });
    }

    // The following fetch calls for rides are now handled directly in dashboard.html
    // or other specific ride-related pages, so they can be removed from script.js
    // if they are duplicated or not needed globally.
    // Ensure that ride fetching logic is robust and handles unauthenticated users.

    // Get all rides (example - likely moved to dashboard/available-rides)
    // fetch('http://localhost:4000/api/rides')
    //   .then(res => res.json())
    //   .then(rides => {
    //     // render rides
    //   });

    // Create a new ride (example - moved to create-ride.html)
    // fetch('http://localhost:4000/api/rides', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(newRide)
    // })
    // .then(res => res.json())
    // .then(ride => {
    //   // update UI
    // });
});