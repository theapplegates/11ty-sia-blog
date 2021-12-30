const { DateTime } = require("luxon");
const fs = require("fs");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginNavigation = require("@11ty/eleventy-navigation");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const filters = require('./src/_11ty/filters');
const Image = require("@11ty/eleventy-img");
const path = require('path');
const embedTwitter = require("eleventy-plugin-embed-twitter");
const pluginWebmentions = require("@chrisburnell/eleventy-cache-webmentions");



async function imageShortcode(src, alt) {
  let sizes = "(min-width: 1024px) 100vw, 50vw"
  let srcPrefix = `./src/img/`
  src = srcPrefix + src
  console.log(`Generating image(s) from:  ${src}`)
  if(alt === undefined) {
    // Throw an error on missing alt (alt="" works okay)
    throw new Error(`Missing \`alt\` on responsiveimage from: ${src}`)
  }
  let metadata = await Image(src, {
    widths: [300, 600, 900, 1500, 3000],
    formats: ['avif', 'webp', 'jpg'],
    urlPath: "/img/",
    outputDir: "./_site/img/",
    /* =====
    Now we'll make sure each resulting file's name will
    make sense to you. **This** is why you need
    that `path` statement mentioned earlier.
    ===== */
    filenameFormat: function (id, src, width, format, options) {
      const extension = path.extname(src)
      const name = path.basename(src, extension)
      return `${name}-${width}w.${format}`
    }
  })
  let lowsrc = metadata.jpeg[0]
  let highsrc = metadata.jpeg[metadata.jpeg.length - 1]
  return `<picture>
    ${Object.values(metadata).map(imageFormat => {
      return `  <source type="${imageFormat[0].sourceType}" srcset="${imageFormat.map(entry => entry.srcset).join(", ")}" sizes="${sizes}">`
    }).join("\n")}
    <img
      src="${lowsrc.url}"
      width="${highsrc.width}"
      height="${highsrc.height}"
      alt="${alt}"
      loading="lazy"
      decoding="async">
  </picture>`
}




module.exports = function(eleventyConfig) {


  eleventyConfig.addPlugin(embedTwitter);

  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode)
  eleventyConfig.addLiquidShortcode("image", imageShortcode)
  // === Liquid needed if `markdownTemplateEngine` **isn't** changed from Eleventy default
  eleventyConfig.addJavaScriptFunction("image", imageShortcode)



  // Add plugins
  eleventyConfig.addPlugin(pluginWebmentions, {
    domain: "https://theappleagtes.com" // this is required!
  })
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight);
  eleventyConfig.addPlugin(pluginNavigation);

  // Add filters
  Object.keys(filters).forEach(filterName => {
    eleventyConfig.addFilter(filterName, filters[filterName])
  })
  // This function is reused in this config, so declaring the filter here instead:
  function filterTagList(tags) {
    return (tags || []).filter(tag => ["all", "nav", "post", "posts"].indexOf(tag) === -1);
  }
  eleventyConfig.addFilter("filterTagList", filterTagList)

  // https://www.11ty.dev/docs/data-deep-merge/
  eleventyConfig.setDataDeepMerge(true);

  // Alias `layout: post` to `layout: layouts/post.njk`
  eleventyConfig.addLayoutAlias("post", "layouts/post.njk");

  // Create an array of all tags
  eleventyConfig.addCollection("tagList", function(collection) {
    let tagSet = new Set();
    collection.getAll().forEach(item => {
      (item.data.tags || []).forEach(tag => tagSet.add(tag));
    });

    return filterTagList([...tagSet]);
  });

  // Copy the `img` and `css` folders to the output
  eleventyConfig.addPassthroughCopy("src/img");

  // Customize Markdown library and settings:
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  }).use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.ariaHidden({
      placement: "after",
      class: "direct-link",
      symbol: "#",
      level: [1,2,3,4],
    }),
    slugify: eleventyConfig.getFilter("slug")
  });
  eleventyConfig.setLibrary("md", markdownLibrary);

  // Override Browsersync defaults (used only with --serve)
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function(err, browserSync) {
        const content_404 = fs.readFileSync('_site/404.html');

        browserSync.addMiddleware("*", (req, res) => {
          // Provides the 404 content without redirect.
          res.writeHead(404, {"Content-Type": "text/html; charset=UTF-8"});
          res.write(content_404);
          res.end();
        });
      },
    },
    ui: false,
    ghostMode: false
  });

  return {
    // Control which files Eleventy will process
    // e.g.: *.md, *.njk, *.html, *.liquid
    templateFormats: [
      "md",
      "njk",
      "html",
      "liquid"
    ],

    // -----------------------------------------------------------------
    // If your site deploys to a subdirectory, change `pathPrefix`.
    // Don’t worry about leading and trailing slashes, we normalize these.

    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for link URLs (it does not affect your file structure)
    // Best paired with the `url` filter: https://www.11ty.dev/docs/filters/url/

    // You can also pass this in on the command line using `--pathprefix`

    // Optional (default is shown)
    pathPrefix: "/",
    // -----------------------------------------------------------------

    // Pre-process *.md files with: (default: `liquid`)
    markdownTemplateEngine: "njk",

    // Pre-process *.html files with: (default: `liquid`)
    htmlTemplateEngine: "njk",

    // Opt-out of pre-processing global data JSON files: (default: `liquid`)
    dataTemplateEngine: false,

    // These are all optional (defaults are shown):
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };
};
