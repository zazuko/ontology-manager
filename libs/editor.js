import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'
import marked from 'marked'
// import SanitizeState from 'marked-sanitizer-github'

const turndownService = new TurndownService()
turndownService.use(gfm)

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  breaks: true,
  tables: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  headerIds: false,
  silent: true
})

export function toMarkdown (html) {
  return turndownService.turndown(html)
}

export function toHTML (md) {
  // const state = new SanitizeState()

  return marked(md, {
    sanitize: true,
    // sanitizer: state.getSanitizer()
  })
}

export function sanitizeHTML (html) {
  return toHTML(toMarkdown(html))
}
