import { findSubtreeInForest, isCyclicTree, buildAdjacencyList, isCyclic } from '../libs/utils'

describe('libs/utils', () => {
  test('findSubtreeInForest', () => {
    const nodeA = { iri: 'a', children: [] }
    const nodeB = { iri: 'b', children: [] }
    const nodeC = { iri: 'c', children: [] }
    const nodeD = { iri: 'd', children: [] }
    const nodeE = { iri: 'e', children: [] }
    nodeD.children.push(nodeE)
    nodeC.children.push(nodeD)
    nodeB.children.push(nodeC)
    nodeA.children.push(nodeB)
    nodeA.children.push(nodeE)
    nodeC.children.push(nodeA)
    const tree = [
      nodeE, nodeA, nodeB
    ]
    expect(findSubtreeInForest(tree, 'a')).toBe(nodeA)
    expect(findSubtreeInForest(tree, 'b')).toBe(nodeB)
    expect(findSubtreeInForest(tree, 'c')).toBe(nodeC)
    expect(findSubtreeInForest(tree, 'd')).toBe(nodeD)
    expect(findSubtreeInForest(tree, 'e')).toBe(nodeE)
  })

  describe('cycle utilities', () => {
    it('has no cycle', () => {
      const schemaTree = [{
        iri: 'a',
        children: [{
          iri: 'b',
          children: [{
            iri: 'c',
            children: [{
              iri: 'd', children: []
            }]
          }]
        }]
      },
      {
        iri: 'b',
        children: []
      }]

      expect(isCyclicTree(schemaTree)).toBe(false)
    })

    it('has a nested cycle', () => {
      const schemaTree = [{
        iri: 'a',
        children: [{
          iri: 'd',
          children: [{ iri: 'a', children: [] }]
        },
        {
          iri: 'b',
          children: [{
            iri: 'c',
            children: [{
              iri: 'd', children: []
            }]
          }]
        }]
      }]
      expect(isCyclicTree(schemaTree)).toBe(true)
    })

    it('has a toplevel cycle', () => {
      const schemaTree = [{
        iri: 'a',
        children: [{
          iri: 'b',
          children: [{
            iri: 'c',
            children: [{
              iri: 'd', children: []
            }]
          }]
        }]
      },
      {
        iri: 'd',
        children: [{ iri: 'a', children: [] }]
      }]
      expect(isCyclicTree(schemaTree)).toBe(true)
    })

    it('has a deep cycle', () => {
      const schemaTree = [{
        iri: 'a',
        children: [{
          iri: 'b',
          children: [{
            iri: 'c',
            children: [{
              iri: 'd', children: []
            }]
          }]
        }]
      },
      {
        iri: 'd',
        children: [{
          iri: 'e',
          children: [
            { iri: 'f', children: [] }
          ]
        }]
      },
      {
        iri: 'f', children: [{ iri: 'b', children: [] }]
      }]
      expect(isCyclicTree(schemaTree)).toBe(true)
    })

    it('detects on adjacency list', () => {
      const schemaTree = [{
        iri: 'a',
        children: [{ iri: 'b', children: [] }]
      },
      {
        iri: 'b',
        children: [{ iri: 'c', children: [] }]
      },
      {
        iri: 'c',
        children: [{ iri: 'd', children: [] }]
      },
      {
        iri: 'd',
        children: [{ iri: 'e', children: [] }]
      },
      {
        iri: 'e',
        children: [{ iri: 'f', children: [] }]
      },
      {
        iri: 'f',
        children: [{ iri: 'b', children: [] }]
      }]
      expect(isCyclicTree(schemaTree)).toBe(true)
    })

    it('works with key not in adjacency list', () => {
      const schemaTree = [{
        iri: 'a',
        children: [{
          iri: 'b',
          children: [{
            iri: 'c',
            children: [{
              iri: 'd',
              children: []
            }]
          }]
        }]
      },
      {
        iri: 'b',
        children: []
      }]
      const adjacencyList = buildAdjacencyList(schemaTree)
      adjacencyList.a.push('x')
      expect(isCyclic(adjacencyList)).toBe(false)
    })
  })
})
