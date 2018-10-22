import axios from 'axios'
import _get from 'lodash/get'

export async function createPropertyProposal (data) {
  if (!data.property) throw new Error('missing data.property')
  if (!data.ontologyFileContent) throw new Error('missing data.ontologyFileContent')
  if (!data.token) throw new Error('missing data.token')

  const token = data.token // this.$apolloHelpers.getToken()

  const body = {
    title: `New property '${data.property.name}' on '${data.iri}'`,
    message: `add property '${data.property.name}' to '${data.iri}'`,
    body: data.property.motivation,
    iri: data.property.parentStructureIRI,
    content: data.ontologyFileContent
  }

  const headers = { headers: { authorization: `Bearer ${token}` } }
  try {
    const result = await axios.post('/api/proposal/new', body, headers)

    const id = _get(result, 'data.createThread.thread.id')
    return id
    // if (id) {
    //   this.$router.push({ name: 'proposal-id', params: { id } })
    // } else {
    //   console.error('Failed to redirect', result)
    // }
  } catch (err) {
    // console.error(err)
    throw err
  }
}

export async function createClassProposal (data) {
  if (!data.cls) throw new Error('missing data.cls')
  if (!data.ontologyContent) throw new Error('missing data.ontologyContent')
  if (!data.structureContent) throw new Error('missing data.structureContent')
  if (!data.iri) throw new Error('missing data.iri')
  if (!data.motivation) throw new Error('missing data.motivation')
  if (!data.token) throw new Error('missing data.token')

  // const ontologyContent = await this.cls.toNT(window.ontology)
  // const structureContent = await this.cls.toStructureNT(window.structure)
  const token = data.token // this.$apolloHelpers.getToken()

  const body = {
    title: `New class '${data.cls.name}'`,
    message: `add class '${data.cls.name}'`,
    body: data.motivation,
    iri: data.iri,
    ontologyContent: data.ontologyContent,
    structureContent: data.structureContent
  }

  const headers = { headers: { authorization: `Bearer ${token}` } }
  try {
    const result = await axios.post('/api/proposal/new', body, headers)

    const id = _get(result, 'data.createThread.thread.id')
    return id
    // if (id) {
    //   this.$router.push({ name: 'proposal-id', params: { id } })
    // } else {
    //   console.error('Failed to redirect', result)
    // }
  } catch (err) {
    // console.error(err)
    throw err
  }
}
