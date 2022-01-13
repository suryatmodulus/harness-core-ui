import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import TargetGroupCriteria, {
  TargetGroupCriteriaProps
} from '@cf/pages/target-group-detail/components/TargetGroupCriteria'

const mockTargetGroup = {
  createdAt: 1641567852496,
  environment: 'dev',
  excluded: [
    {
      account: '',
      environment: '',
      identifier: 't499',
      name: 'Target 499 of 1000',
      org: '',
      project: ''
    },
    {
      account: '',
      environment: '',
      identifier: 't507',
      name: 'Target 507 of 1000',
      org: '',
      project: ''
    }
  ],
  identifier: 'Target_Group_with_Specific_Targets',
  included: [
    {
      account: '',
      environment: '',
      identifier: 't501',
      name: 'Target 501 of 1000',
      org: '',
      project: ''
    },
    {
      account: '',
      environment: '',
      identifier: 't494',
      name: 'Target 494 of 1000',
      org: '',
      project: ''
    }
  ],
  name: 'Target Group with Specific Targets',
  rules: []
}

const renderComponent = (props: Partial<TargetGroupCriteriaProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <TargetGroupCriteria targetGroup={mockTargetGroup} {...props} />
    </TestWrapper>
  )

describe('TargetGroupCriteria', () => {
  test('it should display the heading and sub-sections', async () => {
    renderComponent()

    expect(screen.getByRole('heading', { name: 'cf.segmentDetail.criteria' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'cf.segmentDetail.specificTargets' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'cf.segmentDetail.targetBasedOnCondition' })).toBeInTheDocument()
  })
})
