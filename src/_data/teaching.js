const fs = require("fs");
const path = require("path");

const teachingDir = path.join(__dirname, "..", "teaching-items");

function parseScalar(value = "") {
  const trimmed = value.trim();

  if (trimmed === "true") {
    return true;
  }

  if (trimmed === "false") {
    return false;
  }

  if (/^-?\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  return trimmed.replace(/^['"]|['"]$/g, "");
}

function parseFrontMatterBlock(block = "") {
  const data = {};
  const lines = block.split(/\r?\n/);
  let index = 0;

  while (index < lines.length) {
    const rawLine = lines[index];
    const line = rawLine.trim();

    if (!line) {
      index += 1;
      continue;
    }

    const fieldMatch = rawLine.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);

    if (!fieldMatch) {
      index += 1;
      continue;
    }

    const key = fieldMatch[1];
    const value = fieldMatch[2];

    if (key === "links") {
      const links = [];
      index += 1;

      while (index < lines.length) {
        const itemLine = lines[index];

        if (!itemLine.trim()) {
          index += 1;
          continue;
        }

        if (!/^\s*-/.test(itemLine)) {
          break;
        }

        const labelMatch = itemLine.match(/^\s*-\s*label:\s*(.+)$/);

        if (!labelMatch) {
          index += 1;
          continue;
        }

        const link = {
          label: parseScalar(labelMatch[1]),
          url: ""
        };

        index += 1;

        while (index < lines.length) {
          const nestedLine = lines[index];

          if (!nestedLine.trim()) {
            index += 1;
            continue;
          }

          if (/^\s*-/.test(nestedLine) || !/^\s+/.test(nestedLine)) {
            break;
          }

          const nestedMatch = nestedLine.match(/^\s*([A-Za-z0-9_-]+):\s*(.*)$/);

          if (nestedMatch) {
            link[nestedMatch[1]] = parseScalar(nestedMatch[2]);
          }

          index += 1;
        }

        if (link.label && link.url) {
          links.push(link);
        }
      }

      data.links = links;
      continue;
    }

    data[key] = parseScalar(value);
    index += 1;
  }

  return data;
}

function parseTeachingFile(contents = "") {
  const match = contents.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);

  if (!match) {
    return {
      frontMatter: {},
      body: contents.trim()
    };
  }

  return {
    frontMatter: parseFrontMatterBlock(match[1]),
    body: match[2].trim()
  };
}

function normalizeCourse(course = {}, fileName = "") {
  return {
    id: path.basename(fileName, ".md"),
    courseCode: course.courseCode || "",
    title: course.title || "",
    term: course.term || "",
    year: Number(course.year) || 0,
    current: Boolean(course.current),
    links: Array.isArray(course.links) ? course.links : [],
    description: course.description || ""
  };
}

module.exports = function () {
  if (!fs.existsSync(teachingDir)) {
    return [];
  }

  return fs
    .readdirSync(teachingDir)
    .filter((fileName) => fileName.endsWith(".md") && !fileName.startsWith("_"))
    .sort()
    .map((fileName) => {
      const filePath = path.join(teachingDir, fileName);
      const contents = fs.readFileSync(filePath, "utf8");
      const parsed = parseTeachingFile(contents);

      return normalizeCourse(
        {
          ...parsed.frontMatter,
          description: parsed.body
        },
        fileName
      );
    });
};
