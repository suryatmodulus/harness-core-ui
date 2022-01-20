import { fireEvent, render, RenderResult, screen, waitFor } from '@testing-library/react'
import React from 'react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as useFeaturesMock from '@common/hooks/useFeatures'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import * as usePlanEnforcementMock from '@cf/hooks/usePlanEnforcement'
import AddToFlagButton, { AddToFlagButtonProps } from '../AddToFlagButton'

const renderComponent = (props: Partial<AddToFlagButtonProps> = {}): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <AddToFlagButton handleClick={jest.fn()} text="+ Add to Flag" {...props} />
    </TestWrapper>
  )
}

describe('AddToFlagButton', () => {
  beforeEach(() => {
    jest.spyOn(usePlanEnforcementMock, 'default').mockReturnValue({ isPlanEnforcementEnabled: false, isFreePlan: true })
    jest.spyOn(useFeaturesMock, 'useGetFirstDisabledFeature').mockReturnValue({ featureEnabled: true })
  })

  test('it should render menu correctly when options button clicked', async () => {
    renderComponent()

    expect(screen.getByText('+ Add to Flag')).toBeInTheDocument()
  })

  test('it call onClick callback correctly when button clicked', async () => {
    const handleClickMock = jest.fn()

    renderComponent({ handleClick: handleClickMock })

    expect(screen.getByText('+ Add to Flag')).toBeInTheDocument()
    userEvent.click(screen.getByText('+ Add to Flag'))

    expect(handleClickMock).toBeCalled()
  })

  test('it should display plan enforcement popup when limits reached', async () => {
    jest
      .spyOn(useFeaturesMock, 'useGetFirstDisabledFeature')
      .mockReturnValue({ featureEnabled: false, disabledFeatureName: FeatureIdentifier.MAUS })

    jest.spyOn(usePlanEnforcementMock, 'default').mockReturnValue({ isPlanEnforcementEnabled: true, isFreePlan: true })

    renderComponent()

    expect(screen.getByText('+ Add to Flag')).toBeInTheDocument()
    fireEvent.mouseOver(screen.getByText('+ Add to Flag'))

    await waitFor(() => expect(screen.getByText('common.feature.upgradeRequired.pleaseUpgrade')).toBeInTheDocument())
  })
})
