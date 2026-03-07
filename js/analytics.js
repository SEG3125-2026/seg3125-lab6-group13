const analyticsMessage = document.getElementById("analyticsMessage");
const clearResponsesButton = document.getElementById("clearResponsesButton");
const statsGrid = document.getElementById("statsGrid");
const responsesBody = document.getElementById("responsesBody");
const layoutPie = document.getElementById("layoutPie");
const layoutLegend = document.getElementById("layoutLegend");
const layoutSummary = document.getElementById("layoutSummary");
const ratingBars = document.getElementById("ratingBars");
const ratingSummary = document.getElementById("ratingSummary");
const improvementBars = document.getElementById("improvementBars");
const improvementSummary = document.getElementById("improvementSummary");

const labels = {
  layout_easy: {
    easy: "Easy",
    neutral: "Just Right",
    hard: "Hard"
  },
  find_content: {
    yes: "Yes",
    sometimes: "Sometimes",
    no: "No"
  },
  improve: {
    sidebar: "Navigation Sidebar Organization",
    layout: "Overall Layout",
    thumbnails: "Thumbnail Shape and Size"
  }
};

const pieColors = ["#8f001a", "#d94f70", "#f2b8c6"];

function showMessage(text, type = "") {
  analyticsMessage.textContent = text;
  analyticsMessage.className = type
    ? `form-message ${type} analytics-message`
    : "form-message analytics-message";
}

function setAnalyticsMessage() {
  const params = new URLSearchParams(window.location.search);

  if (params.get("submitted") === "1") {
    showMessage("Your survey response was submitted successfully.", "success");
    return;
  }

  if (params.get("cleared") === "1") {
    showMessage("All survey responses were cleared successfully.", "success");
    return;
  }

  showMessage("");
}

function countValues(items, allowedValues) {
  const counts = Object.fromEntries(allowedValues.map((value) => [value, 0]));
  items.forEach((value) => {
    if (counts[value] !== undefined) {
      counts[value] += 1;
    }
  });
  return counts;
}

function formatDate(value) {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleString();
}

function formatList(values) {
  if (!values || values.length === 0) {
    return "None";
  }
  return values.map((value) => labels.improve[value] || value).join(", ");
}

function renderStats(responses) {
  if (responses.length === 0) {
    statsGrid.innerHTML = '<div class="stat-card"><h3>0</h3><p>No responses yet</p></div>';
    return;
  }

  const ratingAverage = (
    responses.reduce((sum, item) => sum + Number(item.rating || 0), 0) / responses.length
  ).toFixed(1);

  const easyCount = responses.filter((item) => item.layout_easy === "easy").length;
  const findYesCount = responses.filter((item) => item.find_content === "yes").length;

  const stats = [
    { value: responses.length, label: "Total Responses" },
    { value: ratingAverage, label: "Average Rating" },
    { value: `${Math.round((easyCount / responses.length) * 100)}%`, label: "Easy Layout Votes" },
    { value: `${Math.round((findYesCount / responses.length) * 100)}%`, label: "Quick Find Votes" }
  ];

  statsGrid.innerHTML = stats
    .map((stat) => `
      <article class="stat-card">
        <h3>${stat.value}</h3>
        <p>${stat.label}</p>
      </article>
    `)
    .join("");
}

function renderPieChart(responses) {
  const counts = countValues(
    responses.map((item) => item.layout_easy),
    ["easy", "neutral", "hard"]
  );

  const total = responses.length || 1;
  let currentAngle = 0;
  const segments = Object.entries(counts).map(([key, count], index) => {
    const nextAngle = currentAngle + (count / total) * 360;
    const segment = `${pieColors[index]} ${currentAngle}deg ${nextAngle}deg`;
    currentAngle = nextAngle;
    return segment;
  });

  layoutPie.style.background = `conic-gradient(${segments.join(", ")})`;
  layoutLegend.innerHTML = Object.entries(counts)
    .map(
      ([key, count], index) => `
        <div class="legend-item">
          <span class="legend-color" style="background-color: ${pieColors[index]};"></span>
          <span>${labels.layout_easy[key]}: ${count}</span>
        </div>
      `
    )
    .join("");

  const topEntry = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  layoutSummary.textContent = responses.length
    ? `${labels.layout_easy[topEntry[0]]} was the most common answer with ${topEntry[1]} responses.`
    : "No layout data available yet.";
}

function renderBarGroup(container, counts, labelMap) {
  const values = Object.values(counts);
  const maxValue = Math.max(...values, 1);

  container.innerHTML = Object.entries(counts)
    .map(([key, count]) => `
      <div class="bar-row">
        <div class="bar-label">${labelMap[key] || key}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width: ${(count / maxValue) * 100}%;"></div>
        </div>
        <div class="bar-value">${count}</div>
      </div>
    `)
    .join("");
}

function renderRatings(responses) {
  const counts = countValues(
    responses.map((item) => String(item.rating || "")),
    ["1", "2", "3", "4", "5"]
  );

  renderBarGroup(ratingBars, counts, {
    1: "1",
    2: "2",
    3: "3",
    4: "4",
    5: "5"
  });

  const bestRating = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  ratingSummary.textContent = responses.length
    ? `The most selected visual rating was ${bestRating[0]} with ${bestRating[1]} responses.`
    : "No rating data available yet.";
}

function renderImprovements(responses) {
  const improvementCounts = {
    sidebar: 0,
    layout: 0,
    thumbnails: 0
  };

  responses.forEach((item) => {
    (item.improve || []).forEach((value) => {
      if (improvementCounts[value] !== undefined) {
        improvementCounts[value] += 1;
      }
    });
  });

  renderBarGroup(improvementBars, improvementCounts, labels.improve);

  const topImprovement = Object.entries(improvementCounts).sort((a, b) => b[1] - a[1])[0];
  improvementSummary.textContent = responses.length
    ? `${labels.improve[topImprovement[0]]} was requested most often with ${topImprovement[1]} votes.`
    : "No improvement data available yet.";
}

function renderResponses(responses) {
  if (responses.length === 0) {
    responsesBody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-cell">No survey responses have been submitted yet.</td>
      </tr>
    `;
    return;
  }

  responsesBody.innerHTML = responses
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.usecase || "-"}</td>
          <td>${labels.layout_easy[item.layout_easy] || "-"}</td>
          <td>${item.rating || "-"}</td>
          <td>${formatList(item.improve)}</td>
          <td>${labels.find_content[item.find_content] || "-"}</td>
          <td>${item.comments || "-"}</td>
          <td>${formatDate(item.submittedAt)}</td>
        </tr>
      `
    )
    .join("");
}

async function loadAnalytics() {
  try {
    const response = await fetch("/api/responses");
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.message || "Unable to load analytics data.");
    }

    const responses = payload.responses || [];
    renderStats(responses);
    renderPieChart(responses);
    renderRatings(responses);
    renderImprovements(responses);
    renderResponses(responses);
  } catch (error) {
    showMessage(error.message || "Unable to load analytics data.", "error");
  }
}

async function clearResponses() {
  const confirmed = window.confirm("Are you sure you want to delete all saved survey responses?");

  if (!confirmed) {
    return;
  }

  clearResponsesButton.disabled = true;

  try {
    const response = await fetch("/api/responses", {
      method: "DELETE"
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.message || "Unable to clear saved responses.");
    }

    window.location.href = "analytics.html?cleared=1";
  } catch (error) {
    showMessage(error.message || "Unable to clear saved responses.", "error");
    clearResponsesButton.disabled = false;
  }
}

clearResponsesButton.addEventListener("click", clearResponses);
setAnalyticsMessage();
loadAnalytics();