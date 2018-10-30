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
          <a :href="rebaseIRI(property.iri)">
            {{ property.label }}
          </a>
        </td>
        <td>
          <ul>
            <li
              v-for="range in rangeOf(property.iri, dataset)"
              :key="range.value">
              <a
                :href="rebaseIRI(range.value)"
                target="_blank">
                {{ term(range.value) }}
              </a>
            </li>
          </ul>
        </td>
        <td>
          <ul>
            <li
              v-for="otherClass in usedOnClasses(property.iri, dataset)"
              :key="otherClass.object.value">
              <a
                :href="rebaseIRI(otherClass.object.value)"
                target="_blank">
                {{ term(otherClass.object) }}
              </a>
            </li>
          </ul>
        </td>
        <td>
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
import { term, rebaseIRI, usedOnClasses, rangeOf } from '@/libs/rdf'

export default {
  name: 'PropertiesTable',
  props: {
    properties: {
      type: Array,
      required: true
    },
    dataset: {
      type: Object,
      required: true
    }
  },
  methods: {
    term,
    rebaseIRI,
    usedOnClasses,
    rangeOf
  }
}
</script>
