// create-HTML.js

document.getElementById('sendMessageBtn').addEventListener('click', async () => {
    const member = document.getElementById('memberSelect').value;
    const subject = document.getElementById('messageSubject').value.trim();
    const body = document.getElementById('messageBody').value.trim();
    const messageType = document.getElementById('messageType').value;
    const specialName = document.getElementById('specialName').value.trim();

    if (!member || !subject || !body) {
        alert("Please fill in Member, Subject, and Body.");
        return;
    }

    // Get today's Creational date (placeholder function, replace with your conversion)
    const today = new Date();
    const creationalDate = convertToCreational(today); // {year}, {month}, {day} placeholders

    // Determine filename
    let filename = '';
    if (messageType === 'daily') {
        // Example: YYYYMMDD.html
        filename = `${creationalDate.year}${pad(creationalDate.month)}${pad(creationalDate.day)}.html`;
    } else if (messageType === 'special') {
        if (!specialName) {
            alert("Special message name is required for Special Messages.");
            return;
        }
        // Example: MMMYYYY/NameN.html
        filename = `${creationalDate.monthName}${creationalDate.year}/${specialName}.html`;
    }

    // Prepare Leyatzev marker
    let leyatzevMarker = "{leyatzev}"; // default placeholder
    // Check if today is Shnein Asar 15
    if (creationalDate.month === 12 && creationalDate.day === 15) { 
        leyatzevMarker = "UNKNOWN"; // YML workflow will update this
    }

    // Load the appropriate template
    let templateFile = '';
    if (messageType === 'daily') templateFile = 'templates/DavarLechem.html';
    else if (messageType === 'special') {
        templateFile = `templates/${specialName}.html`; // special templates must exist
    }

    fetch(templateFile)
        .then(res => res.text())
        .then(template => {
            // Replace placeholders
            let htmlContent = template
                .replace(/{member}/g, member)
                .replace(/{subject}/g, subject)
                .replace(/{body}/g, body)
                .replace(/{year}/g, creationalDate.year)
                .replace(/{month}/g, creationalDate.month)
                .replace(/{monthName}/g, creationalDate.monthName)
                .replace(/{day}/g, creationalDate.day)
                .replace(/{leyatzev}/g, leyatzevMarker);

            // Save to PUBLISH folder
            saveHTMLFile(filename, htmlContent);
            alert(`HTML file "${filename}" created in PUBLISH folder.`);
        })
        .catch(err => console.error("Error loading template:", err));
});

// Utility: pad month/day with leading zero
function pad(num) {
    return num.toString().padStart(2, '0');
}

// Placeholder: convert Gregorian to Creational
function convertToCreational(date) {
    // Replace with your actual Creational conversion logic
    const creational = {
        year: 6028, // example
        month: date.getMonth() + 1,
        monthName: "Rishon",
        day: date.getDate()
    };
    return creational;
}

// Save file to PUBLISH folder
function saveHTMLFile(filename, content) {
    // Since this runs in browser, use a download link approach
    const blob = new Blob([content], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}
