import { fireEvent, render, RenderResult, screen, waitFor } from '@testing-library/react'
import React from 'react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as useFeaturesMock from '@common/hooks/useFeatures'
import * as usePlanEnforcementMock from '@cf/hooks/usePlanEnforcement'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import SegmentRulesEditButton, { SegmentRulesEditButtonProps } from '../SegmentRulesEditButton'

const renderComponent = (props: Partial<SegmentRulesEditButtonProps> = {}): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <SegmentRulesEditButton onEdit={jest.fn()} {...props} />
    </TestWrapper>
  )
}

describe('SegmentRulesEditButton', () => {
  beforeEach(() => {
    jest.spyOn(useFeaturesMock, 'useGetFirstDisabledFeature').mockReturnValue({ featureEnabled: true })
    jest.spyOn(usePlanEnforcementMock, 'default').mockReturnValue({ isPlanEnforcementEnabled: false })
  })

  test('it should render button correctly when options button clicked', async () => {
    renderComponent()

    expect(screen.getByText('cf.featureFlags.rules.editRules')).toBeInTheDocument()
  })

  test('it should call onEdit callback correctly when edit button option clicked', async () => {
    const onEditMock = jest.fn()

    renderComponent({ onEdit: onEditMock })

    expect(screen.getByText('cf.featureFlags.rules.editRules')).toBeInTheDocument()

    userEvent.click(screen.getByText('cf.featureFlags.rules.editRules'))

    expect(onEditMock).toBeCalled()
  })

  test('it should display plan enforcement popup when limits reached', async () => {
    jest
      .spyOn(useFeaturesMock, 'useGetFirstDisabledFeature')
      .mockReturnValue({ featureEnabled: false, disabledFeatureName: FeatureIdentifier.MAUS })

    jest.spyOn(usePlanEnforcementMock, 'default').mockReturnValue({ isPlanEnforcementEnabled: true })

    renderComponent()

    expect(screen.getByText('cf.featureFlags.rules.editRules')).toBeInTheDocument()

    fireEvent.mouseOver(screen.getByText('cf.featureFlags.rules.editRules'))

    await waitFor(() => expect(screen.getByText('common.feature.upgradeRequired.pleaseUpgrade')).toBeInTheDocument())
  })
})
