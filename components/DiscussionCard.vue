<template>
  <div>
    <h1>Discussion</h1>
    <table class="table is-bordered is-striped is-narrow is-fullwidth">
      <thead>
        <tr>
          <th>id</th>
          <th>avatar</th>
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
        <tr v-if="discussion.author">
          <td>{{ discussion.id }}</td>
          <td>{{ discussion.author.avatar }}</td>
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

    <h1>Answers</h1>
    <table class="table is-bordered is-striped is-narrow is-fullwidth">
      <thead>
        <tr>
          <th>id</th>
          <th>avatar</th>
          <th>author name</th>
          <th>hat</th>
          <th>body</th>
        </tr>
      </thead>
      <tbody v-if="discussion.answers">
        <tr
          v-for="message in discussion.answers.messages"
          :key="message.id">
          <td>{{ message.id }}</td>
          <td>{{ message.author.avatar }}</td>
          <td>{{ message.author.name }}</td>
          <td>{{ message.hat }}</td>
          <td>{{ message.body }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'DiscussionCard',
  props: ['discussion']
}
</script>
