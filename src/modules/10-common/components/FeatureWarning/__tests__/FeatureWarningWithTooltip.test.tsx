import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import {
  FeatureWarningWithTooltip,
  FeatureWarningTooltip
} from '@common/components/FeatureWarning/FeatureWarningWithTooltip'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useFeatureModule, useFeatureRequiredPlans } from '@common/hooks/useFeatures'

jest.mock('@common/hooks/useFeatures')
const useFeatureModuleMock = useFeatureModule as jest.MockedFunction<any>
useFeatureModuleMock.mockImplementation(() => {
  return 'CI'
})

const useFeatureRequiredPlansMock = useFeatureRequiredPlans as jest.MockedFunction<any>
useFeatureRequiredPlansMock.mockImplementation(() => {
  return []
})

describe('FeatureWarning', () => {
  test('FeatureWarningWithTooltip', () => {
    const { container } = render(
      <TestWrapper path={routes.toRoleDetails({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
        <FeatureWarningWithTooltip featureName={FeatureIdentifier.MULTIPLE_PROJECTS} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('FeatureWarningTooltip', () => {
    const { container } = render(
      <TestWrapper path={routes.toRoleDetails({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
        <FeatureWarningTooltip featureName={FeatureIdentifier.MULTIPLE_PROJECTS} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('FeatureWarningTooltip should go to module plan page when moduleType is valid Module', () => {
    const { getByText, getByTestId } = render(
      <TestWrapper path={routes.toRoleDetails({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
        <FeatureWarningTooltip featureName={FeatureIdentifier.MULTIPLE_PROJECTS} />
      </TestWrapper>
    )
    fireEvent.click(getByText('common.explorePlans'))
    expect(getByTestId('location').innerHTML.includes('moduleCard=ci')).toBeTruthy()
  })

  test('FeatureWarningTooltip should go to 1st licensed module plan page when moduleType is invalid Module', () => {
    useFeatureModuleMock.mockImplementation(() => {
      return 'CORE'
    })
    const { getByText, getByTestId } = render(
      <TestWrapper path={routes.toRoleDetails({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
        <FeatureWarningTooltip featureName={FeatureIdentifier.MULTIPLE_PROJECTS} />
      </TestWrapper>
    )
    fireEvent.click(getByText('common.explorePlans'))
    expect(getByTestId('location').innerHTML.includes('moduleCard=cd')).toBeTruthy()
  })
})
