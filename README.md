# SEG3125 Lab 6 - Group 13

This project contains a multi-step survey about the YouTube interface and an analytics page that displays saved answers and charts.

## Project structure

```text
seg3125-lab6-group13/
│  app.js
│  server.js
│  index.html
│  analytics.html
│  package.json
│  README.md
│
├─data
│      responses.json
│
├─images
│      youtube_home.png
│      youtube_search.png
│      youtube_ui.png
│      youtube_watch.png
│
├─js
│      survey.js
│      analytics.js
│
└─styles
       style.css
```

## How to run

1. Open a terminal in the project folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Open your browser and go to:
   ```
   http://localhost:3000
   ```
5. To see the analytics page directly, go to:
   ```
   http://localhost:3000/analytics.html
   ```

## Features

- Multi-step survey with 6 questions
- Accessible form labels and status messages
- Express backend with REST APIs
- Responses stored in `data/responses.json`
- Analytics page with charts and incoming answers

## REST APIs

- `GET /api/responses` returns all saved survey responses
- `POST /api/responses` saves a new survey response
