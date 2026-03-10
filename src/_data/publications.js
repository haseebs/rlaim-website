const fs = require("fs");
const path = require("path");

const publicationsDir = path.join(__dirname, "..", "publications");

const linkFields = [
  ["pdf", "PDF"],
  ["project", "Project page"],
  ["video", "Video"],
  ["demo", "Demo"],
  ["poster", "Poster"]
];

function stripComments(input) {
  return input.replace(/^\s*%.*$/gm, "");
}

function cleanText(value = "") {
  return value.replace(/[{}]/g, "").replace(/\s+/g, " ").trim();
}

function readBracedValue(input, startIndex) {
  let depth = 0;
  let cursor = startIndex;
  let value = "";

  while (cursor < input.length) {
    const char = input[cursor];

    if (char === "{") {
      if (depth > 0) {
        value += char;
      }

      depth += 1;
      cursor += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        cursor += 1;
        break;
      }

      value += char;
      cursor += 1;
      continue;
    }

    value += char;
    cursor += 1;
  }

  return {
    value: cleanText(value),
    endIndex: cursor
  };
}

function readQuotedValue(input, startIndex) {
  let cursor = startIndex + 1;
  let value = "";

  while (cursor < input.length) {
    const char = input[cursor];

    if (char === '"' && input[cursor - 1] !== "\\") {
      cursor += 1;
      break;
    }

    value += char;
    cursor += 1;
  }

  return {
    value: cleanText(value),
    endIndex: cursor
  };
}

function readBareValue(input, startIndex) {
  let cursor = startIndex;
  let value = "";

  while (cursor < input.length && input[cursor] !== ",") {
    value += input[cursor];
    cursor += 1;
  }

  return {
    value: cleanText(value),
    endIndex: cursor
  };
}

function findEntryBounds(input) {
  const start = input.indexOf("@");

  if (start === -1) {
    return null;
  }

  let cursor = start + 1;

  while (cursor < input.length && /[A-Za-z]/.test(input[cursor])) {
    cursor += 1;
  }

  while (cursor < input.length && /\s/.test(input[cursor])) {
    cursor += 1;
  }

  const openChar = input[cursor];
  const closeChar = openChar === "(" ? ")" : "}";
  let depth = 0;
  let end = cursor;

  while (end < input.length) {
    const char = input[end];

    if (char === openChar) {
      depth += 1;
    } else if (char === closeChar) {
      depth -= 1;

      if (depth === 0) {
        end += 1;
        break;
      }
    }

    end += 1;
  }

  return {
    start,
    openIndex: cursor,
    end
  };
}

function parseBibTeX(input = "") {
  const source = stripComments(input).trim();
  const bounds = findEntryBounds(source);

  if (!bounds) {
    return null;
  }

  const headerMatch = source.match(/^@([A-Za-z]+)\s*[\{\(]\s*([^,]+)\s*,/);

  if (!headerMatch) {
    return null;
  }

  const entryType = headerMatch[1].toLowerCase();
  const key = headerMatch[2].trim();
  const body = source.slice(headerMatch[0].length, bounds.end - 1);
  const fields = {};
  let cursor = 0;

  while (cursor < body.length) {
    while (cursor < body.length && /[\s,]/.test(body[cursor])) {
      cursor += 1;
    }

    if (cursor >= body.length) {
      break;
    }

    let fieldName = "";

    while (cursor < body.length && /[A-Za-z0-9_-]/.test(body[cursor])) {
      fieldName += body[cursor];
      cursor += 1;
    }

    while (cursor < body.length && /\s/.test(body[cursor])) {
      cursor += 1;
    }

    if (body[cursor] !== "=") {
      break;
    }

    cursor += 1;

    while (cursor < body.length && /\s/.test(body[cursor])) {
      cursor += 1;
    }

    let parsedValue;

    if (body[cursor] === "{") {
      parsedValue = readBracedValue(body, cursor);
    } else if (body[cursor] === '"') {
      parsedValue = readQuotedValue(body, cursor);
    } else {
      parsedValue = readBareValue(body, cursor);
    }

    fields[fieldName.toLowerCase()] = parsedValue.value;
    cursor = parsedValue.endIndex;
  }

  return {
    entryType,
    key,
    fields,
    raw: source
  };
}

function inferPublicationType(entryType, fields) {
  if (fields.type) {
    return fields.type;
  }

  const typeMap = {
    article: "Journal",
    inproceedings: "Conference",
    conference: "Conference",
    proceedings: "Conference",
    misc: "Preprint",
    unpublished: "Preprint",
    techreport: "Report",
    phdthesis: "Thesis",
    mastersthesis: "Thesis",
    incollection: "Book Chapter"
  };

  return typeMap[entryType] || "Publication";
}

function formatAuthors(authorField = "") {
  return authorField
    .split(/\s+and\s+/i)
    .map((author) => cleanText(author))
    .filter(Boolean)
    .join(", ");
}

function buildLinks(fields) {
  const links = [];

  for (const [fieldName, label] of linkFields) {
    if (fields[fieldName]) {
      links.push({
        label,
        url: fields[fieldName]
      });
    }
  }

  if (!fields.project && fields.url) {
    links.push({
      label: "Project page",
      url: fields.url
    });
  }

  return links;
}

function buildPublication(fileName, parsed) {
  if (!parsed) {
    return null;
  }

  const { entryType, key, fields, raw } = parsed;
  const year = Number.parseInt(fields.year, 10) || 0;

  return {
    id: key || path.basename(fileName, ".bib"),
    title: cleanText(fields.title || ""),
    authors: formatAuthors(fields.author || ""),
    venue: cleanText(fields.booktitle || fields.journal || fields.publisher || ""),
    year,
    type: inferPublicationType(entryType, fields),
    group: cleanText(fields.group || fields.category || ""),
    order: Number.parseInt(fields.order, 10) || 999,
    links: buildLinks(fields),
    bibtex: raw
  };
}

module.exports = function () {
  if (!fs.existsSync(publicationsDir)) {
    return [];
  }

  return fs
    .readdirSync(publicationsDir)
    .filter((fileName) => fileName.endsWith(".bib") && !fileName.startsWith("_"))
    .sort()
    .map((fileName) => {
      const inputPath = path.join(publicationsDir, fileName);
      const contents = fs.readFileSync(inputPath, "utf8");

      return buildPublication(fileName, parseBibTeX(contents));
    })
    .filter(Boolean);
};
