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
        v-for="thread in threads"
        :key="thread.id">
        <td>{{ thread.id }}</td>
        <td>{{ thread.author.name }}</td>
        <td>{{ thread.hat }}</td>
        <td>{{ thread.externalId }}</td>
        <td>{{ thread.headline }}</td>
        <td>{{ thread.iri }}</td>
        <td>{{ thread.body }}</td>
        <td>{{ thread.threadType }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: 'DiscussionsList',
  props: ['threads']
}
</script>
