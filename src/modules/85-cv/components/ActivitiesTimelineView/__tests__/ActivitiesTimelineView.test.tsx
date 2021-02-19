import React from 'react'
import { render, fireEvent, act, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ActivitiesTimelineView, { MockedActivitiesTimelineView, ActivitiesFlagBorder } from '../ActivitiesTimelineView'

jest.mock('moment', () => {
  const original = jest.requireActual('moment')
  original().__proto__.format = () => 'XX:YY'
  return original
})

describe('ActivitiesTimelineView', () => {
  beforeAll(() => {
    jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => ({
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      height: 10,
      width: 300,
      x: 0,
      y: 0,
      toJSON: jest.fn()
    }))
  })
  afterAll(() => {
    jest.resetAllMocks()
  })
  test('matches snapshot', () => {
    const { container } = render(
      <TestWrapper>
        <MockedActivitiesTimelineView />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('renders batch correctly, and can zoom-in', () => {
    const { container } = render(
      <TestWrapper>
        <ActivitiesTimelineView
          startTime={1602590400000}
          endTime={1602604800000}
          canSelect
          deployments={[
            { startTime: 1602592200000, name: 'DB Integration 1001', verificationResult: 'VERIFICATION_PASSED' },
            { startTime: 1602592200000, name: 'DB Integration 1002', verificationResult: 'VERIFICATION_FAILED' }
          ]}
        />
      </TestWrapper>
    )
    expect(container.querySelector('.eventBatch')).toBeDefined()
    const oldBarLabelsCount = container.querySelector('.timelineBar')?.children.length
    act(() => {
      fireEvent.click(container.querySelector('.eventBatch .itemsGroup')!)
    })
    expect(container.querySelector('.timelineBar')?.children.length).toEqual(oldBarLabelsCount)
  })

  test('can select activity', () => {
    const { container } = render(
      <TestWrapper>
        <ActivitiesTimelineView
          startTime={1602590400000}
          endTime={1602604800000}
          canSelect
          deployments={[
            { startTime: 1602592200000, name: 'DB Integration 1001', verificationResult: 'VERIFICATION_PASSED' }
          ]}
        />
      </TestWrapper>
    )
    act(() => {
      fireEvent.click(container.querySelector('.eventItem svg')!)
    })
    expect(container.querySelector('.timeline-flag-target')).toBeDefined()
  })

  test('ActivitiesFlagBorder matches snapshot', () => {
    const { container } = render(<ActivitiesFlagBorder />)
    expect(container).toMatchSnapshot()
  })

  test('Ensure correct icons are rendered when each event type stacking is done', async () => {
    const { container } = render(
      <TestWrapper>
        <ActivitiesTimelineView
          startTime={1602590400000}
          endTime={1602604800000}
          canSelect
          deployments={[
            { startTime: 1602592200000, name: 'DB Integration 1001', verificationResult: 'VERIFICATION_PASSED' },
            { startTime: 1602592200000, name: 'DB Integration 1001', verificationResult: 'VERIFICATION_FAILED' },
            { startTime: 1602592200000, name: 'DB Integration 1001', verificationResult: 'NOT_STARTED' },
            { startTime: 1602592200000, name: 'DB Integration 1001', verificationResult: 'VERIFICATION_FAILED' }
          ]}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(container.querySelector('.eventBatch')).not.toBeNull()
    const svgPaths = container.querySelector('.eventBatch')?.querySelectorAll('path') || []
    expect(svgPaths.length).toBe(3)
    expect(svgPaths[0]?.getAttribute('stroke')).toEqual('#F45858')
    expect(svgPaths[1]?.getAttribute('stroke')).toEqual('#86DD29')
    expect(svgPaths[2]?.getAttribute('stroke')).toEqual('var(--blue-500)')
  })

  test('Ensure correct icons are rendered when two event types stacking is done', async () => {
    const { container } = render(
      <TestWrapper>
        <ActivitiesTimelineView
          startTime={1602590400000}
          endTime={1602604800000}
          canSelect
          deployments={[
            { startTime: 1602592200000, name: 'DB Integration 1001', verificationResult: 'VERIFICATION_PASSED' },
            { startTime: 1602592200000, name: 'DB Integration 1001', verificationResult: 'VERIFICATION_FAILED' },
            { startTime: 1602592200000, name: 'DB Integration 1001', verificationResult: 'VERIFICATION_PASSED' },
            { startTime: 1602592200000, name: 'DB Integration 1001', verificationResult: 'VERIFICATION_FAILED' }
          ]}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(container.querySelector('.eventBatch')).not.toBeNull()
    const svgPaths = container.querySelector('.eventBatch')?.querySelectorAll('path') || []
    expect(svgPaths.length).toBe(3)
    expect(svgPaths[0]?.getAttribute('stroke')).toEqual('#F45858')
    expect(svgPaths[1]?.getAttribute('stroke')).toEqual('#86DD29')
    expect(svgPaths[2]?.getAttribute('stroke')).toEqual('#F45858')
  })

  test('Ensure correct icons are rendered when only 1 event types stacking is done', async () => {
    const { container } = render(
      <TestWrapper>
        <ActivitiesTimelineView
          startTime={1602590400000}
          endTime={1602604800000}
          canSelect
          deployments={[
            { startTime: 1602592200000, name: 'DB Integration 1001', verificationResult: 'VERIFICATION_PASSED' },
            { startTime: 1602592200000, name: 'DB Integration 1001', verificationResult: 'VERIFICATION_PASSED' },
            { startTime: 1602592200000, name: 'DB Integration 1001', verificationResult: 'VERIFICATION_PASSED' },
            { startTime: 1602592200000, name: 'DB Integration 1001', verificationResult: 'VERIFICATION_PASSED' }
          ]}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(container.querySelector('.eventBatch')).not.toBeNull()
    const svgPaths = container.querySelector('.eventBatch')?.querySelectorAll('path') || []
    expect(svgPaths.length).toBe(3)
    expect(svgPaths[0]?.getAttribute('stroke')).toEqual('#86DD29')
    expect(svgPaths[1]?.getAttribute('stroke')).toEqual('#86DD29')
    expect(svgPaths[2]?.getAttribute('stroke')).toEqual('#86DD29')
  })
})
