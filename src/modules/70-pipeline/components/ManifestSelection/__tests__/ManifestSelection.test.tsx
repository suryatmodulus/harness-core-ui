import React from 'react'
import { render, findByText, fireEvent, findAllByText, waitFor } from '@testing-library/react'
// import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import ManifestSelection from '../ManifestSelection'
import ManifestListView from '../ManifestListView'
import pipelineContextMock from './pipeline_mock.json'
import connectorsData from './connectors_mock.json'

const fetchConnectors = (): Promise<unknown> => Promise.resolve(connectorsData)

jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => ({ children }: { children: JSX.Element }) => (
  <div>{children}</div>
))

jest.mock('services/cd-ng', () => ({
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectors }))
}))

describe('ManifestSelection tests', () => {
  test(`renders without crashing`, () => {
    const { container } = render(
      <TestWrapper>
        <ManifestSelection isForOverrideSets={false} isForPredefinedSets={false} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders add Manifest option without crashing`, async () => {
    const { container } = render(
      <TestWrapper>
        <ManifestSelection isForOverrideSets={false} isForPredefinedSets={false} />
      </TestWrapper>
    )
    const addFileButton = await findByText(container, 'pipelineSteps.serviceTab.manifestList.addManifest')
    expect(addFileButton).toBeDefined()
    fireEvent.click(addFileButton)
    const portal = document.getElementsByClassName('bp3-dialog')[0]
    const manifestLabel = await waitFor(() =>
      findByText(portal as HTMLElement, 'pipeline.manifestType.manifestRepoType')
    )
    expect(manifestLabel).toBeDefined()
    const closeButton = portal.querySelector("button[class*='crossIcon']") as Element
    fireEvent.click(closeButton)
    expect(container).toMatchSnapshot()
  })

  test(`renders Manifest Wizard popover`, async () => {
    const { container } = render(
      <TestWrapper>
        <ManifestSelection isForOverrideSets={false} isForPredefinedSets={false} />
      </TestWrapper>
    )
    const addFileButton = await findByText(container, 'pipelineSteps.serviceTab.manifestList.addManifest')
    expect(addFileButton).toBeDefined()
    fireEvent.click(addFileButton)
    const portal = document.getElementsByClassName('bp3-dialog')[0]
    const manifestLabel = await waitFor(() =>
      findByText(portal as HTMLElement, 'pipeline.manifestType.manifestRepoType')
    )
    expect(manifestLabel).toBeDefined()
    const manifestTypes = await waitFor(() => findAllByText(portal as HTMLElement, 'K8s Manifest'))
    expect(manifestTypes).toBeDefined()
    fireEvent.click(manifestTypes[0])
    const continueButton = await findByText(portal as HTMLElement, 'continue')
    expect(continueButton).toBeDefined()

    expect(container).toMatchSnapshot()
  })

  test(`renders Manifest Listview without crashing`, () => {
    const props = {
      isPropagating: false,
      pipeline: pipelineContextMock,
      updateStage: jest.fn(),
      stage: pipelineContextMock.stages[0],
      isForOverrideSets: false,
      identifierName: '',
      isForPredefinedSets: false,
      overrideSetIdentifier: '',
      connectors: undefined,
      refetchConnectors: jest.fn(),
      isReadonly: false
    }
    const { container } = render(
      <TestWrapper>
        <ManifestListView {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders Manifest Listview with connectors Data`, () => {
    const props = {
      isPropagating: false,
      pipeline: pipelineContextMock,
      updateStage: jest.fn(),
      stage: pipelineContextMock.stages[0],
      isForOverrideSets: false,
      identifierName: '',
      isForPredefinedSets: false,
      overrideSetIdentifier: '',
      connectors: connectorsData.data as any,
      refetchConnectors: jest.fn(),
      isReadonly: false
    }
    const { container } = render(
      <TestWrapper>
        <ManifestListView {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders Manifest Listview with overrideSetIdentifier, isPropagating, isForOverrideSets`, () => {
    const props = {
      isPropagating: true,
      pipeline: pipelineContextMock,
      updateStage: jest.fn(),
      stage: pipelineContextMock.stages[0],
      isForOverrideSets: true,
      identifierName: '',
      isForPredefinedSets: false,
      overrideSetIdentifier: 'overrideSetIdentifier',
      connectors: connectorsData.data as any,
      refetchConnectors: jest.fn(),
      isReadonly: false
    }
    const { container } = render(
      <TestWrapper>
        <ManifestListView {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`delete manifest list works correctly`, async () => {
    const props = {
      isPropagating: false,
      pipeline: pipelineContextMock,
      updateStage: jest.fn(),
      stage: pipelineContextMock.stages[0],
      isForOverrideSets: false,
      identifierName: '',
      isForPredefinedSets: false,
      overrideSetIdentifier: '',
      connectors: connectorsData.data as any,
      refetchConnectors: jest.fn(),
      isReadonly: false
    }
    const { container } = render(
      <TestWrapper>
        <ManifestListView {...props} />
      </TestWrapper>
    )

    const deleteManifestBtn = container.querySelector('[data-icon="bin-main"]') as Element
    expect(deleteManifestBtn).toBeDefined()
    fireEvent.click(deleteManifestBtn)

    expect(container).toMatchSnapshot()
  })

  test(`edit manifest list works correctly`, async () => {
    const props = {
      isPropagating: false,
      pipeline: pipelineContextMock,
      updateStage: jest.fn(),
      stage: pipelineContextMock.stages[0],
      isForOverrideSets: false,
      identifierName: '',
      isForPredefinedSets: false,
      overrideSetIdentifier: '',
      connectors: connectorsData.data as any,
      refetchConnectors: jest.fn(),
      isReadonly: false
    }
    const { container } = render(
      <TestWrapper>
        <ManifestListView {...props} />
      </TestWrapper>
    )

    const editManifestBtn = container.querySelectorAll('[data-icon="Edit"]')[0]
    expect(editManifestBtn).toBeDefined()
    fireEvent.click(editManifestBtn)
    const portal = document.getElementsByClassName('bp3-dialog')[0]
    const manifestLabel = await waitFor(() =>
      findByText(portal as HTMLElement, 'pipeline.manifestType.manifestRepoType')
    )
    expect(manifestLabel).toBeDefined()
    const closeButton = portal.querySelector("button[class*='crossIcon']") as Element
    fireEvent.click(closeButton)
    expect(container).toMatchSnapshot()
  })
})
