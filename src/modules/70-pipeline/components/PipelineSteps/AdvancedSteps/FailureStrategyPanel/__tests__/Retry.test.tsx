import React from 'react'
import { render, fireEvent, act, queryByAttribute } from '@testing-library/react'

import { testIds, Strategy } from '../StrategySelection/StrategyConfig'
import { Basic } from '../FailureStrategyPanel.stories'
import { Modes } from '../../common'

describe('Failure Strategy: Retry', () => {
  test('strategy works with simple fallback', async () => {
    const { container, findByTestId } = render(<Basic data={{ failureStrategies: [{}] }} mode={Modes.STEP} />)

    const selection = await findByTestId(testIds.Retry)

    await act(() => {
      fireEvent.click(selection)
      return Promise.resolve()
    })

    act(() => {
      fireEvent.change(queryByAttribute('name', container, 'failureStrategies[0].onFailure.action.spec.retryCount')!, {
        target: {
          value: '3'
        }
      })
    })

    const addRetryInterval1 = await findByTestId('add-retry-interval')

    act(() => {
      fireEvent.click(addRetryInterval1)
    })

    const addRetryInterval2 = await findByTestId('add-retry-interval')
    act(() => {
      fireEvent.click(addRetryInterval2)
    })

    act(() => {
      fireEvent.change(
        queryByAttribute('name', container, 'failureStrategies[0].onFailure.action.spec.retryIntervals[0]')!,
        {
          target: {
            value: '1m'
          }
        }
      )
    })

    const removeRetryInterval = await findByTestId('remove-retry-interval-1')

    act(() => {
      fireEvent.click(removeRetryInterval)
    })

    const selection2 = await findByTestId(`failure-strategy-abort`)

    fireEvent.click(selection2)

    const panel = await findByTestId('failure-strategy-panel')
    expect(panel).toMatchSnapshot()

    const code = await findByTestId('code-output')

    expect(code).toMatchInlineSnapshot(`
        <pre
          data-testid="code-output"
        >
          failureStrategies:
          - onFailure:
              action:
                type: Retry
                spec:
                  retryCount: 3
                  retryIntervals:
                    - 1m
                  onRetryFailure:
                    action:
                      type: Abort

        </pre>
      `)
  })

  test('deselection works', async () => {
    const { findByTestId } = render(
      <Basic
        data={{
          failureStrategies: [
            { onFailure: { action: { type: Strategy.Retry, spec: { retryCount: 3, retryIntervals: ['1m', '2m'] } } } }
          ]
        }}
        mode={Modes.STEP_GROUP}
      />
    )

    const selection = await findByTestId(testIds.Retry)

    await act(() => {
      fireEvent.click(selection)
      return Promise.resolve()
    })

    const code = await findByTestId('code-output')

    expect(code).toMatchInlineSnapshot(`
      <pre
        data-testid="code-output"
      >
        failureStrategies:
        - onFailure:
            action: {}

      </pre>
    `)
  })

  test('deselection works', async () => {
    const { findByTestId } = render(
      <Basic data={{ failureStrategies: [{ onFailure: { action: { type: 'Retry' } } }] }} mode={Modes.STEP_GROUP} />
    )

    const selection = await findByTestId(testIds.Retry)

    await act(() => {
      fireEvent.click(selection)
      return Promise.resolve()
    })

    const code = await findByTestId('code-output')

    expect(code).toMatchInlineSnapshot(`
      <pre
        data-testid="code-output"
      >
        failureStrategies:
        - onFailure:
            action: {}

      </pre>
    `)
  })

  test('"Retry" is not shown in "ManualIntervention" fallback step', async () => {
    const { findByTestId, findAllByTestId } = render(<Basic data={{ failureStrategies: [{}] }} mode={Modes.STEP} />)

    const selection = await findByTestId(testIds.Retry)

    await act(() => {
      fireEvent.click(selection)
      return Promise.resolve()
    })

    const selection2 = await findByTestId(testIds.ManualIntervention)

    await act(() => {
      fireEvent.click(selection2)
      return Promise.resolve()
    })

    const selection3 = await findAllByTestId(testIds.Retry)

    expect(selection3.length).toBe(1)
  })
})
