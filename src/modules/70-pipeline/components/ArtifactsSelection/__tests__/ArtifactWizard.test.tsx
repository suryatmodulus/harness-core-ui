import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ConnectorRefSteps from '../ConnectorRefSteps/ConnectorRefSteps'
import type { InitialArtifactDataType, TagTypes } from '../ArtifactInterface'
import { ImagePath } from '../ArtifactRepository/ArtifactLastSteps/ImagePath/ImagePath'
import connectorsData from './connectors_mock.json'

const fetchConnectors = (): Promise<unknown> => Promise.resolve(connectorsData)

jest.mock('services/cd-ng', () => ({
  useGetConnector: () => {
    return {
      data: fetchConnectors,
      refetch: jest.fn()
    }
  }
}))

describe('Artifact ConnectorRefSteps tests', () => {
  test(`renders without crashing`, () => {
    const { container } = render(
      <TestWrapper>
        <ConnectorRefSteps
          handleViewChange={jest.fn()}
          artifactInitialValue={{} as InitialArtifactDataType}
          types={[]}
          expressions={[]}
          isReadonly={false}
          labels={{
            firstStepName: 'first step',
            secondStepName: 'second step'
          }}
          selectedArtifact={'DockerRegistry'}
          changeArtifactType={jest.fn()}
          newConnectorView={false}
          iconsProps={{ name: 'info' }}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders correctly with connector Data`, () => {
    const initialValues = {
      connectorId: 'connectorId'
    }
    const { container } = render(
      <TestWrapper>
        <ConnectorRefSteps
          handleViewChange={jest.fn()}
          artifactInitialValue={initialValues as InitialArtifactDataType}
          types={[]}
          expressions={[]}
          isReadonly={false}
          labels={{
            firstStepName: 'first step',
            secondStepName: 'second step'
          }}
          selectedArtifact={'DockerRegistry'}
          changeArtifactType={jest.fn()}
          newConnectorView={false}
          iconsProps={{ name: 'info' }}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders correctly with differnet artifact types`, () => {
    const initialValues = {
      connectorId: 'connectorId'
    }
    const { container } = render(
      <TestWrapper>
        <ConnectorRefSteps
          handleViewChange={jest.fn()}
          artifactInitialValue={initialValues as InitialArtifactDataType}
          types={['DockerRegistry', 'Gcr', 'Ecr']}
          expressions={[]}
          isReadonly={false}
          labels={{
            firstStepName: 'first step',
            secondStepName: 'second step'
          }}
          selectedArtifact={'Gcr'}
          changeArtifactType={jest.fn()}
          newConnectorView={false}
          iconsProps={{ name: 'info' }}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`new connector view works correctly`, async () => {
    const initialValues = {
      connectorId: 'connectorId'
    }
    const { container, findByText, findAllByText } = render(
      <TestWrapper>
        <ConnectorRefSteps
          handleViewChange={jest.fn()}
          artifactInitialValue={initialValues as InitialArtifactDataType}
          types={['DockerRegistry', 'Gcr', 'Ecr']}
          expressions={[]}
          isReadonly={false}
          labels={{
            firstStepName: 'first step',
            secondStepName: 'second step'
          }}
          selectedArtifact={'DockerRegistry'}
          changeArtifactType={jest.fn()}
          newConnectorView={true}
          iconsProps={{ name: 'info' }}
        />
      </TestWrapper>
    )
    const artifactLabel = await findByText('connectors.artifactRepository')
    expect(artifactLabel).toBeDefined()
    const DockerArtifactType = await findAllByText('dockerRegistry')
    expect(DockerArtifactType).toBeDefined()

    const GCRArtifactType = await findByText('connectors.GCR.name')
    expect(GCRArtifactType).toBeDefined()
    fireEvent.click(GCRArtifactType)

    const continueButton = await findByText('continue')
    expect(continueButton).toBeDefined()
    fireEvent.click(continueButton)

    const artifactRepoLabel = await findByText('DockerRegistry connector')
    expect(artifactRepoLabel).toBeDefined()
    const newConnectorLabel = await findByText('newLabel DockerRegistry connector')
    expect(newConnectorLabel).toBeDefined()

    fireEvent.click(newConnectorLabel)
    const nextStepButton = await findByText('continue')
    expect(nextStepButton).toBeDefined()
    fireEvent.click(nextStepButton)

    expect(container).toMatchSnapshot()
  })

  test(`last step data without initial values`, async () => {
    const initialValues = {
      connectorId: 'connectorId'
    }
    const laststepProps = {
      name: 'Artifact Location',
      expressions: [''],
      context: 1,
      initialValues: {
        identifier: 'id',
        imagePath: '',
        tag: '',
        tagType: 'value' as TagTypes,
        tagRegex: ''
      },
      handleSubmit: jest.fn(),
      artifactIdentifiers: []
    }

    const { container } = render(
      <TestWrapper>
        <ConnectorRefSteps
          handleViewChange={jest.fn()}
          artifactInitialValue={initialValues as InitialArtifactDataType}
          types={['DockerRegistry', 'Gcr', 'Ecr']}
          expressions={[]}
          isReadonly={false}
          labels={{
            firstStepName: 'first step',
            secondStepName: 'second step'
          }}
          selectedArtifact={'DockerRegistry'}
          changeArtifactType={jest.fn()}
          newConnectorView={true}
          iconsProps={{ name: 'info' }}
          lastSteps={[<ImagePath {...laststepProps} key={'key'} />]}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
