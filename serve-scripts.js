const express = require("express");
const fs = require("fs").promises;

const app = express();
const port = 3456;
const publicPath = "userscripts";

app.use(express.static(publicPath));

// Directory listing at the root
app.get("/", async (req, res, next) => {
  try {
    const files = await fs.readdir(publicPath);
    let responseHtml = "<h2>Directory listing:</h2>";
    responseHtml += "<ul>";
    for (const file of files) {
      responseHtml += `<li><a href="/${file}">${file}</a></li>`;
    }
    responseHtml += "</ul>";
    res.send(responseHtml);
  } catch (error) {
    console.error(error);
    next(error); // Forward the error to Express error handling
  }
});

app.listen(port, () => {
  console.log(`Scripts served at http://localhost:${port}`);
});
