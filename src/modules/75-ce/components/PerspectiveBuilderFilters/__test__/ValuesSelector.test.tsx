import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import type { QlceViewFilterOperator } from 'services/ce/services'
import { TestWrapper } from '@common/utils/testUtils'
import ValuesSelectors from '../views/ValuesSelector'

const mockData = {
  provider: {
    id: 'CLUSTER',
    name: ''
  },
  service: {
    id: 'clusterName',
    name: 'Cluster Name'
  },
  isDisabled: false,
  operator: 'IN' as QlceViewFilterOperator,
  valueList: [
    'gke',
    'ce-dev-new',
    'sample-ce-dev',
    'renanme_test_first_renamed',
    'test-utsav-4th-june',
    'ce-ecs-ec2-test',
    'rename_cluster_2_renamed',
    'eks-fargate-cluster',
    'TestDeletePt',
    'auto_cp_v8ttxr',
    'test-utsav-9th-jun',
    'qa-target-clone-2',
    'ce-dev-ce-delegate-aks',
    'Kubernetes ce-dev-1',
    'auto_cp_fytumb',
    'ce-dev-eks-fargate',
    'ce-dev-aks-manual',
    'aks-cluster',
    'qa-target-clone-4',
    'pr-target',
    'Utsav EKS Fargate',
    'ce-test-dontdelete',
    'qa_target_clone_22',
    'azure-harness-qa',
    'TestDeletePt2',
    'qa-target-clone-5-rename',
    'ce-dev cluster',
    'auto_cp_yoplhk',
    'qa-target-v114',
    'gke-automation',
    'Kubernetes ce-dev',
    'qa-target-clone',
    'gke-new',
    'qa_target_clone_21',
    'eks-fargate'
  ],
  fetching: false,
  selectedVal: ['gke'],
  onValueChange: jest.fn()
}

describe('test cases for filter values selector', () => {
  test('should be able to render ValuesSelector', async () => {
    const { container, getByPlaceholderText } = render(
      <TestWrapper>
        <ValuesSelectors {...mockData} />
      </TestWrapper>
    )
    expect(container.querySelector('[class*="operandSelectorContainer"]')).not.toBeNull()
    const ctn = container.querySelector('[class*="operandSelectorContainer"]')
    fireEvent.click(ctn!)
    await waitFor(() => getByPlaceholderText('ce.perspectives.createPerspective.filters.searchText'))

    expect(container).toMatchSnapshot()
  })
})
