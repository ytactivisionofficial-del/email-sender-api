document.getElementById('emailForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const to = document.getElementById('to').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    const responseMessage = document.getElementById('responseMessage');

    responseMessage.textContent = 'Sending email...';
    responseMessage.style.color = 'blue';

    try {
        const response = await fetch('/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ to, subject, message })
        });

        const data = await response.json();

        if (response.ok) {
            responseMessage.textContent = data.message;
            responseMessage.style.color = 'green';
            document.getElementById('emailForm').reset(); // Clear form
        } else {
            responseMessage.textContent = `Error: ${data.error || 'Unknown error'}`;
            responseMessage.style.color = 'red';
        }
    } catch (error) {
        console.error('Fetch error:', error);
        responseMessage.textContent = 'Network error or server is unreachable.';
        responseMessage.style.color = 'red';
    }
});

// Fetch and display API Key
async function fetchApiKey() {
    try {
        const response = await fetch('/api-key');
        const data = await response.json();
        if (response.ok) {
            document.getElementById('apiKeyDisplay').value = data.apiKey;
        } else {
            console.error('Failed to fetch API key:', data.error);
            document.getElementById('apiKeyDisplay').value = 'Error fetching API Key';
        }
    } catch (error) {
        console.error('Error fetching API key:', error);
        document.getElementById('apiKeyDisplay').value = 'Network error';
    }
}

// Copy API Key to clipboard
document.getElementById('copyApiKey').addEventListener('click', function() {
    const apiKeyInput = document.getElementById('apiKeyDisplay');
    apiKeyInput.select();
    apiKeyInput.setSelectionRange(0, 99999); // For mobile devices
    document.execCommand('copy');
    alert('API Key copied to clipboard!');
});

// Call fetchApiKey when the page loads
document.addEventListener('DOMContentLoaded', fetchApiKey);
