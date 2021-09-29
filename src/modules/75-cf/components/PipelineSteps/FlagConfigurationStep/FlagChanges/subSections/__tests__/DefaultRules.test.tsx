import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik } from '@wings-software/uicore'
import type { Variation } from 'services/cf'
import { TestWrapper } from '@common/utils/testUtils'
import DefaultRules, { DefaultRulesProps } from '../DefaultRules'

const mockVariations: Variation[] = [
  { identifier: 'TEST_1_ID', name: 'TEST 1 NAME', value: 'TEST_1_VALUE', description: 'TEST 1 DESCRIPTION' },
  { identifier: 'TEST_2_ID', value: 'TEST_2_VALUE', description: 'TEST 2 DESCRIPTION' },
  { identifier: 'TEST_3_ID', name: 'TEST 3 NAME', value: 'TEST_3_VALUE', description: 'TEST 3 DESCRIPTION' }
]

const renderComponent = (props: Partial<DefaultRulesProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <Formik formName="test" onSubmit={jest.fn()} initialValues={{}}>
        <DefaultRules subSectionSelector={<span />} clearField={jest.fn()} variations={mockVariations} {...props} />
      </Formik>
    </TestWrapper>
  )

describe('DefaultRules', () => {
  describe.each(['On', 'Off'])('%s default variation', (defaultRuleType: string) => {
    test(`it should display a select box for the ${defaultRuleType} default variation`, async () => {
      const { container } = renderComponent()

      expect(screen.getByText(`cf.pipeline.flagConfiguration.whenTheFlagIs${defaultRuleType}Serve`)).toBeInTheDocument()

      expect(container.querySelector(`[name="spec.defaultRules.${defaultRuleType.toLowerCase()}"]`)).toBeInTheDocument()
    })

    test(`it should fill the select with the available variations for the ${defaultRuleType} default variation `, async () => {
      const { container } = renderComponent()

      const select = container
        .querySelector(`[name="spec.defaultRules.${defaultRuleType.toLowerCase()}"]`)
        ?.closest('.bp3-input')
      expect(select).toBeInTheDocument()

      mockVariations.forEach(({ name, identifier }) => {
        expect(screen.queryByText(name || identifier)).not.toBeInTheDocument()
      })

      userEvent.click(select as HTMLElement)
      await waitFor(() => {
        mockVariations.forEach(({ name, identifier }) => {
          expect(screen.getByText(name || identifier)).toBeInTheDocument()
        })
      })
    })
  })

  test('it should call the clearField function with spec.defaultRules.on and spec.defaultRules.off when unmounted', async () => {
    const clearField = jest.fn()
    const { unmount } = renderComponent({ clearField })

    expect(clearField).not.toHaveBeenCalled()

    unmount()
    await waitFor(() => {
      expect(clearField).toHaveBeenCalledWith('spec.defaultRules.on')
      expect(clearField).toHaveBeenCalledWith('spec.defaultRules.off')
    })
  })
})
