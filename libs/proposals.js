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

  const replaceObject = (value) => {
    if (seen.has(value)) {
      const obj = seen.get(value)
      return obj
    }
    const obj = new ObjectTypes[value.proposalType](value)
    seen.set(value, obj)
    return obj
  }

  return (key, value) => {
    if (value && typeof value === 'object' && value.proposalType) {
      return replaceObject(value)
    }
    if (Array.isArray(value)) {
      return value.map((val) => {
        if (val && typeof val === 'object' && val.proposalType) {
          return replaceObject(val)
        }
        return val
      })
    }
    return value
  }
}

export function proposalSerializer (proposalObject) {
  return stringify(proposalObject)
}

export function proposalDeserializer (proposalObject) {
  const reviver = proposalReviver()
  if (typeof proposalObject !== 'string') {
    return parse(JSON.stringify(proposalObject), reviver)
  }
  return parse(proposalObject, reviver)
}

export function proposalType (proposalObject) {
  if (!Array.isArray(proposalObject)) {
    return ''
  }
  const index = proposalObject[0]
  const valueAt = _get(index, ['proposalType'], NaN)
  return _get(proposalObject, valueAt, '')
}
