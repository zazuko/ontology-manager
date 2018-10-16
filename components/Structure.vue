<template>
  <div>
    <div class="tile is-vertical is-12">
      <div class="tile is-parent">
        <article class="tile is-child notification is-danger">
          <p class="title">
            <nuxt-link
              v-if="obj.path"
              :to="{ path: obj.path, params: {} }">
              {{ name }}
            </nuxt-link>
            <span
              v-else>
              {{ name }}
            </span>
          </p>
          <p
            v-if="obj.type === 'class'"
            class="subtitle">
            {{ obj.properties.length }} properties
          </p>

          <div class="content">
            <div
              v-for="(group, index) in arrayToGroups(obj)"
              :key="index"
              class="tile is-ancestor">
              <div
                v-for="child in group"
                :key="child.path"
                class="tile is-parent is-3">
                <article class="tile is-child box notification is-warning">
                  <p class="title">
                    <nuxt-link
                      v-if="child.path"
                      :to="{ path: child.path, params: {} }">
                      {{ child.label }}
                    </nuxt-link>
                    <span
                      v-else>
                      {{ child.label }}
                    </span>
                  </p>
                  <p class="subtitle">
                    {{ child.properties.length }} properties
                  </p>
                </article>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script>
import { arrayToGroups } from '@/libs/utils'

export default {
  name: 'Structure',
  props: {
    name: {
      type: String,
      required: true
    },
    obj: {
      type: Object,
      required: false,
      default: () => ({})
    },
    parent: {
      type: Object,
      required: false,
      default: () => ({})
    },
    depth: {
      type: Number,
      required: false,
      default: 0
    }
  },
  methods: {
    arrayToGroups
  }
}
</script>
