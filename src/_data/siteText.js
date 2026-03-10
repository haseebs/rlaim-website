const fs = require("fs");
const path = require("path");

function readMarkdownFile(fileName) {
  const filePath = path.join(__dirname, "..", "content", fileName);
  return fs.readFileSync(filePath, "utf8").trim();
}

module.exports = {
  homeBio: readMarkdownFile("home-bio.md"),
  aboutMe: readMarkdownFile("about-me.md"),
  researchFocus: readMarkdownFile("research-focus.md"),
  prospectiveStudents: readMarkdownFile("prospective-students.md")
};
