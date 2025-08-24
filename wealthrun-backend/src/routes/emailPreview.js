// src/routes/emailPreview.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const mjml = require("mjml");

const router = express.Router();

// Path to templates folder (fixed relative path)
const templatesPath = path.join(__dirname, "../../../wealthrun-mailer-starter/src/templates");

// ------------------------
// List all available templates
// ------------------------
router.get("/", (req, res) => {
  try {
    const files = fs
      .readdirSync(templatesPath)
      .filter((file) => file.endsWith(".mjml"))
      .map((file) => file.replace(".mjml", ""));

    res.json({ availableTemplates: files });
  } catch (err) {
    console.error("Error reading templates:", err);
    res.status(500).send("Error reading templates");
  }
});

// ------------------------
// Preview a specific template by name
// ------------------------
router.get("/:template", (req, res) => {
  const { template } = req.params;
  const filePath = path.join(templatesPath, `${template}.mjml`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Template not found");
  }

  try {
    const mjmlContent = fs.readFileSync(filePath, "utf-8");
    const { html, errors } = mjml(mjmlContent);

    if (errors && errors.length > 0) {
      return res.status(500).json({ errors });
    }

    res.send(html);
  } catch (err) {
    console.error("Error rendering template:", err);
    res.status(500).send("Error rendering template");
  }
});

module.exports = router;
