<template>
  <div>
    <table class="table admin-table">
      <thead>
        <tr>
          <th>Version<br>Date</th>
          <th>Author</th>
          <th>Reason</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="config in configs"
          :key="config.id">
          <td>
            {{ config.id }}
            <br>
            {{ config.createdAt | formatTime }}
          </td>
          <td>
            <div
              v-if="config.author"
              class="media">
              <div class="media-content">
                <a
                  :href="externalProfile(config.author.username)"
                  rel="noopener noreferrer"
                  target="_blank">
                  {{ config.author.username }}
                </a>
              </div>
              <figure class="media-right">
                <img
                  class="avatar"
                  :src="config.author.avatar" />
              </figure>
            </div>
            <span v-else>
              <em>system</em>
            </span>
          </td>
          <td>
            {{ config.reason }}
          </td>
          <td>
            <button
              @click.prevent="$emit('showVersion', config.id)"
              class="button is-small is-info">
              Show
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'AdminConfigList',
  props: {
    configs: {
      type: Array,
      required: true,
      default () {
        return []
      }
    }
  },
  methods: {
    externalProfile (username) {
      return `https://github.com/${username}`
    }
  }
}
</script>
