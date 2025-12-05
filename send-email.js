// send-email.js
const fs = require('fs');
const path = require('path');

// Environment variables
const MESSAGE_TYPE = (process.env.MESSAGE_TYPE || 'daily').toLowerCase();
let CREATIONAL_DATE = process.env.CREATIONAL_DATE || '';
const MESSAGE_URL = process.env.MESSAGE_URL || '';

const SCHEDULE_FOLDER = path.join(__dirname, '../saphahemailservices/SCHEDULE');

// Ensure SCHEDULE folder exists
if (!fs.existsSync(SCHEDULE_FOLDER)) {
    fs.mkdirSync(SCHEDULE_FOLDER, { recursive: true });
    console.log(`Created SCHEDULE folder at: ${SCHEDULE_FOLDER}`);
}

// Date normalization (force YYYY-MM-DD)
const parsedDate = new Date(CREATIONAL_DATE);
if (!CREATIONAL_DATE || isNaN(parsedDate.getTime())) {
    CREATIONAL_DATE = new Date().toISOString().slice(0, 10);
} else {
    CREATIONAL_DATE = parsedDate.toISOString().slice(0, 10);
}

// Map message type to template
const typeToTemplate = {
    "daily": "email-DavarLechem.txt",
    "shabbat": "email-Shabbat.txt",
    "special": "email-SPLShabbat.txt",
    "splshabbat": "email-SPLShabbat.txt"
};

if (!typeToTemplate[MESSAGE_TYPE]) {
    console.error("Unknown MESSAGE_TYPE:", MESSAGE_TYPE);
    process.exit(1);
}

const templateFile = typeToTemplate[MESSAGE_TYPE];

// Validate message URL (shabbat allowed without)
if (MESSAGE_TYPE !== "shabbat" && MESSAGE_TYPE !== "splshabbat") {
    if (!MESSAGE_URL) {
        console.error("MESSAGE_URL required for message type:", MESSAGE_TYPE);
        process.exit(1);
    }
}

// Build job
const job = {
    type: MESSAGE_TYPE,
    date: CREATIONAL_DATE,
    url: MESSAGE_URL,
    template: templateFile,
    createdAt: new Date().toISOString()
};

// Unique filename: date + message type + 4-digit random ID
const randomID = Math.random().toString(36).substr(2,4);
const filename = `schedule-${CREATIONAL_DATE}-${MESSAGE_TYPE}-${randomID}.json`;

// Write to SCHEDULE directory
fs.writeFileSync(
    path.join(SCHEDULE_FOLDER, filename),
    JSON.stringify(job, null, 2),
    'utf8'
);

console.log(`📧 Scheduled email job created: ${filename}`);
