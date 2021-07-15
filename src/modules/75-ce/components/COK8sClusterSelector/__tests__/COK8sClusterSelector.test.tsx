import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { ConnectorResponse } from 'services/cd-ng'
import COK8sClusterSelector from '../COK8sClusterSelector'

const mockedClusters: ConnectorResponse[] = [
  {
    connector: {
      name: 'ry-04-07-21',
      identifier: 'ry040721',
      description: '',
      // orgIdentifier: undefined,
      // projectIdentifier: undefined,
      tags: {},
      type: 'CEK8sCluster',
      spec: { connectorRef: 'eqweqweqw', featuresEnabled: ['OPTIMIZATION'] }
    },
    createdAt: 1625400736539,
    lastModifiedAt: 1625400736400,
    status: {
      status: 'SUCCESS',
      // errorSummary: null,
      // errors: null,
      testedAt: 1625400737424,
      lastTestedAt: 0,
      lastConnectedAt: 1625400737424
    },
    activityDetails: { lastActivityTime: 1625400736640 },
    harnessManaged: false
    // gitDetails: { objectId: null, branch: null, repoIdentifier: null, rootFolder: null, filePath: null }
  }
]

describe('K8s cluster selector', () => {
  test('render empty cluster selector screen', () => {
    const { container } = render(
      <TestWrapper>
        <COK8sClusterSelector
          clusters={[]}
          loading={false}
          onClusterAddSuccess={jest.fn()}
          refetchConnectors={jest.fn()}
          search={jest.fn()}
          selectedCluster={{}}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('render cluster selector screen with data', () => {
    const { container } = render(
      <TestWrapper>
        <COK8sClusterSelector
          clusters={mockedClusters}
          loading={false}
          onClusterAddSuccess={jest.fn()}
          refetchConnectors={jest.fn()}
          search={jest.fn()}
          selectedCluster={mockedClusters[0]}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
