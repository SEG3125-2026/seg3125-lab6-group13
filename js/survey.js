const totalTabs = 6;
let currentTab = 1;

const form = document.getElementById("surveyForm");
const messageBox = document.getElementById("formMessage");
const progressText = document.getElementById("progressText");
const submitArea = document.getElementById("submitArea");
const submitButton = document.getElementById("submitButton");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const stepButtons = document.querySelectorAll(".step-button");
const tabs = document.querySelectorAll(".tab-content");

function setMessage(text, type = "") {
  messageBox.textContent = text;
  messageBox.className = "form-message";
  if (type) {
    messageBox.classList.add(type);
  }
}

function getCurrentInputs() {
  return tabs[currentTab - 1].querySelectorAll("input, select, textarea");
}

function validateCurrentTab() {
  const inputs = getCurrentInputs();
  const radioNames = new Set();

  for (const input of inputs) {
    if (input.type === "radio") {
      if (radioNames.has(input.name)) {
        continue;
      }
      radioNames.add(input.name);
      const checked = form.querySelector(`input[name="${input.name}"]:checked`);
      if (!checked) {
        setMessage("Please answer the current question before moving on.", "error");
        return false;
      }
      continue;
    }

    if (!input.checkValidity()) {
      input.reportValidity();
      setMessage("Please complete the current question before moving on.", "error");
      return false;
    }
  }

  setMessage("");
  return true;
}

function updateNavigation() {
  tabs.forEach((tab, index) => {
    const isActive = index + 1 === currentTab;
    tab.classList.toggle("active", isActive);
  });

  stepButtons.forEach((button, index) => {
    const isActive = index + 1 === currentTab;
    button.classList.toggle("active-link", isActive);
    button.setAttribute("aria-current", isActive ? "step" : "false");
  });

  progressText.textContent = `Question ${currentTab} of ${totalTabs}`;
  prevButton.disabled = currentTab === 1;
  nextButton.disabled = currentTab === totalTabs;
  submitArea.style.display = currentTab === totalTabs ? "block" : "none";
}

function showTab(tabNumber) {
  currentTab = tabNumber;
  updateNavigation();
}

prevButton.addEventListener("click", () => {
  if (currentTab > 1) {
    showTab(currentTab - 1);
  }
});

nextButton.addEventListener("click", () => {
  if (currentTab < totalTabs && validateCurrentTab()) {
    showTab(currentTab + 1);
  }
});

stepButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetTab = Number(button.dataset.tab);
    if (targetTab <= currentTab || validateCurrentTab()) {
      showTab(targetTab);
    }
  });
});

function collectFormData() {
  return {
    usecase: form.usecase.value.trim(),
    layout_easy: form.layout_easy.value,
    rating: form.rating.value,
    improve: Array.from(form.querySelectorAll('input[name="improve"]:checked')).map((item) => item.value),
    find_content: form.find_content.value,
    comments: form.comments.value.trim()
  };
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateCurrentTab()) {
    return;
  }

  submitButton.disabled = true;
  setMessage("Submitting your response...", "success");

  try {
    const response = await fetch("/api/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(collectFormData())
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Unable to submit the survey.");
    }

    window.location.href = "analytics.html?submitted=1";
  } catch (error) {
    setMessage(error.message || "Unable to submit the survey.", "error");
    submitButton.disabled = false;
  }
});

updateNavigation();
