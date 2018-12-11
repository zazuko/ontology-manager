<template>
  <div>
    <editor v-model="html" />
    <pre>{{ md }}</pre>
    <pre>{{ newHTML }}</pre>
    <pre>{{ html }}</pre>
    <button
      class="button"
      @click="foo">sanitized</button>
  </div>
</template>

<script>
import Editor from '@/components/editor/Editor'

import { toMarkdown, toHTML } from '@/libs/editor'

export default {
  components: {
    Editor
  },
  data () {
    return {
      md: '',
      newHTML: '',
      html: `
        <h2>
          Hi there,
        </h2>
        <p>
          this is a very <em>basic</em> example of tiptap.
        </p>
        <pre><code>body { display: none; }</code></pre>
        <ul>
          <li>
            A regular list
          </li>
          <li>
            With regular items
          </li>
        </ul>
        <blockquote>
          It's amazing 👏
          <br />
          – mom
        </blockquote>
      `
    }
  },
  watch: {
    html () {
      console.log(this.html)
      this.md = toMarkdown(this.html)
      this.newHTML = toHTML(this.md).replace(/\n/g, '')
    }
  },
  methods: {
    toMarkdown,
    toHTML,
    foo () {
      const oh = 'script>al'
      const snap = 'ert("haha")'
      const hereAsWell = 'onclick="confirm(\'paf\')"'
      const paf = '/script>'
      const p = `
        <h2>
          Hi there,
        </h2>
        <p>
          this is a very <em>basic</em> example of tiptap.
        </p>
        <pre><code>body { display: none; }</code></pre>
        <ul>
          <li>
            A regular list
          </li>
          <li>
            With regular items
          </li>
        </ul>
        <${oh}${snap}<${paf}
        <a href="#foo" ${hereAsWell}>hello</a>
        <blockquote>
          It's amazing 👏
          <br />
          – mom
        </blockquote>`

      console.log(toHTML(toMarkdown(p)))
    }
  }
}
</script>
