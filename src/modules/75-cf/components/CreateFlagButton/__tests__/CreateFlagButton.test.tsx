import { render, RenderResult, screen, waitFor, fireEvent } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import * as useFeaturesMock from '@common/hooks/useFeatures'
import * as usePlanEnforcementMock from '@cf/hooks/usePlanEnforcement'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'

import CreateFlagButton, { CreateFlagButtonProps } from '../CreateFlagButton'

const renderComponent = (props: Partial<CreateFlagButtonProps> = {}): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <CreateFlagButton showModal={jest.fn()} {...props} />
    </TestWrapper>
  )
}

describe('CreateFlagButton', () => {
  beforeEach(() => jest.spyOn(usePlanEnforcementMock, 'default').mockReturnValue({ isPlanEnforcementEnabled: true }))

  test('it should display plan enforcement popup when limits reached', async () => {
    jest
      .spyOn(useFeaturesMock, 'useGetFirstDisabledFeature')
      .mockReturnValue({ featureEnabled: false, disabledFeatureName: FeatureIdentifier.MAUS })

    renderComponent()

    fireEvent.mouseOver(screen.getByText('cf.featureFlags.newFlag'))

    await waitFor(() => expect(screen.getByText('common.feature.upgradeRequired.pleaseUpgrade')).toBeInTheDocument())
  })
})
