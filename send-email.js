// send-email.js
const fs = require('fs');
const path = require('path');

// Environment variables or parameters passed from the workflow
const MESSAGE_TYPE = process.env.MESSAGE_TYPE || 'daily'; // daily, shabbat, special
const CREATIONAL_DATE = process.env.CREATIONAL_DATE || '';
const MESSAGE_URL = process.env.MESSAGE_URL || '';
const SCHEDULE_FOLDER = path.join(__dirname, '../saphahemailservices/SCHEDULE'); // relative to repo

// Ensure the SCHEDULE folder exists
if (!fs.existsSync(SCHEDULE_FOLDER)) {
    fs.mkdirSync(SCHEDULE_FOLDER, { recursive: true });
    console.log(`Created SCHEDULE folder at: ${SCHEDULE_FOLDER}`);
}

// Map message type to template
let templateFile = '';
switch (MESSAGE_TYPE.toLowerCase()) {
    case 'daily':
        templateFile = 'email-DavarLechem.txt';
        break;
    case 'shabbat':
        templateFile = 'email-Shabbat.txt';
        break;
    case 'special':
    case 'splshabbat':
        templateFile = 'email-SPLShabbat.txt';
        break;
    default:
        console.error("Unknown MESSAGE_TYPE:", MESSAGE_TYPE);
        process.exit(1);
}

// Build the email job
const job = {
    type: MESSAGE_TYPE,
    date: CREATIONAL_DATE,
    url: MESSAGE_URL,
    template: templateFile,
    createdAt: new Date().toISOString()
};

// Filename safe for filesystem
const filenameSafeType = MESSAGE_TYPE.replace(/\s+/g, '_').toLowerCase();
const fileName = `schedule-${CREATIONAL_DATE}-${filenameSafeType}.json`;

// Write to the SCHEDULE folder in the repo
fs.writeFileSync(path.join(SCHEDULE_FOLDER, fileName), JSON.stringify(job, null, 2), 'utf8');

console.log(`Scheduled email job created in repo: ${fileName}`);
