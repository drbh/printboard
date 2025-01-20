import { marked } from "marked";
import fs from "fs/promises";

async function buildStaticPages() {
  try {
    // Read the markdown file
    const markdown = await fs.readFile(
      "src/pages/beta/specification.md",
      "utf-8"
    );

    // read the CSS file
    const styleText = await fs.readFile("src/spec.css", "utf-8");

    // Convert markdown to HTML
    const content = marked(markdown);

    // Basic HTML template
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Specification</title>
    <meta name="color-scheme" content="light dark">
<style>
    ${styleText}
</style>
</head>
<body>
    <div class="content">
        ${content}
    </div>
</body>
</html>`;

    // Ensure the public directory exists
    await fs.mkdir("public/beta", { recursive: true });

    // Write the HTML file
    await fs.writeFile("public/beta/specification.html", html);
    console.log("Static page generated successfully!");
  } catch (error) {
    console.error("Error generating static page:", error);
    process.exit(1);
  }
}

buildStaticPages();
