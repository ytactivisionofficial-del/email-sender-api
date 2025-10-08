document.getElementById('emailForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Ek 'from' email add karo. Resend ke free plan ke liye,
    // yeh 'onboarding@resend.dev' hi hona chahiye.
    const from = 'onboarding@resend.dev';
    const to = document.getElementById('to').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    const responseMessage = document.getElementById('responseMessage');
    const sendButton = event.target.querySelector('button[type="submit"]');

    responseMessage.textContent = 'Sending email...';
    responseMessage.style.color = 'blue';
    sendButton.disabled = true;
    sendButton.textContent = 'Sending...';


    try {
        const response = await fetch('/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // 'from' field ko body me bhejo
            body: JSON.stringify({ from, to, subject, message })
        });

        const data = await response.json();

        if (response.ok) {
            responseMessage.textContent = data.message;
            responseMessage.style.color = 'green';
            document.getElementById('emailForm').reset(); // Clear form
        } else {
            responseMessage.textContent = `Error: ${data.error || 'Unknown error'}. ${data.details ? JSON.stringify(data.details) : ''}`;
            responseMessage.style.color = 'red';
        }
    } catch (error) {
        console.error('Fetch error:', error);
        responseMessage.textContent = 'Network error or server is unreachable.';
        responseMessage.style.color = 'red';
    } finally {
        sendButton.disabled = false;
        sendButton.textContent = 'Send Email';
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
    navigator.clipboard.writeText(apiKeyInput.value).then(() => {
        alert('API Key copied to clipboard!');
    });
});


// Call fetchApiKey when the page loads
document.addEventListener('DOMContentLoaded', fetchApiKey);