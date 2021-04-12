import React from 'react'
import { render, findByText, fireEvent, waitFor } from '@testing-library/react'
// import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import {
  PipelineContext,
  PipelineContextInterface
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import ArtifactsSelection from '../../ArtifactsSelection'
import pipelineContextMock from './pipelineContext.json'
jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => ({ children }: { children: JSX.Element }) => (
  <div>{children}</div>
))

const fetchConnectors = () => Promise.resolve({})

jest.mock('services/cd-ng', () => ({
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectors })),

  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null }
  })
}))

const getContextValue = (): PipelineContextInterface => {
  return {
    ...pipelineContextMock,
    getStageFromPipeline: jest.fn(() => {
      return { stage: pipelineContextMock.state.pipeline.stages[0], parent: undefined }
    })
  } as any
}

describe('ArtifactsSelection tests', () => {
  test(`renders without crashing`, () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ArtifactsSelection isForOverrideSets={false} />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  }),
    test(`renders artifact without crashing`, async () => {
      const { container } = render(
        <TestWrapper>
          <PipelineContext.Provider value={getContextValue()}>
            <ArtifactsSelection isForOverrideSets={false} />
          </PipelineContext.Provider>
        </TestWrapper>
      )
      const primaryArtifactContainer = await findByText(container, 'Dockerhub')
      expect(primaryArtifactContainer).toBeDefined()
      expect(container).toMatchSnapshot()
    }),
    test(`renders artifact with override without crashing`, async () => {
      const { container } = render(
        <TestWrapper>
          <PipelineContext.Provider value={getContextValue()}>
            <ArtifactsSelection isForOverrideSets={true} />
          </PipelineContext.Provider>
        </TestWrapper>
      )

      expect(container).toMatchSnapshot('renders artifact with override without crashing')
    }),
    test(`renders edit modal without crashing`, async () => {
      const { container } = render(
        <TestWrapper>
          <PipelineContext.Provider value={getContextValue()}>
            <ArtifactsSelection isForOverrideSets={false} />
          </PipelineContext.Provider>
        </TestWrapper>
      )
      const primaryArtifactContainer = await findByText(container, 'Dockerhub')
      expect(primaryArtifactContainer).toBeDefined()
      const editButton = container.querySelector('span[data-icon="Edit"]')
      expect(editButton).toBeDefined()
      fireEvent.click(editButton as HTMLElement)
      const artifactEditModalTitle = await waitFor(() => findByText(container, 'artifactRepository'))
      expect(artifactEditModalTitle).toBeDefined()

      expect(container).toMatchSnapshot('Edit Modal')
    })
})
