import React from 'react'
import { render, fireEvent, act, queryByAttribute } from '@testing-library/react'

import { Strategy } from '@pipeline/utils/FailureStrategyUtils'
import { StepMode as Modes } from '@pipeline/utils/stepUtils'
import { testIds } from '../StrategySelection/StrategyConfig'
import { Basic } from '../FailureStrategyPanel.stories'

describe('Failure Strategy: ManualIntervention', () => {
  test('strategy works with simple fallback', async () => {
    const { container, findByTestId } = render(
      <Basic data={{ failureStrategies: [{ onFailure: { errors: [], action: {} as any } }] }} mode={Modes.STEP} />
    )

    const selection = await findByTestId(testIds.ManualIntervention)

    await act(() => {
      fireEvent.click(selection)
      return Promise.resolve()
    })

    fireEvent.change(queryByAttribute('name', container, 'failureStrategies[0].onFailure.action.spec.timeout')!, {
      target: {
        value: '1d'
      }
    })

    const selection2 = await findByTestId(testIds.Abort)

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
            errors: []
            action:
              type: ManualIntervention
              spec:
                timeout: 1d
                onTimeout:
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
            {
              onFailure: {
                errors: [],
                action: { type: Strategy.ManualIntervention, spec: { onTimeout: {}, timeout: '1d' } }
              }
            }
          ]
        }}
        mode={Modes.STEP_GROUP}
      />
    )

    const selection = await findByTestId(testIds.ManualIntervention)

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
            errors: []
            action: {}

      </pre>
    `)
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('"ManualIntervention" is not shown in "Retry" fallback step', async () => {
    const { findByTestId, findAllByTestId } = render(
      <Basic data={{ failureStrategies: [{ onFailure: { errors: [], action: {} as any } }] }} mode={Modes.STEP} />
    )

    const selection = await findByTestId(testIds.ManualIntervention)

    await act(() => {
      fireEvent.click(selection)
      return Promise.resolve()
    })

    const selection2 = await findByTestId(testIds.Retry)

    await act(() => {
      fireEvent.click(selection2)
      return Promise.resolve()
    })

    const selection3 = await findAllByTestId(testIds.ManualIntervention)

    expect(selection3.length).toBe(1)
  })
})
