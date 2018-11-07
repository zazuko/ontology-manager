<template>
  <div>
    <div v-if="_get(ontology, '_quads.length') !== 0">
      <table class="table is-fullwidth">
        <thead>
          <tr>
            <th>
              Property
            </th>
            <th>
              Type
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(property, index) in properties"
            :key="index">
            <td>
              <a
                :href="rebaseIRI(property.subject.value)">
                {{ _get(getLabel(property.subject.value), 'object.value') }}
              </a>
            </td>
            <td>
              <ul>
                <li
                  v-for="range in rangeOf(property.subject.value, ontology)"
                  :key="range.value">
                  <a
                    :href="rebaseIRI(range.value)"
                    target="_blank">
                    {{ term(range.value) }}
                  </a>
                </li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else />
  </div>
</template>

<script>
import _get from 'lodash/get'
import { term, labelQuadForIRI, rebaseIRI, rangeOf } from '@/libs/rdf'

export default {
  name: 'PropertiesTable',
  props: {
    properties: {
      type: Array,
      required: true
    },
    ontology: {
      type: Object,
      required: true
    },
    structure: {
      type: Object,
      required: true
    }
  },
  methods: {
    _get,
    term,
    rebaseIRI,
    rangeOf,
    getLabel (iri) {
      return labelQuadForIRI(this.ontology, iri)
    }
  }
}
</script>
