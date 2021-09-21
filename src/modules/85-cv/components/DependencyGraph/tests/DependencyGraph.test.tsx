import React from 'react'
import { render, waitFor, screen } from '@testing-library/react'
import { DependencyGraph } from '@cv/components/DependencyGraph/DependencyGraph'
import {
  nodes,
  graphData,
  formattedNodes,
  defaultOptions
} from '@cv/components/DependencyGraph/tests/DependencyGraph.mock'
import { formatNodes, dependencyGraphOptions } from '@cv/components/DependencyGraph/DependencyGraph.utils'

describe('Unit tests for DependencyGraph', () => {
  test('Ensure Graph Component renders', async () => {
    const { container } = render(<DependencyGraph dependencyData={{ data: graphData, nodes: nodes }} />)
    await waitFor(() => expect(container.querySelector('[class*="DependencyGraph"]')).not.toBeNull())
  })

  test.each(nodes)('Ensure %o node has been renderer', ({ id }) => {
    render(<DependencyGraph dependencyData={{ data: graphData, nodes: nodes }} />)
    expect(screen.findByText(id)).not.toBeNull()
  })

  test('Ensure the correct number of LOW nodes have been rendered', () => {
    const { container } = render(<DependencyGraph dependencyData={{ data: graphData, nodes: nodes }} />)
    const LOWNodes = nodes.filter(node => node.status === 'LOW')
    expect(container.getElementsByClassName('Status_LOW').length).toBe(LOWNodes.length)
  })

  test('Ensure the correct number of MEDIUM nodes have been rendered', () => {
    const { container } = render(<DependencyGraph dependencyData={{ data: graphData, nodes: nodes }} />)
    const LOWNodes = nodes.filter(node => node.status === 'MEDIUM')
    expect(container.getElementsByClassName('Status_MEDIUM').length).toBe(LOWNodes.length)
  })

  test('Ensure the correct number of TBD nodes have been rendered', () => {
    const { container } = render(<DependencyGraph dependencyData={{ data: graphData, nodes: nodes }} />)
    const LOWNodes = nodes.filter(node => node.status === 'TBD')
    expect(container.getElementsByClassName('Status_TBD').length).toBe(LOWNodes.length)
  })

  test('Ensure the correct number of red nodes have been rendered', () => {
    const { container } = render(<DependencyGraph dependencyData={{ data: graphData, nodes: nodes }} />)
    const LOWNodes = nodes.filter(node => node.status === 'HIGH')
    expect(container.getElementsByClassName('Status_HIGH').length).toBe(LOWNodes.length)
  })

  test('Ensure the formatNodes function returns correctly formatted nodes', () => {
    expect(formatNodes(nodes)).toEqual(formattedNodes)
  })

  test('Ensure default options returns correctly', () => {
    expect(JSON.stringify(dependencyGraphOptions({ data: graphData, nodes }))).toEqual(JSON.stringify(defaultOptions))
  })
})
