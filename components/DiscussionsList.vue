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
        <td>{{ discussion.externalId }}</td>
        <td>{{ discussion.headline }}</td>
        <td>{{ discussion.iri }}</td>
        <td>{{ discussion.body }}</td>
        <td>{{ discussion.threadType }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: 'DiscussionsList',
  props: ['discussions']
}
</script>
