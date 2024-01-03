export default class Resource {
  constructor ({
    motivation = '',
    threadId = null,
    // when editing a Resource, originalIRI is the IRI that this.iri will replace
    originalIRI = '',
    label = '',
    comment = '',
    description = '',
    example = '',
    isDeprecated = false,
    // domains added to this Resource
    domains = [],
    // domains removed from this Resource, only used when editing a Resource
    domainsRemoved = [], // Array<string iri>
    // Pouch/Container to which this Resource belongs
    parentStructureIRI = '',
    // true if it's a child and the box is collapsed
    isSubFormCollapsed = false,
    // true if it's a child created from a proposal
    isNew = false,
    // false if the proposal got submitted
    isDraft = true,
    // true if the proposal is editing an existing object instead of adding a new one
    isEdit = false
  } = {}) {
    this.isDraft = isDraft

    this.motivation = motivation

    this.threadId = threadId

    this.originalIRI = originalIRI

    this.label = label
    this.comment = comment
    this.description = description
    this.example = example
    this.isDeprecated = isDeprecated

    this.domains = domains
    this.domainsRemoved = domainsRemoved

    this.parentStructureIRI = parentStructureIRI

    this.isSubFormCollapsed = isSubFormCollapsed
    this.isNew = isNew
    this.isEdit = isEdit
  }

  toJSON () {
    return { ...this }
  }

  validate () {
    if (!this.baseIRI) {
      throw new Error(`${this.proposalType} 'baseIRI' missing`)
    }

    if (!this.label) {
      throw new Error(`${this.proposalType} 'label' missing`)
    }

    if (!this.comment) {
      throw new Error(`${this.proposalType} 'comment' missing`)
    }
  }
}
