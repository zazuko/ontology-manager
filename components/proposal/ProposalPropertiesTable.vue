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
        <th />
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(property, index) in properties"
        :key="index">
        <td>
          <a
            v-if="property.isNew"
            :href="`#${property.label}`">
            {{ property.label }}
          </a>
          <a
            v-else
            :href="rebaseIRI(property.iri)">
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
                v-if="classIsNew(otherClass)"
                :href="`#${ term(otherClass.object) }`">
                {{ term(otherClass.object) }}
              </a>
              <a
                v-else
                :href="rebaseIRI(otherClass.object.value)"
                target="_blank">
                {{ term(otherClass.object) }}
              </a>
            </li>
          </ul>
        </td>
        <td>
          <button
            class="button is-small is-danger is-outlined"
            @click.prevent="$emit('delete', index)">
            Remove
          </button>
          <a
            class="button is-small is-success is-outlined"
            v-show="property.isNew"
            :href="`#${property.label}`">
            Edit
          </a>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { term, termIRI, rebaseIRI, usedOnClasses, rangeOf } from '@/libs/rdf'

export default {
  name: 'ProposalPropertiesTable',
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
    rangeOf,
    classIsNew ({ object }) {
      const ontology = this.$store.getters['graph/ontology']
      const found = ontology.match(object, termIRI.a, termIRI.class).toArray().length
      return !found
    }
  }
}
</script>
