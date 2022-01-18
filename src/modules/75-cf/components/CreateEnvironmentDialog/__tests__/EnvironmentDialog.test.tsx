import { render, RenderResult, screen, waitFor, fireEvent } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import * as useFeaturesMock from '@common/hooks/useFeatures'
import * as usePlanEnforcementMock from '@cf/hooks/usePlanEnforcement'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'

import EnvironmentDialog, { EnvironmentDialogProps } from '../EnvironmentDialog'

const renderComponent = (props: Partial<EnvironmentDialogProps> = {}): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <EnvironmentDialog onCreate={jest.fn()} {...props} />
    </TestWrapper>
  )
}

describe('CreateEnvironmentButton', () => {
  beforeEach(() => jest.spyOn(usePlanEnforcementMock, 'default').mockReturnValue({ isPlanEnforcementEnabled: true }))

  test('it should display plan enforcement tooltip when limits reached', async () => {
    jest
      .spyOn(useFeaturesMock, 'useGetFirstDisabledFeature')
      .mockReturnValue({ featureEnabled: false, disabledFeatureName: FeatureIdentifier.MAUS })

    renderComponent()

    fireEvent.mouseOver(screen.getByText('+ environment'))

    await waitFor(() => expect(screen.getByText('common.feature.upgradeRequired.pleaseUpgrade')).toBeInTheDocument())
  })

  test('it should hide tooltip and render button when plan enforcement disabled and feature disabled', async () => {
    jest.spyOn(usePlanEnforcementMock, 'default').mockReturnValue({ isPlanEnforcementEnabled: false })
    jest.spyOn(useFeaturesMock, 'useFeature').mockReturnValue({ enabled: false })

    renderComponent()

    fireEvent.mouseOver(screen.getByText('+ environment'))

    await waitFor(() =>
      expect(screen.queryByText('common.feature.upgradeRequired.pleaseUpgrade')).not.toBeInTheDocument()
    )
    await waitFor(() => expect(screen.getByTestId('create-environment-button')).not.toBeDisabled())
  })
})
