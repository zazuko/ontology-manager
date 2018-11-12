<template>
  <div>
    <div v-if="_get(ontology, '_quads.length') !== 0">
      <table class="table is-fullwidth has-background-white">
        <thead>
          <tr>
            <th>
              Property
            </th>
            <th>
              Expected Type
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
            <td>
              <link-to-IRI :term="property.subject" />
            </td>
            <td>
              <ul>
                <li
                  v-for="range in rangeOf(property.subject.value, ontology)"
                  :key="range.value">
                  <link-to-IRI :term="range" />
                </li>
              </ul>
            </td>
            <td>{{ getComment(property.subject.value).object.value }}</td>
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
import LinkToIRI from './LinkToIRI'

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
    LinkToIRI
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
