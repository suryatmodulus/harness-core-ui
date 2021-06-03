import React from 'react'
import { act } from 'react-dom/test-utils'
import { render, fireEvent } from '@testing-library/react'
import * as portalServices from 'services/portal'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import * as featureFlags from '@common/hooks/useFeatureFlag'
import DelegateSelectorStep from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import {
  defaultProps,
  connectorInfo,
  connectorInfoCredentials,
  mockedDelegates,
  requestBody,
  gitConfigs,
  sourceCodeManagers
} from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/__tests__/DelegateSelector.mock'
import type { ConnectorRequestBody } from 'services/cd-ng'
import { GitSyncTestWrapper } from '@common/utils/gitSyncTestUtils'

jest.spyOn(portalServices, 'useGetDelegateSelectors').mockImplementation(
  () =>
    ({
      loading: false,
      mutate: () => ({
        data: { metaData: {}, resource: ['delegate-selector-sample', 'primary'], responseMessages: [] }
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

const fetchBranches = jest.fn(() => Promise.resolve([]))
jest.mock('services/cd-ng', () => ({
  useCreateConnector: jest.fn().mockImplementation(() => ({
    mutate: () =>
      Promise.resolve({
        data: { name: 'NewConnectorCreated' }
      })
  })),
  useUpdateConnector: jest.fn().mockImplementation(() => ({
    mutate: () =>
      Promise.resolve({
        data: { name: 'ConnectorBeingUpdated' }
      })
  })),
  useCreatePR: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetFileContent: jest.fn().mockImplementation(() => ({ refetch: jest.fn() })),
  useGetListOfBranchesWithStatus: jest.fn().mockImplementation(() => fetchBranches()),
  useListGitSync: jest.fn().mockImplementation(() => gitConfigs),
  useGetSourceCodeManagers: jest.fn().mockImplementation(() => {
    return { data: sourceCodeManagers, refetch: jest.fn() }
  })
}))

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
          prevStepData={connectorInfo}
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
          prevStepData={connectorInfo}
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
    expect(rows[0]?.childElementCount).toBe(4)
  })

  test('should not show matches column if choose any delegate option is selected', async () => {
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
        <DelegateSelectorStep {...defaultProps} buildPayload={jest.fn()} />
      </TestWrapper>
    )
    const headerRow = container.querySelector('[data-name="delegateContentContainer"] div[role="row"]')
    expect(headerRow?.childElementCount).toBe(3)
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
          prevStepData={connectorInfo}
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
          prevStepData={connectorInfo}
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

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('should call buildPayload with correct data', async () => {
    const buildPayload = jest.fn()
    const { container } = render(
      <TestWrapper>
        <DelegateSelectorStep
          {...defaultProps}
          connectorInfo={connectorInfoCredentials}
          prevStepData={connectorInfoCredentials}
          buildPayload={buildPayload}
        />
      </TestWrapper>
    )
    expect(buildPayload).not.toBeCalled()
    await act(async () => {
      fireEvent.click(container.querySelector('[data-name="delegateSaveAndContinue"]')!)
    })
    expect(buildPayload).toBeCalledWith({
      ...connectorInfoCredentials,
      delegateSelectors: connectorInfoCredentials.spec.delegateSelectors
    })
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('should call buildPayload with no selectors if create via any delegate option is chosen', async () => {
    const buildPayload = jest.fn()
    const { container } = render(
      <TestWrapper>
        <DelegateSelectorStep
          {...defaultProps}
          connectorInfo={connectorInfoCredentials}
          prevStepData={connectorInfoCredentials}
          buildPayload={buildPayload}
        />
      </TestWrapper>
    )
    await act(async () => {
      fireEvent.click(container.querySelector('input[value="DelegateOptions.DelegateOptionsAny"]')!)
    })
    expect(buildPayload).not.toBeCalled()
    await act(async () => {
      fireEvent.click(container.querySelector('[data-name="delegateSaveAndContinue"]')!)
    })
    expect(buildPayload).toBeCalledWith({ ...connectorInfoCredentials, delegateSelectors: [] })
  })

  test('should open Git Sync modal on clicking Save and Continue', async () => {
    jest.spyOn(featureFlags, 'useFeatureFlags').mockImplementation(() => ({
      CDNG_ENABLED: true,
      NG_SHOW_DELEGATE: true,
      GIT_SYNC_NG: true
    }))
    const { container } = render(
      <GitSyncTestWrapper>
        <DelegateSelectorStep
          {...defaultProps}
          connectorInfo={connectorInfoCredentials}
          prevStepData={connectorInfoCredentials}
          buildPayload={() => requestBody as ConnectorRequestBody}
        />
      </GitSyncTestWrapper>
    )
    await act(async () => {
      fireEvent.click(container.querySelector('[data-name="delegateSaveAndContinue"]')!)
    })
    const form = findDialogContainer()
    expect(form).toBeTruthy()
    await act(async () => {
      expect(findDialogContainer()).toMatchSnapshot('Save Connectors to Git')
    })
  })
})
