import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { MetricAnalysisFilterType, MetricAnalysisFilter } from '../MetricAnalysisFilter'

describe('Unit tests for MetricAnalysisFilter', () => {
  test('Ensure onchange is invoked when option is updated', async () => {
    const onChangeMock = jest.fn()
    const { container } = render(
      <TestWrapper>
        <MetricAnalysisFilter onChangeFilter={onChangeMock} />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())

    // press chevron icoon and select all metrics option
    const icon = container.querySelector('[class*="bp3-input-action"] [data-icon="chevron-down"]')
    if (!icon) {
      throw Error('Drop down was not rendered.')
    }

    fireEvent.click(icon)
    await waitFor(() => expect(document.body.querySelector('[class*="menuItemLabel"]')).not.toBeNull())
    const options = document.querySelectorAll('[class*="menuItemLabel"]')
    fireEvent.click(options[1])
    await waitFor(() => expect(onChangeMock).toHaveBeenCalledWith(MetricAnalysisFilterType.ALL_METRICS))
  })

  test('Ensure that default value is rendered', async () => {
    const { container } = render(
      <TestWrapper>
        <MetricAnalysisFilter
          onChangeFilter={jest.fn()}
          defaultFilterValue={{ label: 'Anomalous metrics', value: MetricAnalysisFilterType.ALL_METRICS }}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    await waitFor(() => expect(container.querySelector(`input[value="Anomalous metrics"]`)).not.toBeNull())
  })
})
