import React from 'react'
import { act, fireEvent, queryAllByAttribute, queryByAttribute, render, waitFor } from '@testing-library/react'

import { Domain } from '@pipeline/components/PipelineSteps/AdvancedSteps/FailureStrategyPanel/StrategySelection/StrategyConfig'
import { Basic } from '../FailureStrategyPanel.stories'
import { Modes } from '../../common'

describe('<FailureStrategyPanel /> tests', () => {
  test('initial render with no data', () => {
    const { container } = render(<Basic data={{ failureStrategies: [] }} mode={Modes.STEP} />)
    expect(container).toMatchSnapshot()
  })

  test('initial render with no data with CI domain', () => {
    const { container } = render(<Basic data={{ failureStrategies: [] }} mode={Modes.STEP} domain={Domain.CI} />)
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

  test('adding all error types disable Add button and prevents new strategy addition', async () => {
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
                  // 'Application',
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

  test('in stage mode of CI domain adding AnyOther and Timeout error types disable Add button and prevents new strategy addition', async () => {
    const { findByTestId } = render(
      <Basic
        data={{
          failureStrategies: [
            {},
            {
              onFailure: {
                errors: ['AnyOther', 'Timeout'],
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
        mode={Modes.STAGE}
        domain={Domain.CI}
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

  test('stage mode of CI domain can edit first error type', () => {
    const { container } = render(<Basic data={{ failureStrategies: [{}] }} mode={Modes.STAGE} domain={Domain.CI} />)

    expect(queryByAttribute('name', container, 'failureStrategies[0].onFailure.errors')).not.toBeNull()
    expect(container).toMatchSnapshot()
  })

  test('shows error for unsupported strategy', async () => {
    const { findByTestId } = render(
      <Basic data={{ failureStrategies: [{ onFailure: { action: { type: 'UNKNOWN' } } }] }} mode={Modes.STAGE} />
    )

    const panel = await findByTestId('failure-strategy-panel')
    expect(panel).toMatchSnapshot()
  })

  test('error type selection does not show already selected error types', async () => {
    const { container, findByText, findByTestId } = render(<Basic data={{ failureStrategies: [] }} mode={Modes.STEP} />)

    const getErrorTypeField = (): HTMLElement =>
      queryByAttribute('name', container, 'failureStrategies[0].onFailure.errors')!
    const menuItemSelector = '.bp3-menu-item > div'
    const authErrorTxt = 'pipeline.failureStrategies.errorTypeLabels.Authentication'

    const add = await findByTestId('add-failure-strategy')

    await act(() => {
      fireEvent.click(add)
      return Promise.resolve()
    })

    await waitFor(() => findByTestId('failure-strategy-step-0'))

    fireEvent.change(getErrorTypeField(), { target: { value: 'auth' } })

    const opt1 = await findByText(authErrorTxt, { selector: menuItemSelector })

    fireEvent.click(opt1)

    fireEvent.focus(getErrorTypeField())

    await expect(() => findByText(authErrorTxt, { selector: menuItemSelector })).rejects.toThrow()

    const code = await findByTestId('code-output')

    expect(code).toMatchInlineSnapshot(`
      <pre
        data-testid="code-output"
      >
        failureStrategies:
        - onFailure:
            errors:
              - Authentication

      </pre>
    `)
  })

  test('when AnyOther is selected, all other options are removed', async () => {
    const { container, findByText, findByTestId } = render(
      <Basic
        data={{
          failureStrategies: [
            {
              onFailure: { errors: ['Authentication', 'Authorization'] }
            }
          ]
        }}
        mode={Modes.STEP}
      />
    )

    const getErrorTypeField = (): HTMLElement =>
      queryByAttribute('name', container, 'failureStrategies[0].onFailure.errors')!
    const menuItemSelector = '.bp3-menu-item > div'

    await waitFor(() => findByTestId('failure-strategy-step-0'))

    const code1 = await findByTestId('code-output')

    expect(code1).toMatchInlineSnapshot(`
      <pre
        data-testid="code-output"
      >
        failureStrategies:
        - onFailure:
            errors:
              - Authentication
              - Authorization

      </pre>
    `)

    fireEvent.change(getErrorTypeField(), { target: { value: 'any' } })

    const opt1 = await findByText('pipeline.failureStrategies.errorTypeLabels.AnyOther', { selector: menuItemSelector })

    fireEvent.click(opt1)

    const code2 = await findByTestId('code-output')

    expect(code2).toMatchInlineSnapshot(`
      <pre
        data-testid="code-output"
      >
        failureStrategies:
        - onFailure:
            errors:
              - AnyOther

      </pre>
    `)
  })

  test('removing error type works', async () => {
    const { container, findByTestId } = render(
      <Basic
        data={{
          failureStrategies: [
            {
              onFailure: { errors: ['Authentication', 'Authorization'] }
            }
          ]
        }}
        mode={Modes.STEP}
      />
    )

    const code1 = await findByTestId('code-output')

    expect(code1).toMatchInlineSnapshot(`
      <pre
        data-testid="code-output"
      >
        failureStrategies:
        - onFailure:
            errors:
              - Authentication
              - Authorization

      </pre>
    `)
    const removeTags = queryAllByAttribute('class', container, 'bp3-tag-remove')

    fireEvent.click(removeTags[removeTags.length - 1])

    const code2 = await findByTestId('code-output')

    expect(code2).toMatchInlineSnapshot(`
      <pre
        data-testid="code-output"
      >
        failureStrategies:
        - onFailure:
            errors:
              - Authentication

      </pre>
    `)
  })
})
