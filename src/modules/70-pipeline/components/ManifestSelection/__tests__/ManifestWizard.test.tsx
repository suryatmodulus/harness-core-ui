import React from 'react'
import { findAllByText, findByText, fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { ManifestConfig } from 'services/cd-ng'
import { ManifestWizard } from '../ManifestWizard/ManifestWizard'
import type { ManifestStepInitData } from '../ManifestInterface'
import HelmWithGIT from '../ManifestWizardSteps/HelmWithGIT/HelmWithGIT'

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

  test(`renders correctly with differnet manifest types`, () => {
    const initialValues = {
      connectorRef: undefined,
      store: ''
    }
    const { container } = render(
      <TestWrapper>
        <ManifestWizard
          handleConnectorViewChange={jest.fn()}
          handleStoreChange={jest.fn()}
          initialValues={initialValues as ManifestStepInitData}
          types={['K8sManifest', 'Values', 'HelmChart']}
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

  test(`new connector view works correctly`, async () => {
    const initialValues = {
      connectorRef: undefined,
      store: ''
    }

    const { container } = render(
      <TestWrapper>
        <ManifestWizard
          handleConnectorViewChange={jest.fn()}
          handleStoreChange={jest.fn()}
          initialValues={initialValues as ManifestStepInitData}
          types={['K8sManifest', 'Values', 'HelmChart']}
          expressions={[]}
          manifestStoreTypes={['Git', 'Github', 'GitLab', 'Bitbucket']}
          labels={{
            firstStepName: 'Specify Manifest Type',
            secondStepName: 'Specify Manifest Store',
            newConnector: 'New Connector'
          }}
          selectedManifest={'K8sManifest'}
          changeManifestType={jest.fn()}
          newConnectorView={true}
          iconsProps={{ name: 'info' }}
        />
      </TestWrapper>
    )
    const manifestLabel = await findByText(container, 'Specify Manifest Type')
    expect(manifestLabel).toBeDefined()
    const K8smanifestType = await findAllByText(container, 'K8s Manifest')
    expect(K8smanifestType).toBeDefined()
    const HelmmanifestType = await findByText(container, 'Helm Chart')
    expect(HelmmanifestType).toBeDefined()
    fireEvent.click(HelmmanifestType)

    const continueButton = await findByText(container, 'Continue')
    expect(continueButton).toBeDefined()
    fireEvent.click(continueButton)

    const manifeststoreLabel = await findByText(container, 'Specify Manifest Store')
    expect(manifeststoreLabel).toBeDefined()

    const gitConnector = await findByText(container, 'Git')
    expect(gitConnector).toBeDefined()
    const gitconnectorCard = container.getElementsByClassName('squareCard')[0]
    fireEvent.click(gitconnectorCard)

    const newConnectorLabel = await findByText(container, 'New Connector')
    expect(newConnectorLabel).toBeDefined()
    const newConnectorBtn = container.getElementsByClassName('addNewManifest')[0]
    expect(newConnectorBtn).toBeDefined()
    fireEvent.click(newConnectorLabel)
    const nextStepButton = await findByText(container, 'Continue')
    expect(nextStepButton).toBeDefined()
    fireEvent.click(nextStepButton)
    // const createConnectorLabel = await findByText(container, 'Create New Connector')
    // expect(createConnectorLabel).toBeDefined()

    expect(container).toMatchSnapshot()
  })

  test(`last step data without initial values`, async () => {
    const initialValues = {
      connectorRef: '',
      store: ''
    }
    const laststepProps = {
      name: 'Manifest Details',
      expressions: [''],
      stepName: 'Manifest Details Step',
      initialValues: (null as unknown) as ManifestConfig,
      handleSubmit: jest.fn(),
      selectedManifest: 'K8sManifest'
    }
    const { container } = render(
      <TestWrapper>
        <ManifestWizard
          handleConnectorViewChange={jest.fn()}
          handleStoreChange={jest.fn()}
          initialValues={initialValues as ManifestStepInitData}
          types={['K8sManifest', 'Values', 'HelmChart']}
          expressions={[]}
          manifestStoreTypes={['Git', 'Github', 'GitLab', 'Bitbucket']}
          labels={{
            firstStepName: 'Specify Manifest Type',
            secondStepName: 'Specify Manifest Store',
            newConnector: 'New Connector'
          }}
          selectedManifest={'K8sManifest'}
          changeManifestType={jest.fn()}
          newConnectorView={true}
          iconsProps={{ name: 'info' }}
          lastSteps={[<HelmWithGIT {...laststepProps} key={'key'} />]}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test(`last step data with proper initial values`, async () => {
    const initialValues = {
      connectorRef: '',
      store: ''
    }
    const laststepProps = {
      name: 'Manifest Details',
      expressions: [''],
      stepName: 'Manifest Details Step',
      initialValues: {
        identifier: 'id',
        type: 'K8sManifest',
        spec: {
          skipResourceVersioning: false,
          store: {
            type: 'Git',
            spec: {
              connectorRef: 'connectorRef',
              gitFetchType: 'Branch',
              branch: 'master',
              repoName: 'repoName',
              commidId: undefined
            }
          }
        }
      } as ManifestConfig,
      handleSubmit: jest.fn(),
      selectedManifest: 'K8sManifest'
    }
    const { container } = render(
      <TestWrapper>
        <ManifestWizard
          handleConnectorViewChange={jest.fn()}
          handleStoreChange={jest.fn()}
          initialValues={initialValues as ManifestStepInitData}
          types={['K8sManifest', 'Values', 'HelmChart']}
          expressions={[]}
          manifestStoreTypes={['Git', 'Github', 'GitLab', 'Bitbucket']}
          labels={{
            firstStepName: 'Specify Manifest Type',
            secondStepName: 'Specify Manifest Store',
            newConnector: 'New Connector'
          }}
          selectedManifest={'K8sManifest'}
          changeManifestType={jest.fn()}
          newConnectorView={true}
          iconsProps={{ name: 'info' }}
          lastSteps={[<HelmWithGIT {...laststepProps} key={'key'} />]}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
