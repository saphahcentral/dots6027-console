document.addEventListener('DOMContentLoaded', () => {
  const memberSelect = document.getElementById('memberSelect');
  const messageDate = document.getElementById('messageDate');
  const messageType = document.getElementById('messageType');
  const specialName = document.getElementById('specialName');
  const generateBtn = document.getElementById('generateHTMLBtn');
  const status = document.getElementById('status');

  // Load members
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
      // STEP 0: Convert date to Creational calendar
      const creationalDate = convertToCreational(date);

      // STEP 1: Fetch Teams message for this date
      const teamsMessage = await fetchTeamsMessage(date);

      // STEP 2: Detect type if not manually set
      if (!type) type = detectMessageType(teamsMessage.title);

      // STEP 3: Determine template file
      const templateFile = selectTemplate(type, special);

      // STEP 4: Check Leyatzev marker if Shnein Asar 15
      const leyatzevMarker = await checkLeyatzev(creationalDate);

      // STEP 5: Replace placeholders
      let htmlContent = await generateHTML(templateFile, creationalDate, member, teamsMessage, leyatzevMarker);

      // STEP 6: Publish HTML
      await publishHTML(htmlContent, creationalDate);

      // STEP 7: Update index2.html & archive if first day of Gregorian month
      await updateIndexAndArchive(creationalDate, htmlContent);

      status.textContent = `HTML generated and ready for publishing for ${creationalDate}! Leyatzev=${leyatzevMarker}`;
      status.style.color = "green";

    } catch (err) {
      console.error(err);
      status.textContent = "Error generating HTML: " + err.message;
      status.style.color = "red";
    }
  });

  // --- FUNCTIONS ---

  function convertToCreational(date) {
    // Convert Gregorian to Creational calendar (example logic, adjust to real mapping)
    const d = new Date(date);
    const creationalYear = d.getFullYear() + 2002; // placeholder conversion
    const months = ["Rishon","Sheni","Shlishi","Revi'i","Chamishi","Shishi","Shev'i","Shmini","Tishi","Asiri","Achad Asar","Shnein Asar","Leyatzev"];
    const day = d.getDate();
    const monthIndex = d.getMonth(); // map to Creational month
    return `${months[monthIndex]} ${day}, ${creationalYear} AA`;
  }

  async function fetchTeamsMessage(date) {
    // Placeholder: fetch Teams message for the date
    return { title: "Shabbat Rishon 1 (Pesach 1)", body: "Message body here" };
  }

  function detectMessageType(title) {
    const bracketMatch = title.match(/\((.*?)\)/);
    if (bracketMatch) return 'special';
    if (title.startsWith("Shabbat")) return 'shabbat';
    return 'daily';
  }

  function selectTemplate(type, special) {
    if (type === 'daily') return 'templates/davar-lechem-template.html';
    if (type === 'shabbat') return 'templates/shabbat-template.html';
    if (type === 'special') return `templates/${special || 'special-template'}.html`;
    return 'templates/davar-lechem-template.html';
  }

  async function checkLeyatzev(creationalDate) {
    // Only check on Shnein Asar 15
    if (!creationalDate.includes("Shnein Asar 15")) return false;

    // Fetch data from Ynet & Hayadan
    const ynetReady = await fetchLeyatzevYnet();
    const hayadanReady = await fetchLeyatzevHayadan();

    return ynetReady || hayadanReady;
  }

  async function fetchLeyatzevYnet() {
    // Example: scrape or API
    // return true if grain/trees ready, false if not
    return false;
  }

  async function fetchLeyatzevHayadan() {
    return false;
  }

  async function generateHTML(templateFile, date, member, teamsMessage, leyatzev) {
    const resp = await fetch(templateFile);
    let template = await resp.text();

    template = template.replace(/{date}/g, date);
    template = template.replace(/{member}/g, member);
    template = template.replace(/{title}/g, teamsMessage.title);
    template = template.replace(/{body}/g, teamsMessage.body);
    template = template.replace(/{leyatzev}/g, leyatzev ? "TRUE" : "FALSE");

    return template;
  }

  async function publishHTML(htmlContent, date) {
    console.log("Publishing HTML for date:", date);
    // Send to PUBLISH folder
  }

  async function updateIndexAndArchive(date, htmlContent) {
    // If first Gregorian day, update archive
    const d = new Date();
    if (d.getDate() === 1) {
      console.log("Updating archive for previous month...");
      // Append all links for previous month to archive
    }
    console.log("Updating index2.html with new link for:", date);
  }

});
