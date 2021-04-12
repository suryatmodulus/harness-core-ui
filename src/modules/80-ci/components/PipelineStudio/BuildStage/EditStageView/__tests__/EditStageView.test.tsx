import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import type { ResponseConnectorResponse } from 'services/cd-ng'
import { TestWrapper, UseGetReturnData } from '@common/utils/testUtils'
import { EditStageView } from '../EditStageView'
jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => ({ children }: { children: JSX.Element }) => (
  <div>{children}</div>
))

const ConnectorResponse: UseGetReturnData<ResponseConnectorResponse | any> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      connector: {
        name: 'test1',
        identifier: 'test1'
      }
    }
  }
}

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => ConnectorResponse)
}))

const getStepData = () => {
  return {
    stage: {
      identifier: 'id1',
      name: 'name1',
      description: 'desc1',
      spec: {
        cloneCodebase: false
      }
    }
  }
}

const renderComponent = (stepData?: any, onSubmit?: () => void) => {
  return render(
    <TestWrapper
      path="/dummy"
      pathParams={{
        orgIdentifier: 'dummy',
        projectIdentifier: 'dummy',
        accountId: 'dummy'
      }}
    >
      <EditStageView data={stepData} onSubmit={onSubmit} />
    </TestWrapper>
  )
}

describe('EditStageView snapshot test', () => {
  test('should render properly', async () => {
    const { container } = renderComponent(getStepData())
    expect(container).toMatchSnapshot()
  })
  test('should render properly without data', async () => {
    const { container } = renderComponent()
    expect(container).toMatchSnapshot()
  })
})

describe('EditStageView save', () => {
  test('should call save when data are valid', async () => {
    const submitFn = jest.fn()
    const { getByText } = renderComponent(getStepData(), submitFn)

    await act(async () => {
      fireEvent.click(getByText('pipelineSteps.build.create.setupStage'))
    })

    expect(submitFn).toBeCalled()
  })
  test('should not call save when data are not valid', async () => {
    const submitFn = jest.fn()
    const { getByText } = renderComponent(undefined, submitFn)

    await act(async () => {
      fireEvent.click(getByText('pipelineSteps.build.create.setupStage'))
    })

    expect(submitFn).not.toBeCalled()
  })
})
