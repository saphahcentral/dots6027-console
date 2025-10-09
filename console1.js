// console1.js
// Handles members and posting daily messages

// Function to post a message
async function postMessage(memberList, messageBody, messageSubject, specialName = '') {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');

    // Determine file name
    const monthShort = today.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    let fileName = specialName ? `${monthShort}${yyyy}/${specialName}.html` : `${monthShort}\\${yyyy}${mm}${dd}.html`;

    const filePath = `../dom6027/${fileName}`;

    // Send message (update DOM and trigger GitHub push via workflow)
    const payload = {
        members: memberList,
        subject: messageSubject,
        body: messageBody,
        filePath
    };

    const response = await fetch('/.github/workflows/publish-message.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Message posting failed.');
    alert('Message posted successfully!');
}

// Example usage
document.getElementById('postBtn')?.addEventListener('click', () => {
    const members = document.getElementById('members').value.split(',');
    const subject = document.getElementById('subject').value;
    const body = document.getElementById('body').value;
    const specialName = document.getElementById('specialName').value.trim();
    postMessage(members, body, subject, specialName);
});
