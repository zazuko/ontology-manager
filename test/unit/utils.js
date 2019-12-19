import test from 'ava'
import { findSubtreeInForest, isCyclicTree, buildAdjacencyList, isCyclic } from '../../libs/utils'

test('libs/utils: findSubtreeInForest', (t) => {
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
  t.is(findSubtreeInForest(tree, 'a'), nodeA)
  t.is(findSubtreeInForest(tree, 'b'), nodeB)
  t.is(findSubtreeInForest(tree, 'c'), nodeC)
  t.is(findSubtreeInForest(tree, 'd'), nodeD)
  t.is(findSubtreeInForest(tree, 'e'), nodeE)
})

test('libs/utils: cycle utilities: has no cycle', (t) => {
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

  t.false(isCyclicTree(schemaTree))
})

test('libs/utils: cycle utilities: has a nested cycle', (t) => {
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
  t.true(isCyclicTree(schemaTree))
})

test('libs/utils: cycle utilities: has a toplevel cycle', (t) => {
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
  t.true(isCyclicTree(schemaTree))
})

test('libs/utils: cycle utilities: has a deep cycle', (t) => {
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
  t.true(isCyclicTree(schemaTree))
})

test('libs/utils: cycle utilities: detects on adjacency list', (t) => {
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
  t.true(isCyclicTree(schemaTree))
})

test('libs/utils: cycle utilities: works with key not in adjacency list', (t) => {
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
  t.false(isCyclic(adjacencyList))
})
