document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');
    
    try {
        // Encode credentials for Basic Auth
        const credentials = btoa(`${username}:${password}`);
        
        // Asynchronous call using Fetch API over HTTPS
        const response = await fetch('/api/login', {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            messageDiv.textContent = data.message;
            messageDiv.className = 'success';
        } else {
            messageDiv.textContent = 'Login failed. Invalid credentials.';
            messageDiv.className = '';
        }
    } catch (error) {
        messageDiv.textContent = 'Error connecting to the server.';
        messageDiv.className = '';
        console.error('Login error:', error);
    }
});
