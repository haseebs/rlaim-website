const markdownIt = require("markdown-it");

const md = markdownIt({
  html: false,
  breaks: true,
  linkify: true
});

function normalizeUrl(url = "/") {
  if (url === "/") {
    return "/";
  }

  return url.endsWith("/") ? url : `${url}/`;
}

function sortPublications(items = []) {
  return [...items].sort((a, b) => {
    if ((a.year || 0) !== (b.year || 0)) {
      return (b.year || 0) - (a.year || 0);
    }

    if ((a.order || 999) !== (b.order || 999)) {
      return (a.order || 999) - (b.order || 999);
    }

    return (a.title || "").localeCompare(b.title || "");
  });
}

function publicationSectionTitle(publication = {}) {
  const explicitGroup = (publication.group || "").toLowerCase();
  const type = (publication.type || "").toLowerCase();

  if (explicitGroup.includes("thes")) {
    return "Theses";
  }

  if (explicitGroup.includes("preprint") || explicitGroup.includes("working")) {
    return "Preprints and Working papers";
  }

  if (explicitGroup.includes("publication")) {
    return "Publications";
  }

  if (type.includes("thes")) {
    return "Theses";
  }

  if (type.includes("preprint") || type.includes("working") || type.includes("report")) {
    return "Preprints and Working papers";
  }

  return "Publications";
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  eleventyConfig.addFilter("markdown", (value) => md.render(value || ""));

  eleventyConfig.addFilter("isActiveNav", (itemUrl, pageUrl) => {
    const normalizedItemUrl = normalizeUrl(itemUrl);
    const normalizedPageUrl = normalizeUrl(pageUrl);

    if (normalizedItemUrl === "/") {
      return normalizedPageUrl === "/";
    }

    return normalizedPageUrl.startsWith(normalizedItemUrl);
  });

  eleventyConfig.addFilter("sortNews", (items = []) => {
    return [...items].sort((a, b) => new Date(b.date) - new Date(a.date));
  });

  eleventyConfig.addFilter("groupPublicationsByYear", (items = []) => {
    const sortedItems = sortPublications(items);

    return sortedItems.reduce((groups, item) => {
      let group = groups.find((entry) => entry.year === item.year);

      if (!group) {
        group = { year: item.year, items: [] };
        groups.push(group);
      }

      group.items.push(item);
      return groups;
    }, []);
  });

  eleventyConfig.addFilter("groupPublicationsBySection", (items = []) => {
    const sections = [
      { title: "Preprints and Working papers", items: [] },
      { title: "Publications", items: [] },
      { title: "Theses", items: [] }
    ];

    for (const item of sortPublications(items)) {
      const section = sections.find((entry) => entry.title === publicationSectionTitle(item));
      section.items.push(item);
    }

    return sections;
  });

  eleventyConfig.addFilter("publicationLinks", (publication = {}) => {
    if (Array.isArray(publication.links) && publication.links.length) {
      return publication.links.filter((link) => link && link.label && link.url);
    }

    const legacyLinks = [
      { label: "PDF", url: publication.pdfUrl },
      { label: "Project page", url: publication.projectUrl },
      { label: "Video", url: publication.videoUrl },
      { label: "Demo", url: publication.demoUrl },
      { label: "Poster", url: publication.posterUrl }
    ];

    return legacyLinks.filter((link) => link.url);
  });

  eleventyConfig.addFilter("sortTeaching", (items = []) => {
    const termOrder = {
      Winter: 1,
      Spring: 2,
      Summer: 3,
      Fall: 4
    };

    return [...items].sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      }

      return (termOrder[b.term] ?? -1) - (termOrder[a.term] ?? -1);
    });
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
