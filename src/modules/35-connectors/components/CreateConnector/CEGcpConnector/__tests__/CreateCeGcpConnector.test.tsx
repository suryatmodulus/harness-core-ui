import React from 'react'
import { noop } from 'lodash-es'
import { render, getAllByText } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import { TestWrapper } from '@common/utils/testUtils'
import { clickSubmit, fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import CreateCeGcpConnector from '../CreateCeGcpConnector'

const commonProps = {
  accountId: 'dummy',
  orgIdentifier: '',
  projectIdentifier: '',
  setIsEditMode: noop,
  onClose: noop,
  onSuccess: noop
}

jest.mock('services/cd-ng', () => ({
  useUpdateConnector: jest.fn().mockImplementation(() => ({
    mutate: async () => {
      return {
        status: 'SUCCESS'
      }
    },
    loading: false
  })),
  useCreateConnector: jest.fn().mockImplementation(() => ({
    mutate: async () => {
      return {
        status: 'SUCCESS'
      }
    },
    loading: false
  })),
  useGetTestConnectionResult: jest.fn().mockImplementation(() => ({
    mutate: async () => {
      return {
        status: 'SUCCESS'
      }
    },
    loading: false
  })),
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({
    mutate: async () => {
      return {
        status: 'SUCCESS',
        data: {
          pageItemCount: 0,
          content: []
        }
      }
    }
  }))
}))

describe('Create Secret Manager Wizard', () => {
  test('should render form', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateCeGcpConnector {...commonProps} isEditMode={false} connectorInfo={undefined} />
      </TestWrapper>
    )

    //Overview Step
    expect(getAllByText(container, 'connectors.ceGcp.overview.projectIdLabel')[0]).toBeDefined()
    expect(container).toMatchSnapshot()

    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'name',
        value: 'dummyname'
      },
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'projectId',
        value: '12345'
      }
    ])

    await act(async () => {
      clickSubmit(container)
    })

    //Billing Export Page
    expect(getAllByText(container, 'connectors.ceGcp.billingExport.description')[0]).toBeDefined()

    //Check if the extention opens
    expect(getAllByText(container, 'connectors.ceGcp.billingExtention.heading')[0]).toBeDefined()

    expect(container).toMatchSnapshot()

    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'datasetId',
        value: 'randomdatasetId'
      }
    ])

    await act(async () => {
      clickSubmit(container)
    })

    //Grant Permission Step
    expect(getAllByText(container, 'connectors.ceGcp.grantPermission.step1')[0]).toBeDefined()
    expect(container).toMatchSnapshot()

    await act(async () => {
      clickSubmit(container)
    })

    //Test Connection Step
    expect(getAllByText(container, 'connectors.ceGcp.testConnection.heading')[1]).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})
