/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'

import { CreatePipelineForm } from '../CreatePipelineForm'

const closeModalMock = jest.fn()
describe('CreatePipelineForm', () => {
  const props = {
    handleSubmit: jest.fn(),
    closeModal: closeModalMock
  }
  describe('Rendering', () => {
    test('should render CreatePipelineForm', () => {
      const { container } = render(
        <TestWrapper
          path="/account/:accountId"
          pathParams={{ accountId: 'testAcc' }}
          defaultAppStoreValues={defaultAppStoreValues}
        >
          <CreatePipelineForm {...props} />
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()
    })

    test('should closeModal when click Setup Later', async () => {
      const { container, getByText } = render(
        <TestWrapper
          path="/account/:accountId"
          pathParams={{ accountId: 'testAcc' }}
          defaultAppStoreValues={defaultAppStoreValues}
        >
          <CreatePipelineForm {...props} />
        </TestWrapper>
      )
      fireEvent.click(getByText('pipeline.createPipeline.setupLater'))
      await waitFor(() => expect(closeModalMock).toBeCalled())
      expect(container).toMatchSnapshot()
    })

    test('should validate inputs', async () => {
      const { container, getByText } = render(
        <TestWrapper
          path="/account/:accountId"
          pathParams={{ accountId: 'testAcc' }}
          defaultAppStoreValues={defaultAppStoreValues}
        >
          <CreatePipelineForm {...props} />
        </TestWrapper>
      )
      fireEvent.click(getByText('start'))
      await waitFor(() => expect(getByText('createPipeline.pipelineNameRequired')).toBeDefined())
      expect(container).toMatchSnapshot()
    })
  })
})
