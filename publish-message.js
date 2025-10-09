// publish-message.js
// Receives POST from console1.js, triggers GitHub commit using secrets

const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const path = require('path');

async function run() {
    try {
        const token = process.env.GITHUB_TOKEN;
        const octokit = github.getOctokit(token);

        const { members, subject, body, filePath } = JSON.parse(fs.readFileSync('input.json', 'utf8'));

        // Write HTML file
        fs.writeFileSync(path.resolve(filePath), `<h1>${subject}</h1>\n<p>${body}</p>`);

        // Commit to GitHub
        await octokit.rest.repos.createOrUpdateFileContents({
            owner: 'saphahcentral',
            repo: 'dom6027',
            path: filePath,
            message: `Add message: ${subject}`,
            content: Buffer.from(`<h1>${subject}</h1>\n<p>${body}</p>`).toString('base64'),
            branch: 'main'
        });

    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
