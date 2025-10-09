// console2.js
// Maintains students and lecture review, AES link encryption

function encryptAES(text, key) {
    // Simple AES encryption placeholder (replace with real AES library)
    return btoa(text); 
}

async function submitLecture(studentEmail, lectureNotes, key) {
    const encryptedNotes = encryptAES(lectureNotes, key);

    const payload = { studentEmail, encryptedNotes };
    const response = await fetch('/.github/workflows/student-submit.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Lecture submission failed.');
    alert('Lecture submitted successfully!');
}

document.getElementById('submitLectureBtn')?.addEventListener('click', () => {
    const email = document.getElementById('studentEmail').value;
    const notes = document.getElementById('lectureNotes').value;
    const key = document.getElementById('aesKey').value;
    submitLecture(email, notes, key);
});
