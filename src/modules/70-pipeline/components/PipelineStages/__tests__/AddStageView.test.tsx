import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { AddStageView, AddStageViewProps } from '../views/AddStageView'
import { stageMockData } from './mocks'

const commonProps: AddStageViewProps = {
  stages: stageMockData,
  isParallel: false,
  callback: jest.fn()
}

describe('Add Stage View', () => {
  test('initial rendering', () => {
    const { queryByText } = render(
      <TestWrapper>
        <AddStageView {...commonProps} />
      </TestWrapper>
    )
    expect(queryByText('pipeline.addStage.title')).toBeDefined()
    expect(queryByText('Deploy Stage')).toBeDefined()
  })

  test('render when no stage are hovered', async () => {
    const { queryByText } = render(
      <TestWrapper>
        <AddStageView {...commonProps} />
      </TestWrapper>
    )
    await waitFor(() => expect(queryByText('pipeline.addStage.description')).toBeDefined())
  })

  test('Total cards rendered', () => {
    const { container } = render(
      <TestWrapper>
        <AddStageView {...commonProps} />
      </TestWrapper>
    )
    const cards = container.getElementsByClassName('cardNew')
    expect(cards.length).toBe(6)
  })

  test('Different Stage card rendered', () => {
    const { queryByText } = render(
      <TestWrapper>
        <AddStageView {...commonProps} />
      </TestWrapper>
    )
    expect(queryByText('Deploy Stage')).toBeDefined()
    expect(queryByText('Feature Flag')).toBeDefined()
    expect(queryByText('Build')).toBeDefined()
    expect(queryByText('Approval Stage')).toBeDefined()
  })

  test('when deploy stage is hovered', async () => {
    const { container, getByText, findByText } = render(
      <TestWrapper>
        <AddStageView {...commonProps} />
      </TestWrapper>
    )
    expect(getByText('Deploy')).toBeDefined()
    const deployStageCard = container.querySelector(`[data-icon="cd-main"]`)
    act(() => {
      fireEvent.mouseOver(deployStageCard as Element)
    })

    expect(container.getElementsByClassName('hoverStageSection')).toBeTruthy()
    const deployStageDescription = await waitFor(() => findByText('pipeline.pipelineSteps.deployStageDescription'))
    expect(deployStageDescription).toBeDefined()
  })

  test('when build stage is hovered', async () => {
    const { container, getByText, findByText } = render(
      <TestWrapper>
        <AddStageView {...commonProps} />
      </TestWrapper>
    )
    expect(getByText('Build')).toBeDefined()
    const buildStageCard = container.querySelector(`[data-icon="ci-main"]`)
    act(() => {
      fireEvent.mouseOver(buildStageCard as Element)
    })

    expect(container.getElementsByClassName('hoverStageSection')).toBeTruthy()
    const buildStageDescription = await waitFor(() => findByText('ci.description'))
    expect(buildStageDescription).toBeDefined()
  })

  test('when feature flag stage is hovered and unhovered', async () => {
    const { container, getByText, findByText } = render(
      <TestWrapper>
        <AddStageView {...commonProps} />
      </TestWrapper>
    )
    expect(getByText('Feature Flag')).toBeDefined()
    const featureFlagStageCard = container.querySelector(`[data-icon="cf-main"]`)
    act(() => {
      fireEvent.mouseOver(featureFlagStageCard as Element)
    })

    expect(container.getElementsByClassName('hoverStageSection')).toBeTruthy()
    const featureFlagStageDescription = await waitFor(() =>
      findByText('pipeline.pipelineSteps.featureStageDescription')
    )
    expect(featureFlagStageDescription).toBeDefined()
  })

  test('when approval stage is hovered and unhovered', async () => {
    const { container, getByText, findByText } = render(
      <TestWrapper>
        <AddStageView {...commonProps} />
      </TestWrapper>
    )
    expect(getByText('Feature Flag')).toBeDefined()
    const approvalStageCard = container.querySelector(`[data-icon="approval-stage-icon"]`)
    act(() => {
      fireEvent.mouseOver(approvalStageCard as Element)
    })

    expect(container.getElementsByClassName('hoverStageSection')).toBeTruthy()
    const approvalStageDescription = await waitFor(() => findByText('pipeline.pipelineSteps.approvalStageDescription'))
    expect(approvalStageDescription).toBeDefined()

    act(() => {
      fireEvent.mouseLeave(approvalStageCard as Element)
    })
    const emptyStageDescription = await waitFor(() => findByText('pipeline.addStage.description'))
    expect(emptyStageDescription).toBeDefined()
  })

  test('when stage in disabled state is hovered ', async () => {
    const { container, getByText, findByText } = render(
      <TestWrapper>
        <AddStageView {...commonProps} />
      </TestWrapper>
    )
    expect(getByText('Feature Flag')).toBeDefined()
    const chanedPipelineStageCard = container.querySelector(`[data-icon="chained-pipeline"]`)
    act(() => {
      fireEvent.mouseOver(chanedPipelineStageCard as Element)
    })

    expect(container.getElementsByClassName('hoverStageSection')).toBeTruthy()
    const emptyStageDescription = await waitFor(() => findByText('pipeline.addStage.description'))
    expect(emptyStageDescription).toBeDefined()
  })
})
