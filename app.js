const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const dataDirectory = path.join(__dirname, "data");
const dataFile = path.join(dataDirectory, "responses.json");

function ensureDataFile() {
  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
  }

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, "[]", "utf8");
  }
}

function readResponses() {
  ensureDataFile();
  const rawData = fs.readFileSync(dataFile, "utf8");
  return JSON.parse(rawData || "[]");
}

function writeResponses(responses) {
  ensureDataFile();
  fs.writeFileSync(dataFile, JSON.stringify(responses, null, 2), "utf8");
}

function validateResponse(body) {
  if (!body.usecase || !body.layout_easy || !body.rating || !body.find_content) {
    return "Please complete all required survey fields.";
  }

  if (!Array.isArray(body.improve)) {
    return "Invalid improvements data.";
  }

  return null;
}

app.use(express.json());
app.use(express.static(__dirname));

app.get("/api/responses", (req, res) => {
  try {
    const responses = readResponses();
    res.json({ responses });
  } catch (error) {
    res.status(500).json({ message: "Unable to read saved responses." });
  }
});

app.post("/api/responses", (req, res) => {
  try {
    const validationError = validateResponse(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const responses = readResponses();
    const newResponse = {
      id: Date.now(),
      usecase: String(req.body.usecase).trim(),
      layout_easy: req.body.layout_easy,
      rating: String(req.body.rating),
      improve: req.body.improve,
      find_content: req.body.find_content,
      comments: String(req.body.comments || "").trim(),
      submittedAt: new Date().toISOString()
    };

    responses.push(newResponse);
    writeResponses(responses);

    return res.status(201).json({
      message: "Response saved successfully.",
      response: newResponse
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to save the survey response." });
  }
});

module.exports = app;
