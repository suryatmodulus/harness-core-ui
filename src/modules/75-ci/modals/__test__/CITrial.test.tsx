import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'

import CITrial from '../CITrial/CITrial'

const reloadPipelinesMock = (): Promise<{ status: string }> => {
  return Promise.resolve({ status: 'SUCCESS' })
}

jest.mock('services/pipeline-ng', () => ({
  useGetPipelineList: jest.fn().mockImplementation(() => {
    return {
      cancel: jest.fn(),
      loading: false,
      mutate: reloadPipelinesMock
    }
  })
}))

describe('CITrial Modal', () => {
  const props = {
    handleCreateSubmit: jest.fn(),
    handleSelectSubmit: jest.fn(),
    isSelect: false
  }
  describe('Rendering', () => {
    test('should render CITrial with Create Pipeline Form when isSelect is false', () => {
      const { container, getByText } = render(
        <TestWrapper
          path="/account/:accountId"
          pathParams={{ accountId: 'testAcc' }}
          defaultAppStoreValues={defaultAppStoreValues}
        >
          <CITrial {...props} />
        </TestWrapper>
      )
      expect(getByText('ci.ciTrialHomePage.startTrial.description')).toBeDefined()
      expect(container).toMatchSnapshot()
    })

    test('should render CITrial with Select Pipeline Form when isSelect is true', () => {
      const { container, getByText } = render(
        <TestWrapper
          path="/account/:accountId"
          pathParams={{ accountId: 'testAcc' }}
          defaultAppStoreValues={defaultAppStoreValues}
        >
          <CITrial {...props} isSelect={true} />
        </TestWrapper>
      )
      expect(getByText('pipeline.selectOrCreateForm.description')).toBeDefined()
      expect(container).toMatchSnapshot()
    })
  })
})
