import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'

const turndownService = new TurndownService()
turndownService.use(gfm)

export function toMarkdown (html) {
  return turndownService.turndown(html)
}
