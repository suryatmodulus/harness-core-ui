import React from 'react'
import { waitFor, act, fireEvent, findByText, findAllByText, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { UseGetReturnData } from '@common/utils/testUtils'
import type { ResponseConnectorResponse } from 'services/cd-ng'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import BuildInfraSpecifications from '../BuildInfraSpecifications'
import contextMock from './pipelineContextMock.json'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

export const ConnectorResponse: UseGetReturnData<ResponseConnectorResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      connector: {
        name: 'tesa 1',
        identifier: 'tesa_1',
        description: '',
        orgIdentifier: 'Harness11',
        tags: {},
        type: 'K8sCluster',
        spec: {
          credential: {
            type: 'ManualConfig',
            spec: {
              masterUrl: 'asd',
              auth: { type: 'UsernamePassword', spec: { username: 'asd', passwordRef: 'account.test1111' } }
            }
          }
        }
      },
      createdAt: 1602062958274,
      lastModifiedAt: 1602062958274
    },
    correlationId: 'e1841cfc-9ed5-4f7c-a87b-c9be1eeaae34'
  }
}

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => ConnectorResponse),
  getConnectorListPromise: () =>
    Promise.resolve({
      data: {
        content: [
          {
            connector: ConnectorResponse.data!.data!.connector
          }
        ]
      }
    })
}))

describe('BuildInfraSpecifications snapshot test', () => {
  test('initializes ok', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
        <BuildInfraSpecifications />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('able to select a connector', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ accountId: 'dummy' }}>
        <BuildInfraSpecifications />
      </TestWrapper>
    )
    const selectBtn = await findByText(container, 'tesa 1')
    expect(selectBtn).toBeDefined()
    fireEvent.click(selectBtn)
    await act(async () => {
      const portal = document.getElementsByClassName('bp3-portal')[0]
      expect(portal).toBeDefined()
      fireEvent.click(await findByText(portal as HTMLElement, 'account'))
      const connector = await findAllByText(portal as HTMLElement, 'tesa_1')
      await waitFor(() => expect(connector?.[0]).toBeDefined())
      fireEvent.click(connector?.[0])
    })
    const chosenConnector = await findByText(container, 'tesa 1')
    expect(chosenConnector).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('can add new label', async () => {
    const { container, findByTestId } = render(
      <TestWrapper pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
        <PipelineContext.Provider
          value={
            {
              ...contextMock,
              getStageFromPipeline: jest.fn(() => {
                return { stage: contextMock.state.pipeline.stages[0], parent: undefined }
              }),
              updatePipeline: jest.fn
            } as any
          }
        >
          <BuildInfraSpecifications />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    await act(async () => {
      fireEvent.click(await findByTestId('advanced-summary'))
    })

    await act(async () => {
      fireEvent.click(await findByTestId('add-labels'))
      fireEvent.change(container.querySelector('[name="labels[2].key"]')!, { target: { value: 'projectid' } })
      fireEvent.change(container.querySelector('[name="labels[2].value"]')!, { target: { value: 'testVal' } })
    })
    // TODO - check why validation error is not appearing
    expect(container).toMatchSnapshot()
  })
})
