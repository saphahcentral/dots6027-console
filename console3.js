// console3.js
// Automates posting to DOM index2.html and monthly archive updates

async function postDailyService(filePath, bodyContent) {
    const payload = { filePath, bodyContent };

    const response = await fetch('/.github/workflows/post-service.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Daily service posting failed.');
    alert('Daily service posted!');
}

document.getElementById('postServiceBtn')?.addEventListener('click', () => {
    const filePath = document.getElementById('dailyFilePath').value;
    const body = document.getElementById('dailyBody').value;
    postDailyService(filePath, body);
});
