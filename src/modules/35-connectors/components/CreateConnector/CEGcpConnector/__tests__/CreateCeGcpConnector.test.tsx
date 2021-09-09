import React from 'react'
import { noop } from 'lodash-es'
import { render, getAllByText } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import { TestWrapper } from '@common/utils/testUtils'
import { clickSubmit, fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import {
  useCreateConnector,
  useGetConnectorListV2,
  useGetTestConnectionResult,
  useUpdateConnector
} from 'services/cd-ng'
import CreateCeGcpConnector from '../CreateCeGcpConnector'

const commonProps = {
  accountId: 'dummy',
  orgIdentifier: '',
  projectIdentifier: '',
  setIsEditMode: noop,
  onClose: noop,
  onSuccess: noop
}

jest.mock('services/cd-ng')
const useGetConnectorListV2Mock = useGetConnectorListV2 as jest.MockedFunction<any>
const useUpdateConnectorMock = useUpdateConnector as jest.MockedFunction<any>
const useCreateConnectorMock = useCreateConnector as jest.MockedFunction<any>
const useGetTestConnectionResultMock = useGetTestConnectionResult as jest.MockedFunction<any>

jest.mock('services/ce', () => ({
  useGcpserviceaccount: jest.fn().mockImplementation(() => ({
    status: 'SUCCESS',
    data: {
      data: 'harness-ce-kmpys-27520@ccm-play.iam.gserviceaccount.com'
    },
    loading: false
  }))
}))

useGetConnectorListV2Mock.mockImplementation(() => ({
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

useUpdateConnectorMock.mockImplementation(() => ({
  mutate: async () => {
    return {
      status: 'SUCCESS'
    }
  },
  loading: false
}))

useCreateConnectorMock.mockImplementation(() => ({
  mutate: async () => {
    return {
      status: 'SUCCESS'
    }
  },
  loading: false
}))

useGetTestConnectionResultMock.mockImplementation(() => ({
  mutate: async () => {
    return {
      status: 'SUCCESS'
    }
  },
  loading: false
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

  test('should throw an error when connectors already exist for a given gcpProjectId', async () => {
    useGetConnectorListV2Mock.mockImplementation(() => ({
      mutate: async () => {
        return {
          status: 'SUCCESS',
          data: {
            pageItemCount: 2,
            content: []
          }
        }
      }
    }))

    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateCeGcpConnector {...commonProps} isEditMode={false} connectorInfo={undefined} />
      </TestWrapper>
    )

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

    expect(getByText('connectors.ceAws.overview.alreadyExist')).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})
