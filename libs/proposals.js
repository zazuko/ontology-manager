import axios from 'axios'
import _get from 'lodash/get'
import { parse, stringify } from 'flatted/cjs'
import { Class } from '@/models/Class'
import { Property } from '@/models/Property'

const ObjectTypes = { Class, Property }

export async function submitProposal (data) {
  if (!data.object) throw new Error('missing data.object')
  if (!data.title) throw new Error('missing data.title')
  if (!data.message) throw new Error('missing data.message')
  if (!data.ontologyContent) throw new Error('missing data.ontologyContent')
  if (!data.structureContent) throw new Error('missing data.structureContent')
  if (!data.token) throw new Error('missing data.token')

  const token = data.token

  const body = {
    title: data.title,
    message: data.message,
    body: data.object.motivation,
    iri: data.object.parentStructureIRI,
    ontologyContent: data.ontologyContent,
    structureContent: data.structureContent
  }

  const headers = { headers: { authorization: `Bearer ${token}` } }

  const result = await axios.post('/api/proposal/submit', body, headers)

  const id = _get(result, 'data.createThread.thread.id')
  return id
}

// proposal serializing and deserializing
function proposalReviver () {
  const seen = new Map()
  return (key, value) => {
    if (typeof value === 'object' && value.proposalType) {
      if (seen.has(value)) {
        const obj = seen.get(value)
        return obj
      }
      const obj = new ObjectTypes[value.proposalType](value)
      seen.set(value, obj)
      return obj
    }
    return value
  }
}

export function proposalSerializer (proposalObject) {
  return stringify(proposalObject)
}

export function proposalDeserializer (proposalObject) {
  const reviver = proposalReviver()
  return parse(proposalObject, reviver)
}
