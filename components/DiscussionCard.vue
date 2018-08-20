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
      <tr>
        <td>{{ discussion.id }}</td>
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
  name: 'DiscussionCard',
  props: ['discussion']
}
</script>
