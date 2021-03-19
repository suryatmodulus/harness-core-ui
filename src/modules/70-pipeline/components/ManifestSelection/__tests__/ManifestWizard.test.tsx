import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ManifestWizard } from '../ManifestWizard/ManifestWizard'
import type { ManifestStepInitData } from '../ManifestInterface'

describe('ManifestSelection tests', () => {
  test(`renders without crashing`, () => {
    const { container } = render(
      <TestWrapper>
        <ManifestWizard
          handleConnectorViewChange={jest.fn()}
          handleStoreChange={jest.fn()}
          initialValues={{} as ManifestStepInitData}
          types={[]}
          expressions={[]}
          manifestStoreTypes={[]}
          labels={{
            firstStepName: 'first step',
            secondStepName: 'second step',
            newConnector: 'new connector'
          }}
          selectedManifest={'K8sManifest'}
          changeManifestType={jest.fn()}
          newConnectorView={false}
          iconsProps={{ name: 'info' }}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test(`can change artifact input type  without crashing`, async () => {
    const initialValues = {
      identifier: '',
      branch: 'branch name',
      commitId: undefined,
      connectorRef: 'connectorRef',
      gitFetchType: 'Branch',
      paths: ['temp'],
      store: 'Git'
    }
    const { container } = render(
      <TestWrapper>
        <ManifestWizard
          handleConnectorViewChange={jest.fn()}
          handleStoreChange={jest.fn()}
          initialValues={initialValues as ManifestStepInitData}
          types={[]}
          expressions={[]}
          manifestStoreTypes={['Git', 'Github', 'GitLab', 'Bitbucket']}
          labels={{
            firstStepName: 'first step',
            secondStepName: 'second step',
            newConnector: 'new connector'
          }}
          selectedManifest={'K8sManifest'}
          changeManifestType={jest.fn()}
          newConnectorView={false}
          iconsProps={{ name: 'info' }}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
