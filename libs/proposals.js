import axios from 'axios'
import _get from 'lodash/get'

export async function createPropertyProposal (data) {
  if (!data.property) throw new Error('missing data.property')
  if (!data.ontologyContent) throw new Error('missing data.ontologyContent')
  if (!data.token) throw new Error('missing data.token')

  const token = data.token

  const body = {
    title: `New property '${data.property.label}' on '${data.property.parentStructureIRI}'`,
    message: `add property '${data.property.label}' to '${data.property.parentStructureIRI}'`,
    body: data.property.motivation,
    iri: data.property.parentStructureIRI,
    ontologyContent: data.ontologyContent
  }

  const headers = { headers: { authorization: `Bearer ${token}` } }

  const result = await axios.post('/api/proposal/new', body, headers)

  const id = _get(result, 'data.createThread.thread.id')
  return id
}

export async function createClassProposal (data) {
  if (!data.clss) throw new Error('missing data.clss')
  if (!data.ontologyContent) throw new Error('missing data.ontologyContent')
  if (!data.structureContent) throw new Error('missing data.structureContent')
  if (!data.token) throw new Error('missing data.token')

  const token = data.token

  const body = {
    title: `New class '${data.clss.label}'`,
    message: `add class '${data.clss.label}'`,
    body: data.clss.motivation,
    iri: data.clss.parentStructureIRI,
    ontologyContent: data.ontologyContent,
    structureContent: data.structureContent
  }

  const headers = { headers: { authorization: `Bearer ${token}` } }

  const result = await axios.post('/api/proposal/new', body, headers)

  const id = _get(result, 'data.createThread.thread.id')
  return id
}
