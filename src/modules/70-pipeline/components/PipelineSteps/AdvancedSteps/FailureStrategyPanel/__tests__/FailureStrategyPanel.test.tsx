import React from 'react'
import { render, fireEvent, waitFor, act, queryByAttribute } from '@testing-library/react'

import { Basic } from '../FailureStrategyPanel.stories'
import { Modes } from '../../common'

describe('<FailureStratergyPanel /> tests', () => {
  test('initial render with no data', () => {
    const { container } = render(<Basic data={{ failureStrategies: [] }} mode={Modes.STEP} />)
    expect(container).toMatchSnapshot()
  })

  test('adding a new strategy works', async () => {
    const { container, findByTestId } = render(<Basic data={{ failureStrategies: [] }} mode={Modes.STEP} />)

    const add = await findByTestId('add-failure-strategy')

    await act(() => {
      fireEvent.click(add)
      return Promise.resolve()
    })

    await waitFor(() => findByTestId('failure-strategy-step-0'))

    expect(queryByAttribute('name', container, 'failureStrategies[0].onFailure.errors')).not.toBeNull()

    const panel = await findByTestId('failure-strategy-panel')
    expect(panel).toMatchSnapshot()

    const code = await findByTestId('code-output')
    expect(code).toMatchInlineSnapshot(`
      <pre
        data-testid="code-output"
      >
        failureStrategies:
        - onFailure: {}

      </pre>
    `)
  })

  test('adding all error types disable Add button and prevents new stragery addition', async () => {
    const { findByTestId } = render(
      <Basic
        data={{
          failureStrategies: [
            {
              onFailure: {
                errors: ['AnyOther'],
                action: {
                  type: 'StageRollback'
                }
              }
            },
            {
              onFailure: {
                errors: [
                  'Authentication',
                  'Authorization',
                  'Connectivity',
                  'Timeout',
                  'Verification',
                  'DelegateProvisioning'
                ],
                action: {
                  type: 'Retry',
                  spec: {
                    retryCount: 2,
                    retryIntervals: ['1d'],
                    onRetryFailure: {
                      action: {
                        type: 'MarkAsSuccess'
                      }
                    }
                  }
                }
              }
            }
          ]
        }}
        mode={Modes.STEP}
      />
    )

    const add = await findByTestId('add-failure-strategy')

    expect(add.getAttribute('class')).toContain('bp3-disabled')
  })

  test('removing a strategy works', async () => {
    const { findByTestId, getByTestId } = render(<Basic data={{ failureStrategies: [{}, {}] }} mode={Modes.STEP} />)

    const step2 = await findByTestId('failure-strategy-step-1')

    await act(() => {
      fireEvent.click(step2)
      return Promise.resolve()
    })

    const deleteBtn = await findByTestId('remove-failure-strategy')

    await act(() => {
      fireEvent.click(deleteBtn)
      return Promise.resolve()
    })

    expect(() => getByTestId('failure-strategy-step-1')).toThrow()

    const panel = await findByTestId('failure-strategy-panel')
    expect(panel).toMatchSnapshot()

    const code = await findByTestId('code-output')

    expect(code).toMatchInlineSnapshot(`
      <pre
        data-testid="code-output"
      >
        failureStrategies:
        - {}

      </pre>
    `)
  })

  test('in stage mode cannot edit first error type', () => {
    const { container } = render(<Basic data={{ failureStrategies: [{}] }} mode={Modes.STAGE} />)

    expect(queryByAttribute('name', container, 'failureStrategies[0].onFailure.errors')).toBeNull()
    expect(container).toMatchSnapshot()
  })

  test('shows error for unsupported strategy', async () => {
    const { findByTestId } = render(
      <Basic data={{ failureStrategies: [{ onFailure: { action: { type: 'UNKNOWN' } } }] }} mode={Modes.STAGE} />
    )

    const panel = await findByTestId('failure-strategy-panel')
    expect(panel).toMatchSnapshot()
  })
})
