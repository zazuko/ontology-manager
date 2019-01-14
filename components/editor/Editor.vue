<template>
  <div>
    <div v-if="editor">
      <div class="editor">
        <editor-menu-bar :editor="editor">
          <div
            class="menubar"
            slot-scope="{ commands, isActive, getMarkAttrs }">

            <button
              class="menubar__button"
              :class="{ 'is-active': isActive.bold() }"
              title="Bold"
              @click="commands.bold">
              <icon name="bold" />
            </button>

            <button
              class="menubar__button"
              :class="{ 'is-active': isActive.italic() }"
              title="Italic"
              @click="commands.italic">
              <icon name="italic" />
            </button>

            <button
              class="menubar__button"
              :class="{ 'is-active': isActive.strike() }"
              title="Strike"
              @click="commands.strike">
              <icon name="strike" />
            </button>

            <button
              class="menubar__button"
              :class="{ 'is-active': isActive.code() }"
              title="Code"
              @click="commands.code">
              <icon name="code" />
            </button>

            <button
              class="menubar__button"
              :class="{ 'is-active': isActive.paragraph() }"
              title="Paragraph"
              @click="commands.paragraph">
              <icon name="paragraph" />
            </button>

            <button
              class="menubar__button"
              :class="{ 'is-active': isActive.heading({ level: 1 }) }"
              title="Heading 1"
              @click="commands.heading({ level: 1 })">
              H1
            </button>

            <button
              class="menubar__button"
              :class="{ 'is-active': isActive.heading({ level: 2 }) }"
              title="Heading 2"
              @click="commands.heading({ level: 2 })">
              H2
            </button>

            <button
              class="menubar__button"
              :class="{ 'is-active': isActive.heading({ level: 3 }) }"
              title="Heading 3"
              @click="commands.heading({ level: 3 })">
              H3
            </button>

            <button
              class="menubar__button"
              :class="{ 'is-active': isActive.bullet_list() }"
              title="Bullet List"
              @click="commands.bullet_list">
              <icon name="ul" />
            </button>

            <button
              class="menubar__button"
              :class="{ 'is-active': isActive.ordered_list() }"
              title="Ordered List"
              @click="commands.ordered_list">
              <icon name="ol" />
            </button>

            <button
              class="menubar__button"
              :class="{ 'is-active': isActive.blockquote() }"
              title="Quote"
              @click="commands.blockquote">
              <icon name="quote" />
            </button>

            <button
              class="menubar__button"
              :class="{ 'is-active': isActive.code_block() }"
              title="Code block"
              @click="commands.code_block">
              <icon name="code" />
            </button>

            <button
              class="menubar__button"
              :class="{ 'is-active': isActive.link() }"
              title="Add Link"
              @click="showLinkMenu(getMarkAttrs('link'))">
              <icon name="link" />
            </button>

            <button
              class="menubar__button"
              title="Undo"
              @click="commands.undo">
              <icon name="undo" />
            </button>

            <button
              class="menubar__button"
              title="Redo"
              @click="commands.redo">
              <icon name="redo" />
            </button>

            <div
              :class="{
                'is-active': linkMenuIsActive
              }"
              class="editor-link-modal modal">
              <div class="modal-background"></div>
              <form
                class="default-modal modal-card"
                @submit.prevent>
                <section class="modal-card-head">
                  <h1>
                    Edit link
                  </h1>
                  <div class="field has-addons">
                    <div class="control is-expanded">
                      <input
                        class="input menububble__input"
                        type="text"
                        v-model="linkUrl"
                        placeholder="https://"
                        ref="linkInput"
                        @keydown.esc="hideLinkMenu" />
                    </div>
                  </div>
                </section>
                <footer class="modal-card-foot">
                  <button
                    class="button is-info"
                    @click="setLinkUrl(commands.link, linkUrl)">
                    Add
                  </button>
                  <button
                    class="button"
                    @click="hideLinkMenu()">
                    Cancel
                  </button>
                </footer>
              </form>
            </div>
          </div>
        </editor-menu-bar>

        <editor-content
          class="editor__content"
          :editor="editor" />
      </div>
    </div>
    <div v-else />
  </div>
</template>

<script>
import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
import {
  Blockquote,
  CodeBlock,
  HardBreak,
  Heading,
  OrderedList,
  BulletList,
  ListItem,
  TodoItem,
  TodoList,
  Bold,
  Code,
  Italic,
  Link,
  Strike,
  Underline,
  History
} from 'tiptap-extensions'
import Icon from './EditorIcons'
import { toMarkdown, toHTML } from '@/libs/editor'

export default {
  props: {
    value: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  components: {
    EditorContent,
    EditorMenuBar,
    Icon
  },
  data () {
    if (!process.browser) {
      return {
        editor: false,
        markdown: ''
      }
    }
    return {
      linkUrl: null,
      linkMenuIsActive: false,
      editor: new Editor({
        editable: !this.disabled,
        extensions: [
          new Blockquote(),
          new BulletList(),
          new CodeBlock(),
          new HardBreak(),
          new Heading({ levels: [1, 2, 3] }),
          new ListItem(),
          new OrderedList(),
          new TodoItem(),
          new TodoList(),
          new Bold(),
          new Code(),
          new Italic(),
          new Link(),
          new Strike(),
          new Underline(),
          new History()
        ],
        content: this.value,
        onUpdate: (state) => {
          const html = state.getHTML()
          this.markdown = toMarkdown(html)
          this.$emit('input', this.markdown)
        }
      })
    }
  },
  mounted () {
    this.editor.setContent(toHTML(this.value))
  },
  watch: {
    value (newVal) {
      if (this.markdown !== newVal) {
        this.editor.setContent(toHTML(newVal))
      }
    }
  },
  beforeDestroy () {
    this.editor.destroy()
  },
  methods: {
    showLinkMenu (attrs) {
      this.linkUrl = attrs.href
      this.linkMenuIsActive = true
      this.$nextTick(() => {
        this.$refs.linkInput.focus()
      })
    },
    hideLinkMenu () {
      this.linkUrl = null
      this.linkMenuIsActive = false
    },
    setLinkUrl (command, url) {
      command({ href: url })
      this.hideLinkMenu()
      this.editor.focus()
    }
  }
}
</script>
