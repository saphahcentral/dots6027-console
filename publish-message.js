// publish-message.js
// Receives POST or trigger file, commits HTML to GitHub, optionally triggers Telegram

const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const path = require('path');

async function run() {
    try {
        const token = process.env.GITHUB_TOKEN;
        if (!token) throw new Error('GITHUB_TOKEN is missing.');

        const octokit = github.getOctokit(token);

        // Determine input source: POST JSON (console1.js) or trigger file
        let inputData;
        const triggerFile = path.join(__dirname, 'telegram-triggers', 'input.json');
        if (fs.existsSync(triggerFile)) {
            inputData = JSON.parse(fs.readFileSync(triggerFile, 'utf8'));
        } else if (fs.existsSync('input.json')) {
            inputData = JSON.parse(fs.readFileSync('input.json', 'utf8'));
        } else {
            throw new Error('No input source found (input.json or trigger file).');
        }

        const { members, subject, body, filePath, service, warnURL } = inputData;

        // --- Handle Telegram trigger ---
        if (service && warnURL) {
            // Compose the content for DOTS6027-CONSOLE Telegram trigger
            const triggerDir = path.join(__dirname, 'telegram-triggers');
            if (!fs.existsSync(triggerDir)) fs.mkdirSync(triggerDir, { recursive: true });

            const yyyymmdd = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const triggerFileName = `WARN${yyyymmdd}.telegram`;
            const triggerPath = path.join(triggerDir, triggerFileName);

            const triggerContent = `SERVICE:${service}

${body}

${warnURL}
`;

            fs.writeFileSync(triggerPath, triggerContent.trim() + '\n');
            console.log(`📨 Telegram trigger created: ${triggerFileName}`);
        }

        // --- Commit HTML to GitHub ---
        if (filePath && subject && body) {
            const contentHTML = `<h1>${subject}</h1>\n<p>${body}</p>`;
            fs.writeFileSync(path.resolve(filePath), contentHTML);

            const repoOwner = 'saphahcentral';
            const repoName = service === 'DOM6027' ? 'dom6027' : 'dows6027';

            await octokit.rest.repos.createOrUpdateFileContents({
                owner: repoOwner,
                repo: repoName,
                path: filePath,
                message: `Add message: ${subject}`,
                content: Buffer.from(contentHTML).toString('base64'),
                branch: 'main'
            });

            console.log(`✅ Message committed to GitHub repo ${repoName}: ${filePath}`);
        }

    } catch (error) {
        core.setFailed(error.message);
        console.error(error);
    }
}

run();
