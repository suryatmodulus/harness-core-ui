import React from 'react'
import { act } from 'react-dom/test-utils'
import { render, fireEvent } from '@testing-library/react'
import * as portalServices from 'services/portal'
import { TestWrapper } from '@common/utils/testUtils'
import * as featureFlags from '@common/hooks/useFeatureFlag'
import DelegateSelectorStep from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import {
  defaultProps,
  connectorInfo,
  prevStepData,
  mockedDelegates
} from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/__tests__/DelegateSelector.mock'

jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => () => <></>)

jest.spyOn(portalServices, 'useGetDelegateSelectors').mockImplementation(
  () =>
    ({
      loading: false,
      mutate: () => ({
        data: { metaData: {}, resource: ['jasmeet-saini-mbp', 'primary'], responseMessages: [] }
      })
    } as any)
)

jest.spyOn(portalServices, 'useGetDelegatesStatusV2').mockImplementation(
  () =>
    ({
      loading: false,
      error: undefined,
      mutate: () => ({
        data: []
      })
    } as any)
)

jest.spyOn(featureFlags, 'useFeatureFlags').mockImplementation(() => ({
  CDNG_ENABLED: false,
  NG_SHOW_DELEGATE: false
}))

describe('DelegateSelectorStep', () => {
  test('should render DelegateSelectorStep component', async () => {
    const { container } = render(
      <TestWrapper>
        <DelegateSelectorStep {...defaultProps} buildPayload={jest.fn()} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    expect(container.querySelector('[value="DelegateOptions.DelegateOptionsAny"]')?.getAttribute('disabled')).toBe(null)
    expect(container.querySelectorAll('[data-name="DelegateSelectors"] [data-tag-index]').length).toBe(0)
    expect(container.querySelector('[data-name="installNewDelegateButton"]')).toBeFalsy()
  })

  test('should confirm that install new delegate button is visible if feature flags are present', async () => {
    jest.spyOn(featureFlags, 'useFeatureFlags').mockImplementation(() => ({
      CDNG_ENABLED: true,
      NG_SHOW_DELEGATE: true
    }))
    const { container } = render(
      <TestWrapper>
        <DelegateSelectorStep {...defaultProps} buildPayload={jest.fn()} />
      </TestWrapper>
    )
    expect(container.querySelector('[data-name="installNewDelegateButton"]')).toBeTruthy()
  })

  test('should confirm that empty state is visible in table if no delegates are present', async () => {
    const { container } = render(
      <TestWrapper>
        <DelegateSelectorStep {...defaultProps} buildPayload={jest.fn()} />
      </TestWrapper>
    )
    expect(container.querySelector('[data-name="delegateTableEmptyState"]')).toBeTruthy()
    expect(container.querySelector('[data-name="delegateTableLoadingState"]')).toBeFalsy()
    expect(container.querySelector('[data-name="delegateContentContainer"] span[icon="error"]')).toBeFalsy()
  })

  test('should confirm that error state is visible in table', async () => {
    const refetch = jest.fn()
    jest.spyOn(portalServices, 'useGetDelegatesStatusV2').mockImplementation(
      () =>
        ({
          loading: false,
          error: {},
          refetch,
          mutate: () => ({
            data: []
          })
        } as any)
    )
    const { container } = render(
      <TestWrapper>
        <DelegateSelectorStep {...defaultProps} buildPayload={jest.fn()} />
      </TestWrapper>
    )

    expect(container.querySelector('[data-name="delegateContentContainer"] span[icon="error"]')).toBeTruthy()
    expect(container.querySelector('[data-name="delegateTableEmptyState"]')).toBeFalsy()
    expect(container.querySelector('[data-name="delegateTableLoadingState"]')).toBeFalsy()
    expect(refetch).not.toBeCalled()
    await act(async () => {
      fireEvent.click(container.querySelector('[data-name="delegateContentContainer"] button')!)
    })
    expect(refetch).toBeCalledTimes(1)
  })

  test('should confirm that loading state is visible in table while the data fetching is in process', async () => {
    jest.spyOn(portalServices, 'useGetDelegatesStatusV2').mockImplementation(
      () =>
        ({
          loading: true,
          error: undefined,
          mutate: () => ({
            data: []
          })
        } as any)
    )
    const { container } = render(
      <TestWrapper>
        <DelegateSelectorStep {...defaultProps} buildPayload={jest.fn()} />
      </TestWrapper>
    )
    expect(container.querySelector('[data-name="delegateTableLoadingState"]')).toBeTruthy()
    expect(container.querySelector('[data-name="delegateTableEmptyState"]')).toBeFalsy()
    expect(container.querySelector('[data-name="delegateContentContainer"] span[icon="error"]')).toBeFalsy()
  })

  test('should have connect via any delegate as disabled if inherit from delegate is selected', async () => {
    const { container } = render(
      <TestWrapper>
        <DelegateSelectorStep
          {...defaultProps}
          prevStepData={prevStepData}
          connectorInfo={connectorInfo}
          buildPayload={jest.fn()}
        />
      </TestWrapper>
    )
    const tags = container.querySelectorAll('[data-name="DelegateSelectors"] [data-tag-index]')
    expect(container.querySelector('[value="DelegateOptions.DelegateOptionsAny"]')?.getAttribute('disabled')).toBe('')
    expect(tags.length).toBe(1)
    expect(tags[0].firstElementChild?.textContent).toEqual('primary')
  })

  test('should have two rows in delegate table and should show checked for both rows', async () => {
    jest.spyOn(portalServices, 'useGetDelegatesStatusV2').mockImplementation(
      () =>
        ({
          loading: false,
          error: undefined,
          data: mockedDelegates
        } as any)
    )
    const { container } = render(
      <TestWrapper>
        <DelegateSelectorStep
          {...defaultProps}
          connectorInfo={connectorInfo}
          prevStepData={prevStepData}
          buildPayload={jest.fn()}
        />
      </TestWrapper>
    )
    const rows = container.querySelectorAll('[data-name="delegateContentContainer"] div[role="row"]')
    expect(rows.length).toBe(3) // 2 data rows and 1 header row
    expect(rows[1].querySelector('[data-icon="tick"]')).toBeTruthy()
    expect(rows[2].querySelector('[data-icon="tick"]')).toBeTruthy()
    expect(container.querySelector('[data-name="delegateMatchingText"]')?.textContent).toEqual(
      '2/2 connectors.delegate.matchingDelegates'
    )
    expect(container.querySelector('[data-name="delegateNoMatchWarning"]')).toBeFalsy()
  })

  test('should show checked for only one row', async () => {
    const { container } = render(
      <TestWrapper>
        <DelegateSelectorStep
          {...defaultProps}
          connectorInfo={{
            ...connectorInfo,
            spec: {
              ...connectorInfo.spec,
              delegateSelectors: ['delegate-sample-name-1']
            }
          }}
          prevStepData={prevStepData}
          buildPayload={jest.fn()}
        />
      </TestWrapper>
    )
    const rows = container.querySelectorAll('[data-name="delegateContentContainer"] div[role="row"]')
    expect(rows[1].querySelector('[data-icon="tick"]')).toBeTruthy()
    expect(rows[2].querySelector('[data-icon="tick"]')).toBeFalsy()
    expect(container.querySelector('[data-name="delegateMatchingText"]')?.textContent).toEqual(
      '1/2 connectors.delegate.matchingDelegates'
    )
    expect(container.querySelector('[data-name="delegateNoMatchWarning"]')).toBeFalsy()
  })

  test('should disable save and continue button if no delegate selectors are added in selective delegate selectors option', async () => {
    const { container } = render(
      <TestWrapper>
        <DelegateSelectorStep {...defaultProps} buildPayload={jest.fn()} />
      </TestWrapper>
    )
    const getSaveAndContinueButton = () => container.querySelector('[data-name="delegateSaveAndContinue"]')
    expect(getSaveAndContinueButton()?.getAttribute('disabled')).toBe(null)
    await act(async () => {
      fireEvent.click(container.querySelector('input[value="DelegateOptions.DelegateOptionsSelective"]')!)
    })
    expect(getSaveAndContinueButton()?.getAttribute('disabled')).toBe('')
  })

  test('should show warning message and no check icon should be visible', async () => {
    const { container } = render(
      <TestWrapper>
        <DelegateSelectorStep
          {...defaultProps}
          connectorInfo={{
            ...connectorInfo,
            spec: {
              ...connectorInfo.spec,
              delegateSelectors: ['delegate-sample-name-3']
            }
          }}
          prevStepData={prevStepData}
          buildPayload={jest.fn()}
        />
      </TestWrapper>
    )
    expect(
      container.querySelector('[data-name="delegateContentContainer"] div[role="row"] [data-icon="tick"]')
    ).toBeFalsy()
    expect(container.querySelector('[data-name="delegateMatchingText"]')?.textContent).toEqual(
      '0/2 connectors.delegate.matchingDelegates'
    )
    expect(container.querySelector('[data-name="delegateNoMatchWarning"]')).toBeTruthy()
  })
})
