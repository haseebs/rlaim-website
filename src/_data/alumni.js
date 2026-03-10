const fs = require("fs");
const path = require("path");

const alumniDir = path.join(__dirname, "..", "alumni");

function yearFromDate(value = "") {
  const match = String(value).match(/^(\d{4})/);
  return match ? match[1] : "";
}

function normalizeAlumnus(alumnus = {}, fileName = "") {
  const joiningDate = alumnus.joiningDate || "";
  const endingDate = alumnus.endingDate || alumnus.years || "";

  return {
    id: path.basename(fileName, ".json"),
    name: alumnus.name || "",
    role: alumnus.role || alumnus.degree || "",
    joiningDate,
    endingDate,
    joiningYear: yearFromDate(joiningDate),
    endingYear: yearFromDate(endingDate),
    currentRole: alumnus.currentRole || "",
    website: alumnus.website || "",
    currentOrganization: alumnus.currentOrganization || ""
  };
}

function compareAlumni(a, b) {
  const aEnding = yearFromDate(a.endingDate);
  const bEnding = yearFromDate(b.endingDate);

  if (aEnding !== bEnding) {
    return Number(bEnding || 0) - Number(aEnding || 0);
  }

  const aJoining = yearFromDate(a.joiningDate);
  const bJoining = yearFromDate(b.joiningDate);

  if (aJoining !== bJoining) {
    return Number(aJoining || 0) - Number(bJoining || 0);
  }

  return a.name.localeCompare(b.name);
}

module.exports = function () {
  if (!fs.existsSync(alumniDir)) {
    return [];
  }

  return fs
    .readdirSync(alumniDir)
    .filter((fileName) => fileName.endsWith(".json") && !fileName.startsWith("_"))
    .sort()
    .map((fileName) => {
      const filePath = path.join(alumniDir, fileName);
      const contents = JSON.parse(fs.readFileSync(filePath, "utf8"));

      return normalizeAlumnus(contents, fileName);
    })
    .sort(compareAlumni);
};
