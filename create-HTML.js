// create-HTML.js
document.addEventListener('DOMContentLoaded', () => {
  const memberSelect = document.getElementById('memberSelect');
  const messageDate = document.getElementById('messageDate');
  const messageType = document.getElementById('messageType');
  const specialName = document.getElementById('specialName');
  const generateBtn = document.getElementById('generateHTMLBtn');
  const status = document.getElementById('status');

  // Load members (example static list, replace with dynamic fetch if needed)
  const members = ["Magdalena Kaplan", "Ezra Cohen", "Levi Stern"];
  members.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m;
    memberSelect.appendChild(opt);
  });

  generateBtn.addEventListener('click', async () => {
    status.textContent = "Processing...";
    const member = memberSelect.value;
    const date = messageDate.value;
    let type = messageType.value;
    const special = specialName.value.trim();

    if (!member || !date) {
      status.textContent = "Please select member and date!";
      status.style.color = "red";
      return;
    }

    try {
      // STEP 1: Fetch Teams message for this date
      const teamsMessage = await fetchTeamsMessage(date); // Implement your API or scraping here

      // STEP 2: Detect type if not manually set
      if (!type) {
        type = detectMessageType(teamsMessage.title);
      }

      // STEP 3: Determine template file
      const templateFile = selectTemplate(type, special);

      // STEP 4: Replace placeholders
      const htmlContent = await generateHTML(templateFile, date, member, teamsMessage);

      // STEP 5: Save to PUBLISH folder (trigger GitHub Action)
      await publishHTML(htmlContent, date);

      status.textContent = `HTML generated and ready for publishing for ${date}!`;
      status.style.color = "green";

    } catch (err) {
      console.error(err);
      status.textContent = "Error generating HTML: " + err.message;
      status.style.color = "red";
    }
  });

  // --- FUNCTIONS ---

  async function fetchTeamsMessage(date) {
    // Placeholder: fetch Teams message for given date (API or scraping)
    // Return object { title: "...", body: "..." }
    return { title: "Shabbat Rishon 1 (Pesach 1)", body: "Message body here" };
  }

  function detectMessageType(title) {
    // Check for brackets first
    const bracketMatch = title.match(/\((.*?)\)/);
    if (bracketMatch) return 'special';
    if (title.startsWith("Shabbat")) return 'shabbat';
    return 'daily';
  }

  function selectTemplate(type, special) {
    // Map types to template paths
    if (type === 'daily') return 'templates/davar-lechem-template.html';
    if (type === 'shabbat') return 'templates/shabbat-template.html';
    if (type === 'special') return `templates/${special || 'special-template'}.html`;
    return 'templates/davar-lechem-template.html';
  }

  async function generateHTML(templateFile, date, member, teamsMessage) {
    // Fetch template content
    const resp = await fetch(templateFile);
    let template = await resp.text();

    // Replace placeholders
    template = template.replace(/{date}/g, date);
    template = template.replace(/{member}/g, member);
    template = template.replace(/{title}/g, teamsMessage.title);
    template = template.replace(/{body}/g, teamsMessage.body);

    return template;
  }

  async function publishHTML(htmlContent, date) {
    // Placeholder: send file to PUBLISH folder (API or local save)
    // The GitHub Action will watch this folder for automatic publishing
    console.log("Publishing HTML for date:", date);
    // Example: POST to server endpoint for saving
    // await fetch('/api/publish', { method: 'POST', body: htmlContent });
  }

});
