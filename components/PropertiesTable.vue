<template>
  <table class="table is-fullwidth">
    <thead>
      <tr>
        <th>
          Property
        </th>
        <th>
          Type
        </th>
        <th>
          Used On
          <br>
          <small>these classes</small>
        </th>
        <th>
          Remove
          <br>
          <small>from class being created</small>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(property, index) in properties"
        :key="index">
        <td>
          <a :href="rebaseIRI(property.key)">
            {{ property.label }}
          </a>
        </td>
        <td>
          <a :href="rebaseIRI(property.range)">
            {{ term(property.range) }}
          </a>
        </td>
        <td>
          <ul>
            <li
              v-for="otherClass in property.usedOn"
              :key="otherClass.object.value">
              <small>
                <code>{{ term(otherClass.object) }}</code>
              </small>
            </li>
          </ul>
        </td>
        <td>
          <!-- TODO: what would 'edit' do here? -->
          <!-- <span
            class="panel-icon">
            <i class="mdi mdi-pencil" />
          </span> -->
          <span
            class="panel-icon"
            @click.prevent="$emit('delete', index)">
            <i class="mdi mdi-close-circle" />
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { term, rebaseIRI } from '@/libs/rdf'

export default {
  name: 'PropertiesTable',
  props: {
    properties: {
      type: Array,
      required: true
    }
  },
  methods: {
    term,
    rebaseIRI
  }
}
</script>
