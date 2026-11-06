import sanitizeHtml from "sanitize-html"

/**
 * Sanitizes admin-authored blog HTML before it is rendered with dangerouslySetInnerHTML.
 * Strips <script>, inline event handlers (onerror=...), javascript: URLs, iframes, etc.
 * so a compromised admin account / bad paste can never become stored XSS for visitors.
 */
export function sanitizeBlogHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "hr", "blockquote", "pre", "code",
      "strong", "b", "em", "i", "u", "s", "mark", "small", "sub", "sup",
      "ul", "ol", "li", "a", "img", "figure", "figcaption",
      "table", "thead", "tbody", "tr", "th", "td", "div", "span",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel", "title"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https", "data"] },
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, rel: "noopener noreferrer nofollow", target: "_blank" },
      }),
    },
  })
}

