<template>
  <table class="properties-table">
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
        <th v-show="!readonly" />
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(property, index) in properties"
        :key="index">
        <td class="property-name">
          <template v-if="property.isNew">
            <a :href="`#${property.label}`">
              {{ property.label }}
            </a>
            &nbsp;
            <span class="tag is-info">
              new
            </span>
          </template>
          <template v-else-if="property.iri">
            <a :href="$rebaseIRI(property.iri)">
              {{ property.label }}
            </a>
          </template>
        </td>
        <td class="property-ranges">
          <ul class="types-list">
            <li
              v-for="range in $rangeOf(property.iri, dataset)"
              :key="range.value">
              <a
                :href="$rebaseIRI(range.value)"
                rel="noopener noreferrer"
                target="_blank">
                {{ label(range) }}
              </a>
            </li>
          </ul>
        </td>
        <td class="property-used-on">
          <ul class="types-list">
            <li
              v-for="otherClass in $usedOnClasses(property.iri, dataset)"
              :key="otherClass.object.value">
              <a
                v-if="classIsNew(otherClass)"
                :href="`#${ term(otherClass.object) }`">
                {{ term(otherClass.object) }}
              </a>
              <a
                v-else
                :href="$rebaseIRI(otherClass.object.value)"
                rel="noopener noreferrer"
                target="_blank">
                {{ term(otherClass.object) }}
              </a>
            </li>
          </ul>
        </td>
        <td
          v-show="!readonly"
          class="property-actions">
          <div class="is-pulled-right">
            <a
              class="table-action-button"
              v-show="property.isNew"
              @click.prevent="jumpToProperty(property, index)">
              Edit
            </a>
            <button
              class="table-action-button"
              @click.prevent="$emit('delete', index)">
              Remove
            </button>
          </div>
        </td>
      </tr>
      <tr
        v-for="(property, index) in removedProperties"
        :key="index + 200000">
        <td class="property-name">
          <a :href="$rebaseIRI(property.iri)">
            {{ property.label }}
          </a>
          &nbsp;
          <span class="tag is-danger">
            removed
          </span>
        </td>
        <td class="property-ranges">
          <ul class="types-list">
            <li
              v-for="range in $rangeOf(property.iri, dataset)"
              :key="range.value">
              <a
                :href="$rebaseIRI(range.value)"
                rel="noopener noreferrer"
                target="_blank">
                {{ term(range.value) }}
              </a>
            </li>
          </ul>
        </td>
        <td class="property-used-on">
          <ul class="types-list">
            <li
              v-for="otherClass in $usedOnClasses(property.iri, dataset)"
              :key="otherClass.object.value">
              <a
                :href="$rebaseIRI(otherClass.object.value)"
                rel="noopener noreferrer"
                target="_blank">
                <del v-if="otherClass.object.value === iri">
                  {{ term(otherClass.object) }}
                </del>
                <template v-else>
                  {{ term(otherClass.object) }}
                </template>
              </a>
            </li>
          </ul>
        </td>
        <td
          v-show="!readonly"
          class="property-actions">
          <div class="is-pulled-right">
            <button
              class="table-action-button"
              @click.prevent="reselectDomain(index)">
              Re-add
            </button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { term } from '@/libs/utils'

export default {
  name: 'ProposalPropertiesTable',
  props: {
    iri: {
      type: String,
      required: true
    },
    readonly: {
      type: Boolean,
      required: false,
      default: false
    },
    properties: {
      type: Array,
      required: true
    },
    removedProperties: {
      type: Array,
      required: true
    },
    dataset: {
      type: Object,
      required: true
    },
    storePath: {
      type: String,
      required: true
    }
  },
  methods: {
    term,
    label (aTerm) {
      const label = this.$store.getters['graph/ontology'].match(aTerm, this.$termIRI.label).toArray()[0]
      if (!label) {
        return this.$unPrefix(aTerm.value)
      }
      return term(label.object)
    },
    reselectDomain (index) {
      this.$emit('reselectDomain', index)
    },
    classIsNew ({ object }) {
      const ontology = this.$store.getters['graph/ontology']
      const found = ontology.match(object, this.$termIRI.a, this.$termIRI.class).toArray().length
      return !found
    },
    jumpToProperty (property, index) {
      if (this.storePath) {
        this.$vuexSet(`${this.storePath}.domains[${index}].collapsed`, false)
      }
      setTimeout(() => {
        try {
          document.getElementById(property.label).scrollIntoView()
        }
        catch (err) {}
      }, 25)
    }
  }
}
</script>
