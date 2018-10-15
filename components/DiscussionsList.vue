<template>
  <table class="table is-bordered is-striped is-narrow is-fullwidth">
    <thead>
      <tr>
        <th>id</th>
        <th>author name</th>
        <th>hat</th>
        <th>externalId</th>
        <th>headline</th>
        <th>iri</th>
        <th>body</th>
        <th>threadType</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="discussion in discussions"
        :key="discussion.id">
        <td>
          <nuxt-link :to="{ name: 'discussions-id', params: { id: discussion.id } }">
            {{ discussion.id }}
          </nuxt-link>
        </td>
        <td>{{ discussion.author.name }}</td>
        <td>{{ discussion.hat }}</td>
        <td>
          {{ discussion.externalId }}
          <br>
          <a
            :href="githubLink(discussion.externalId)"
            target="_blank">See on GitHub</a>
        </td>
        <td>{{ discussion.headline }}</td>
        <td>{{ discussion.iri }}</td>
        <td>{{ discussion.body }}</td>
        <td>{{ discussion.threadType }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
const ontologyConfig = require('~/ontology.config')

export default {
  name: 'DiscussionsList',
  props: ['discussions'],
  methods: {
    githubLink (id) {
      const { owner, repo } = ontologyConfig.github
      return `https://github.com/${owner}/${repo}/pull/${id}`
    }
  }
}
</script>
