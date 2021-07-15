import React from 'react'
import { noop } from 'lodash-es'
import { render, getAllByText } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import { TestWrapper } from '@common/utils/testUtils'
import { clickSubmit, fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import CreateCeAwsConnector from '../CreateCeAwsConnector'

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

jest.mock('services/ce', () => ({
  useAwsaccountconnectiondetail: jest.fn().mockImplementation(() => ({
    status: 'SUCCESS',
    data: {
      externalId: 'harness:108817434118:kmpySmUISimoRrJL6NL73w',
      stackLaunchTemplateLink: 'https://mock.com'
    }
  }))
}))

describe('Create Secret Manager Wizard', () => {
  test('should render form', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateCeAwsConnector {...commonProps} isEditMode={false} connectorInfo={undefined} />
      </TestWrapper>
    )

    //Overview Step
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
        fieldId: 'awsAccountId',
        value: '12345'
      }
    ])

    await act(async () => {
      clickSubmit(container)
    })

    //Cost and Usage Step
    expect(getAllByText(container, 'connectors.ceAws.cur.heading')[0]).toBeDefined()

    //Check if the extention opens
    expect(getAllByText(container, 'How to Create Cost and Usage Report?')[0]).toBeDefined()

    expect(container).toMatchSnapshot()

    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'reportName',
        value: 'rname'
      },
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 's3BucketName',
        value: 'bname'
      }
    ])

    await act(async () => {
      clickSubmit(container)
    })

    //Cross Account Role Step 1
    expect(getAllByText(container, 'connectors.ceAws.crossAccountRoleStep1.heading')[0]).toBeDefined()
    expect(container).toMatchSnapshot()

    await act(async () => {
      clickSubmit(container)
    })

    //Cross Account Role Step 2
    expect(getAllByText(container, 'connectors.ceAws.crossAccountRoleStep2.heading')[0]).toBeDefined()

    //Check if the extention opens
    expect(getAllByText(container, 'Create cross-account IAM role using AWS CloudFormation template')[0]).toBeDefined()

    expect(container).toMatchSnapshot()

    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'crossAccountRoleArn',
        value: 'arn:aws:iam::12345:role/HarnessCERole'
      }
    ])

    await act(async () => {
      clickSubmit(container)
    })

    expect(getAllByText(container, 'connectors.ceAws.testConnection.heading')[0]).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})
