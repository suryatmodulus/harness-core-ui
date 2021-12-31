import React from 'react'
import { render, RenderResult } from '@testing-library/react'
import { cloneDeep } from 'lodash-es'

import { TestWrapper } from '@common/utils/testUtils'

import mockGitSync from '@cf/utils/testData/data/mockGitSync'
import mockTarget from '@cf/utils/testData/data/mockTarget'
import mockFeature from '@cf/utils/testData/data/mockFeature'
import * as cfServices from 'services/cf'

import { FlagSettings } from '../FlagSettings'

jest.mock('@cf/hooks/useEnvironmentSelectV2', () => ({
  useEnvironmentSelectV2: jest.fn().mockReturnValue({ data: [], loading: false })
}))

const renderComponent = (): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <FlagSettings gitSync={mockGitSync} target={mockTarget} />
    </TestWrapper>
  )
}

describe('FlagSettings', () => {
  const useGetAllFeaturesMock = jest.spyOn(cfServices, 'useGetAllFeatures')
  jest.spyOn(cfServices, 'usePatchFeature').mockReturnValue({ mutate: jest.fn(), loading: false, data: [] } as any)

  beforeEach(() => {
    useGetAllFeaturesMock.mockReturnValue({
      data: { features: [mockFeature] },
      loading: false,
      refetch: jest.fn()
    } as any)
  })

  test('it should render correctly', async () => {
    const { container } = renderComponent()

    expect(container).toMatchSnapshot()
  })

  test('it should disable variation drop downs when the flag is disabled', async () => {
    const disabledFeature1 = cloneDeep(mockFeature)
    disabledFeature1.identifier = 'disabled_feature_1'
    ;(disabledFeature1.envProperties as any).state = 'off'

    const disabledFeature2 = cloneDeep(disabledFeature1)
    disabledFeature2.identifier = 'disabled_feature_2'

    useGetAllFeaturesMock.mockReturnValue({
      data: { features: [mockFeature, disabledFeature1, disabledFeature2] },
      loading: false,
      refetch: jest.fn()
    } as any)

    renderComponent()

    const inputs = [...document.querySelectorAll('[data-testid^="variation_select"] input')] as HTMLInputElement[]

    expect(inputs).toHaveLength(3)
    expect(inputs.filter(({ disabled }) => !disabled)).toHaveLength(1)
    expect(inputs.filter(({ disabled }) => disabled)).toHaveLength(2)
  })
})
