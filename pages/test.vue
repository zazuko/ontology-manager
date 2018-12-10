<template>
  <div>
    <editor v-model="html" />
  </div>
</template>

<script>
import Editor from '@/components/editor/Editor'

export default {
  components: {
    Editor
  },
  data () {
    return {
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
    }
  }
}
</script>
