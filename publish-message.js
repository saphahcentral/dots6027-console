// publish-message.js
const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const path = require('path');

async function run() {
    try {
        const token = process.env.GITHUB_TOKEN;
        if (!token) throw new Error('GITHUB_TOKEN is missing.');

        const octokit = github.getOctokit(token);

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

        // 🔹 TELEGRAM TRIGGER GENERATION
        if (service && warnURL) {
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

        // 🔹 DETERMINE REPO FROM SERVICE NAME
        const repoMap = {
            "DOM6027": "dom6027",
            "DOWS6027": "dows6027",
            "DOTS6027": "dots6027"
        };

        const repoName = repoMap[service];
        if (!repoName) throw new Error(`Unknown service '${service}', repo target cannot be determined.`);

        // 🔹 COMMIT MESSAGE TO REPO
        if (filePath && subject && body) {

            // Convert body to basic safe HTML format
            const safeBody = body.replace(/\n/g, "<br>");
            const contentHTML = `<h1>${subject}</h1>\n<p>${safeBody}</p>`;

            const fileBase64 = Buffer.from(contentHTML).toString('base64');

            // Check if file exists so we include SHA
            let sha;
            try {
                const res = await octokit.rest.repos.getContent({
                    owner: "saphahcentral",
                    repo: repoName,
                    path: filePath
                });
                sha = res.data.sha;
            } catch (err) {
                sha = undefined; // File does not exist
            }

            await octokit.rest.repos.createOrUpdateFileContents({
                owner: "saphahcentral",
                repo: repoName,
                path: filePath,
                message: `Add message: ${subject}`,
                content: fileBase64,
                branch: "main",
                sha: sha
            });

            console.log(`✅ Message committed to GitHub repo ${repoName}: ${filePath}`);
        }

    } catch (error) {
        core.setFailed(error.message);
        console.error(error);
    }
}

run();
