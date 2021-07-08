import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import type { DiagramEngine } from '@projectstorm/react-diagrams-core'
import { TestWrapper } from '@common/utils/testUtils'
import { CreateNewWidget } from '../CreateNew/CreateNewWidget'
import type { CreateNewModel } from '../CreateNew/CreateNewModel'

const getNode = (): CreateNewModel => {
  return {
    getOptions: () => ({
      name: 'name',
      height: 64,
      width: 64
    }),
    getInPorts: () => [],
    getOutPorts: () => [],
    isSelected: () => false,
    setSelected: () => undefined
  } as unknown as CreateNewModel
}

const getEngine = (): DiagramEngine => {
  return {} as unknown as DiagramEngine
}

describe('CreateNewWidget snapshot tests', () => {
  test('renders properly', () => {
    const { container } = render(
      <TestWrapper>
        <CreateNewWidget node={getNode()} engine={getEngine()} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

describe('CreateNewWidget interaction tests', () => {
  test('click works properly', () => {
    const node = getNode()
    const _fireEvent = jest.fn()
    node.fireEvent = _fireEvent
    const { container } = render(
      <TestWrapper>
        <CreateNewWidget node={node} engine={getEngine()} />
      </TestWrapper>
    )

    const addButton = container.querySelector('.defaultCard.createNew')
    fireEvent.click(addButton!)

    expect(_fireEvent).toBeCalled()
  })

  test('mouseDown works properly', () => {
    const node = getNode()
    const setSelected = jest.fn()
    node.setSelected = setSelected
    const { container } = render(
      <TestWrapper>
        <CreateNewWidget node={node} engine={getEngine()} />
      </TestWrapper>
    )

    const addButton = container.querySelector('.defaultCard.createNew')
    fireEvent.mouseDown(addButton!)

    expect(setSelected).toBeCalled()
  })

  // TODO: add tests for
  //fireEvent.dragOver(addButton)
  //fireEvent.dragLeave(addButton)
  //fireEvent.drop(addButton)
})
