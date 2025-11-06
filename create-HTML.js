// create-HTML.js
const fs = require('fs');
const path = require('path');

// Simulated function to get today's Creational date
function getCreationalDate() {
    const today = new Date();
    return {
        year: 6028,
        month: today.getMonth() + 1,
        monthName: "Rishon",
        day: today.getDate()
    };
}

// Pad month/day
function pad(num) {
    return num.toString().padStart(2, '0');
}

// Create HTML file in PUBLISH folder
function saveHTMLFile(filename, content) {
    const publishDir = path.join(__dirname, 'PUBLISH');
    if (!fs.existsSync(publishDir)) {
        fs.mkdirSync(publishDir, { recursive: true });
        console.log("Created PUBLISH folder");
    }
    const filePath = path.join(publishDir, filename);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`HTML file "${filename}" saved to PUBLISH folder.`);
}

// Main function to create the HTML
async function createHTML(member, subject, body, messageType, specialName) {
    const creationalDate = getCreationalDate();

    // Determine filename
    let filename = '';
    if (messageType === 'daily') {
        filename = `${creationalDate.year}${pad(creationalDate.month)}${pad(creationalDate.day)}.html`;
    } else if (messageType === 'special') {
        if (!specialName) throw new Error("Special message name is required.");
        filename = `${creationalDate.monthName}${creationalDate.year}/${specialName}.html`;
    }

    // Leyatzev marker
    let leyatzevMarker = "{leyatzev}";
    if (creationalDate.month === 12 && creationalDate.day === 15) {
        leyatzevMarker = "UNKNOWN"; // workflow will update
    }

    // Load template
    let templateFile = '';
    if (messageType === 'daily') templateFile = path.join(__dirname, 'templates', 'DavarLechem.html');
    else templateFile = path.join(__dirname, 'templates', `${specialName}.html`);

    if (!fs.existsSync(templateFile)) {
        throw new Error(`Template file "${templateFile}" does not exist.`);
    }

    let template = fs.readFileSync(templateFile, 'utf8');

    // Replace placeholders
    const htmlContent = template
        .replace(/{member}/g, member)
        .replace(/{subject}/g, subject)
        .replace(/{body}/g, body)
        .replace(/{year}/g, creationalDate.year)
        .replace(/{month}/g, creationalDate.month)
        .replace(/{monthName}/g, creationalDate.monthName)
        .replace(/{day}/g, creationalDate.day)
        .replace(/{leyatzev}/g, leyatzevMarker);

    // Save file
    saveHTMLFile(filename, htmlContent);
}

// Example usage: replace these values with console input
createHTML("MemberName", "Message Subject", "Message body goes here.", "daily")
    .catch(err => console.error(err));
