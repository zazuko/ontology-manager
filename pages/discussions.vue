<template>
  <section class="container">
    <div
      v-for="thread in allThreads.threads"
      :key="thread.id">
      <table border="1">
        <tr>
          <td>id</td>
          <td>author name</td>
          <td>hat</td>
          <td>externalId</td>
          <td>headline</td>
          <td>iri</td>
          <td>body</td>
          <td>threadType</td>
        </tr>
        <tr>
          <td>{{ thread.id }}</td>
          <td>{{ thread.author.name }}</td>
          <td>{{ thread.hat }}</td>
          <td>{{ thread.externalId }}</td>
          <td>{{ thread.headline }}</td>
          <td>{{ thread.iri }}</td>
          <td>{{ thread.body }}</td>
          <td>{{ thread.threadType }}</td>
        </tr>
      </table>
    </div>
  </section>
</template>

<script>
import gql from 'graphql-tag'

export default {
  data: () => ({
    allThreads: []
  }),
  apollo: {
    allThreads: {
      query: gql`{
        allThreads {
          threads: nodes {
            id,
            headline,
            body,
            hat: hatByHatId {
              title
            },
            author: personByAuthorId {
              name
            },
            iri,
            threadType,
            authorId,
            externalId
          }
        }
      }`
    }
  }
}
</script>

<style scoped>
tr {
  padding: 12px;
}
td {
  padding: 12px;
}
</style>
