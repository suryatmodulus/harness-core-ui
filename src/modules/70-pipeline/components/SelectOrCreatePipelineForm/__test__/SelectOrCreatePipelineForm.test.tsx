import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'

import { SelectOrCreatePipelineForm } from '../SelectOrCreatePipelineForm'

jest.mock('services/pipeline-ng', () => ({
  useGetPipelineList: jest.fn().mockImplementation(() => {
    return {
      cancel: jest.fn(),
      loading: false,
      mutate: jest.fn().mockImplementationOnce(() => {
        return {
          data: {
            content: [
              {
                identifier: 'item 1'
              },
              {
                identifier: 'item 2'
              }
            ]
          }
        }
      })
    }
  })
}))

const openCreatPipeLineModalMock = jest.fn()
describe('SelectOrCreatePipelineForm', () => {
  const props = {
    handleSubmit: jest.fn(),
    openCreatPipeLineModal: openCreatPipeLineModalMock
  }
  describe('Rendering', () => {
    test('should render SelectOrCreatePipelineForm', () => {
      const { container, getByText } = render(
        <TestWrapper
          path="/account/:accountId"
          pathParams={{ accountId: 'testAcc' }}
          defaultAppStoreValues={defaultAppStoreValues}
        >
          <SelectOrCreatePipelineForm {...props} />
        </TestWrapper>
      )
      expect(getByText('common.letsGetYouStarted')).toBeDefined()
      expect(getByText('pipeline.selectOrCreatePipeline.selectAPipeline')).toBeDefined()
      expect(container).toMatchSnapshot()
    })

    test('should validate inputs', async () => {
      const { getByText } = render(
        <TestWrapper
          path="/account/:accountId"
          pathParams={{ accountId: 'testAcc' }}
          defaultAppStoreValues={defaultAppStoreValues}
        >
          <SelectOrCreatePipelineForm {...props} />
        </TestWrapper>
      )
      fireEvent.click(getByText('continue'))
      await waitFor(() => expect(getByText('pipeline.selectOrCreatePipeline.selectAPipeline')).toBeDefined())
    })

    test('should open create pipeline modal when click Create a New Pipeline', async () => {
      const { container, getByText } = render(
        <TestWrapper
          path="/account/:accountId"
          pathParams={{ accountId: 'testAcc' }}
          defaultAppStoreValues={defaultAppStoreValues}
        >
          <SelectOrCreatePipelineForm {...props} />
        </TestWrapper>
      )
      fireEvent.click(getByText('pipeline.createANewPipeline'))
      await waitFor(() => expect(openCreatPipeLineModalMock).toBeCalled())
      expect(container).toMatchSnapshot()
    })
  })
})
