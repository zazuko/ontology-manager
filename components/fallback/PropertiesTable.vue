<template>
  <div>
    <div v-if="_get(ontology, '.length') !== 0">
      <table class="properties-table">
        <thead>
          <tr>
            <th>
              Property
            </th>
            <th>
              Expected&nbsp;Type
            </th>
            <th>
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(property, index) in properties"
            :key="index">
            <td class="property-name">
              <link-to-iri :term="property.subject" />
            </td>
            <td class="property-ranges">
              <ul>
                <li
                  v-for="range in rangeOf(property.subject.value, ontology)"
                  :key="range.value">
                  <link-to-iri :term="range" />
                </li>
              </ul>
            </td>
            <td class="property-comment">
              {{ getComment(property.subject.value).object.value }}
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
import { term, commentQuadForIRI, rebaseIRI, rangeOf } from '@/libs/rdf'
import LinkToIri from './LinkToIri'

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
  components: {
    LinkToIri
  },
  methods: {
    _get,
    term,
    rebaseIRI,
    rangeOf,
    getComment (iri) {
      return commentQuadForIRI(this.ontology, iri)
    }
  }
}
</script>
