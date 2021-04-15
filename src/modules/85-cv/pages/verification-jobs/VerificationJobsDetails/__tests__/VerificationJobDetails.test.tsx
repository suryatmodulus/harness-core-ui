import React from 'react'
import { render, waitFor, queryByText, fireEvent } from '@testing-library/react'
import type { UseGetReturn } from 'restful-react'
import { noop } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import routes from '@common/RouteDefinitions'
import * as cvService from 'services/cv'
import VerificationJobsDetails from '../VerificationJobsDetails'

const mockHistoryPush = jest.fn()

const MockDataSources = {
  metaData: {},
  data: {
    content: [
      {
        type: 'APP_DYNAMICS',
        monitoringSourceName: 'appD',
        monitoringSourceIdentifier: 'appD'
      },
      {
        type: 'STACKDRIVER',
        monitoringSourceName: 'gco',
        monitoringSourceIdentifier: 'gco'
      },
      {
        type: 'SPLUNK',
        monitoringSourceName: 'splunk',
        monitoringSourceIdentifier: 'splunk'
      }
    ]
  },
  responseMessages: []
}
const MockActivitySource = {
  metaData: {},
  data: {
    totalPages: 1,
    totalItems: 1,
    pageItemCount: 1,
    pageSize: 100,
    content: [
      {
        uuid: '5678_id',
        identifier: 'kubernetesSource',
        name: 'kubernetesSource',
        createdAt: 1610678165195,
        lastUpdatedAt: 1610678170312,
        connectorIdentifier: 'somethingThatWorks',
        activitySourceConfigs: [
          {
            serviceIdentifier: 'verification',
            envIdentifier: 'Prod',
            namespace: 'harness',
            workloadName: 'command-library-svc',
            namespaceRegex: null
          },
          {
            serviceIdentifier: 'manager',
            envIdentifier: 'test',
            namespace: 'harness',
            workloadName: 'batch-processing',
            namespaceRegex: null
          },
          {
            serviceIdentifier: 'todolist',
            envIdentifier: 'test',
            namespace: 'harness',
            workloadName: 'elasticsearch-clstr',
            namespaceRegex: null
          }
        ],
        type: 'KUBERNETES'
      },
      {
        uuid: '1234_id',
        identifier: 'cdSource',
        name: 'cdSource',
        createdAt: 1610678165195,
        lastUpdatedAt: 1610678170312,
        connectorIdentifier: 'somethingThatWorks',
        activitySourceConfigs: [
          {
            serviceIdentifier: 'verification',
            envIdentifier: 'Prod',
            namespace: 'harness',
            workloadName: 'command-library-svc',
            namespaceRegex: null
          }
        ],
        type: 'HARNESS_CD10'
      }
    ],
    pageIndex: 0,
    empty: false
  },
  responseMessages: []
}

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as object),
  useHistory: () => ({
    push: mockHistoryPush
  })
}))

describe('VerificationJobsDetails', () => {
  test('Render initiaaly', async () => {
    jest.spyOn(cvService, 'useGetMonitoringSources').mockReturnValue({
      data: null,
      refetch: jest.fn() as any
    } as UseGetReturn<any, any, any, any>)
    jest.spyOn(cvService, 'useListActivitySources').mockReturnValue({
      data: {}
    } as UseGetReturn<any, any, any, any>)

    const { container } = render(
      <TestWrapper
        path={routes.toCVAdminSetupVerificationJob({ ...accountPathProps, ...projectPathProps })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG'
        }}
      >
        <VerificationJobsDetails onNext={() => noop} stepData={{}} />
      </TestWrapper>
    )
    await waitFor(() => expect(queryByText(container, 'cv.verificationJobs.details.heading')).not.toBeNull())
    expect(container).toMatchSnapshot()
  })

  test('Ensure validation message is rendered, on submit', async () => {
    jest.spyOn(cvService, 'useGetMonitoringSources').mockReturnValue({
      data: null,
      refetch: jest.fn() as any
    } as UseGetReturn<any, any, any, any>)
    jest.spyOn(cvService, 'useListActivitySources').mockReturnValue({
      data: {}
    } as UseGetReturn<any, any, any, any>)
    const { container, getByText } = render(
      <TestWrapper
        path={routes.toCVAdminSetupVerificationJob({ ...accountPathProps, ...projectPathProps })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG'
        }}
      >
        <VerificationJobsDetails onNext={() => noop} stepData={{}} />
      </TestWrapper>
    )

    await waitFor(() => expect(queryByText(container, 'cv.verificationJobs.details.heading')).not.toBeNull())

    const submitButton = container.querySelector('button[type="submit"]')
    if (!submitButton) {
      throw Error('Submit button was not rendered.')
    }

    fireEvent.click(submitButton)
    await waitFor(() => getByText('validation.nameRequired'))
    getByText('cv.verificationJobs.validation.dataSource')
    getByText('cv.verificationJobs.validation.type')
  })

  test('Ensure that edit data is rendered, correctly', async () => {
    jest.spyOn(cvService, 'useGetMonitoringSources').mockReturnValue({
      data: MockDataSources,
      refetch: jest.fn() as any
    } as UseGetReturn<any, any, any, any>)
    jest.spyOn(cvService, 'useListActivitySources').mockReturnValue({
      data: MockActivitySource
    } as UseGetReturn<any, any, any, any>)
    const submitFuncMock = jest.fn()

    const { container, getByText } = render(
      <TestWrapper
        path={routes.toCVAdminSetupVerificationJob({ ...accountPathProps, ...projectPathProps })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG'
        }}
      >
        <VerificationJobsDetails onNext={submitFuncMock} stepData={{}} />
      </TestWrapper>
    )

    await waitFor(() => expect(queryByText(container, 'cv.verificationJobs.details.heading')).not.toBeNull())

    await fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'name',
        value: 'asdadas'
      }
    ])

    // select data source
    const dataSourceField = container.querySelector('[class*="MultiSelect"] .bp3-tag-input-values')
    if (!dataSourceField) {
      throw Error('data source field not rendered.')
    }

    // select data source
    fireEvent.click(dataSourceField)
    await waitFor(() => expect(container.querySelector('[class*="MultiSelect--menuItem"]')).not.toBeNull())
    const menuItems = container.querySelectorAll('[class*="MultiSelect--menuItem"]')
    expect(menuItems.length).toBe(4)

    fireEvent.click(menuItems[1])
    await waitFor(() => expect(container.querySelector('[class*="bp3-tag-remove"]')).not.toBeNull())

    // select a change source
    await fillAtForm([
      {
        container,
        type: InputTypes.SELECT,
        fieldId: 'activitySource',
        value: 'cdSource'
      }
    ])

    // select verification job
    fireEvent.click(getByText('blueGreen'))
    await waitFor(() => expect(container.querySelector('div[class*="cardIconSelected"]')))

    const submitButton = container.querySelector('button[type="submit"]')
    if (!submitButton) {
      throw Error('Submit button was not rendered.')
    }

    fireEvent.click(submitButton)

    await waitFor(() =>
      expect(submitFuncMock).toHaveBeenCalledWith({
        activitySource: 'cdSource',
        activitySourceType: 'HARNESS_CD10',
        dataSource: [
          {
            label: 'appD - app_dynamics',
            value: 'appD'
          }
        ],
        dataSourceOptions: [
          {
            label: 'appD - app_dynamics',
            value: 'appD'
          },
          {
            label: 'gco - stackdriver',
            value: 'gco'
          },
          {
            label: 'splunk - splunk',
            value: 'splunk'
          }
        ],
        identifier: 'asdadas',
        name: 'asdadas',
        type: 'BLUE_GREEN'
      })
    )
  })

  test('Ensure that when user changes from canary to health, data is correct', async () => {
    jest.spyOn(cvService, 'useGetMonitoringSources').mockReturnValue({
      data: MockDataSources,
      refetch: jest.fn() as any
    } as UseGetReturn<any, any, any, any>)
    jest.spyOn(cvService, 'useListActivitySources').mockReturnValue({
      data: MockActivitySource
    } as UseGetReturn<any, any, any, any>)
    const submitFuncMock = jest.fn()

    const { container } = render(
      <TestWrapper
        path={routes.toCVAdminSetupVerificationJob({ ...accountPathProps, ...projectPathProps })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG'
        }}
      >
        <VerificationJobsDetails
          onNext={submitFuncMock}
          stepData={{
            dataSource: [{ label: 'All', value: 'All' }],
            activitySource: [{ label: 'cdSource', value: 'cdSource' }],
            identifier: 'sdfsfsdf',
            serviceIdentifier: '1234_service',
            environentIdentifier: '1234_environentIdentifier',
            duration: '15m',
            name: 'sdfsfsdf',
            type: 'CANARY',
            trafficSplit: 5,
            sensitivity: { value: 'LOW', label: 'Low' }
          }}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(queryByText(container, 'cv.verificationJobs.details.heading')).not.toBeNull())
    const jobTypes = container.querySelectorAll('[class*="largeCard"]')
    fireEvent.click(jobTypes[3])

    await waitFor(() => expect(jobTypes[3].getAttribute('class')).toContain('selected'))
    const buttons = container.querySelectorAll('button')
    fireEvent.click(buttons[2])

    await waitFor(() =>
      expect(submitFuncMock).toHaveBeenCalledWith({
        activitySource: [
          {
            label: 'cdSource',
            value: 'cdSource'
          }
        ],
        dataSource: [
          {
            label: 'All',
            value: 'All'
          }
        ],
        dataSourceOptions: [
          {
            label: 'appD - app_dynamics',
            value: 'appD'
          },
          {
            label: 'gco - stackdriver',
            value: 'gco'
          },
          {
            label: 'splunk - splunk',
            value: 'splunk'
          }
        ],
        duration: '15m',
        environentIdentifier: '1234_environentIdentifier',
        identifier: 'sdfsfsdf',
        serviceIdentifier: '1234_service',
        name: 'sdfsfsdf',
        type: 'HEALTH'
      })
    )
  })

  test('Ensure that when user switches from test to blue green, data is correct', async () => {
    jest.spyOn(cvService, 'useGetMonitoringSources').mockReturnValue({
      data: MockDataSources,
      refetch: jest.fn() as any
    } as UseGetReturn<any, any, any, any>)
    jest.spyOn(cvService, 'useListActivitySources').mockReturnValue({
      data: MockActivitySource
    } as UseGetReturn<any, any, any, any>)
    const submitFuncMock = jest.fn()

    const { container } = render(
      <TestWrapper
        path={routes.toCVAdminSetupVerificationJob({ ...accountPathProps, ...projectPathProps })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG'
        }}
      >
        <VerificationJobsDetails
          onNext={submitFuncMock}
          stepData={{
            dataSource: [{ label: 'All', value: 'All' }],
            activitySource: [{ label: 'cdSource', value: 'cdSource' }],
            identifier: 'sdfsfsdf',
            serviceIdentifier: '1234_service',
            environentIdentifier: '1234_environentIdentifier',
            duration: '15m',
            name: 'sdfsfsdf',
            type: 'TEST',
            baseline: 'sdfsf',
            sensitivity: { value: 'LOW', label: 'Low' }
          }}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(queryByText(container, 'cv.verificationJobs.details.heading')).not.toBeNull())
    const jobTypes = container.querySelectorAll('[class*="largeCard"]')
    fireEvent.click(jobTypes[1])

    await waitFor(() => expect(jobTypes[1].getAttribute('class')).toContain('selected'))
    const buttons = container.querySelectorAll('button')
    fireEvent.click(buttons[2])

    await waitFor(() =>
      expect(submitFuncMock).toHaveBeenCalledWith({
        activitySource: [
          {
            label: 'cdSource',
            value: 'cdSource'
          }
        ],
        dataSource: [
          {
            label: 'All',
            value: 'All'
          }
        ],
        dataSourceOptions: [
          {
            label: 'appD - app_dynamics',
            value: 'appD'
          },
          {
            label: 'gco - stackdriver',
            value: 'gco'
          },
          {
            label: 'splunk - splunk',
            value: 'splunk'
          }
        ],
        duration: '15m',
        environentIdentifier: '1234_environentIdentifier',
        identifier: 'sdfsfsdf',
        serviceIdentifier: '1234_service',
        name: 'sdfsfsdf',
        sensitivity: {
          label: 'Low',
          value: 'LOW'
        },
        type: 'BLUE_GREEN'
      })
    )
  })

  test('Ensure that when user switches from blue green to test, data is correct', async () => {
    jest.spyOn(cvService, 'useGetMonitoringSources').mockReturnValue({
      data: MockDataSources,
      refetch: jest.fn() as any
    } as UseGetReturn<any, any, any, any>)
    jest.spyOn(cvService, 'useListActivitySources').mockReturnValue({
      data: MockActivitySource
    } as UseGetReturn<any, any, any, any>)
    const submitFuncMock = jest.fn()

    const { container } = render(
      <TestWrapper
        path={routes.toCVAdminSetupVerificationJob({ ...accountPathProps, ...projectPathProps })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG'
        }}
      >
        <VerificationJobsDetails
          onNext={submitFuncMock}
          stepData={{
            dataSource: [{ label: 'All', value: 'All' }],
            activitySource: [{ label: 'cdSource', value: 'cdSource' }],
            identifier: 'sdfsfsdf',
            serviceIdentifier: '1234_service',
            environentIdentifier: '1234_environentIdentifier',
            duration: '15m',
            name: 'sdfsfsdf',
            type: 'TEST',
            baseline: 'sdfsfd',
            sensitivity: { value: 'LOW', label: 'Low' }
          }}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(queryByText(container, 'cv.verificationJobs.details.heading')).not.toBeNull())
    const jobTypes = container.querySelectorAll('[class*="largeCard"]')
    fireEvent.click(jobTypes[1])

    await waitFor(() => expect(jobTypes[1].getAttribute('class')).toContain('selected'))
    const buttons = container.querySelectorAll('button')
    fireEvent.click(buttons[2])

    await waitFor(() =>
      expect(submitFuncMock).toHaveBeenCalledWith({
        activitySource: [
          {
            label: 'cdSource',
            value: 'cdSource'
          }
        ],
        dataSource: [
          {
            label: 'All',
            value: 'All'
          }
        ],
        dataSourceOptions: [
          {
            label: 'appD - app_dynamics',
            value: 'appD'
          },
          {
            label: 'gco - stackdriver',
            value: 'gco'
          },
          {
            label: 'splunk - splunk',
            value: 'splunk'
          }
        ],
        duration: '15m',
        environentIdentifier: '1234_environentIdentifier',
        identifier: 'sdfsfsdf',
        serviceIdentifier: '1234_service',
        name: 'sdfsfsdf',
        sensitivity: {
          label: 'Low',
          value: 'LOW'
        },
        type: 'BLUE_GREEN'
      })
    )
  })

  test('Ensure that when user changes from health verification to canary, data is correct', async () => {
    jest.spyOn(cvService, 'useGetMonitoringSources').mockReturnValue({
      data: MockDataSources,
      refetch: jest.fn() as any
    } as UseGetReturn<any, any, any, any>)
    jest.spyOn(cvService, 'useListActivitySources').mockReturnValue({
      data: MockActivitySource
    } as UseGetReturn<any, any, any, any>)
    const submitFuncMock = jest.fn()

    const { container } = render(
      <TestWrapper
        path={routes.toCVAdminSetupVerificationJob({ ...accountPathProps, ...projectPathProps })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG'
        }}
      >
        <VerificationJobsDetails
          onNext={submitFuncMock}
          stepData={{
            dataSource: [{ label: 'All', value: 'All' }],
            activitySource: [{ label: 'cdSource', value: 'cdSource' }],
            identifier: 'sdfsfsdf',
            serviceIdentifier: '1234_service',
            environentIdentifier: '1234_environentIdentifier',
            duration: '15m',
            name: 'sdfsfsdf',
            type: 'HEALTH'
          }}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(queryByText(container, 'cv.verificationJobs.details.heading')).not.toBeNull())
    const jobTypes = container.querySelectorAll('[class*="largeCard"]')
    fireEvent.click(jobTypes[2])

    await waitFor(() => expect(jobTypes[2].getAttribute('class')).toContain('selected'))
    const buttons = container.querySelectorAll('button')
    fireEvent.click(buttons[2])

    await waitFor(() =>
      expect(submitFuncMock).toHaveBeenCalledWith({
        activitySource: [
          {
            label: 'cdSource',
            value: 'cdSource'
          }
        ],
        dataSource: [
          {
            label: 'All',
            value: 'All'
          }
        ],
        dataSourceOptions: [
          {
            label: 'appD - app_dynamics',
            value: 'appD'
          },
          {
            label: 'gco - stackdriver',
            value: 'gco'
          },
          {
            label: 'splunk - splunk',
            value: 'splunk'
          }
        ],
        duration: '15m',
        environentIdentifier: '1234_environentIdentifier',
        identifier: 'sdfsfsdf',
        serviceIdentifier: '1234_service',
        name: 'sdfsfsdf',
        type: 'CANARY'
      })
    )
  })

  test('Ensure that when previous button is clicked, user is taken back to verification jobs page', async () => {
    jest.spyOn(cvService, 'useGetMonitoringSources').mockReturnValue({
      data: MockDataSources,
      refetch: jest.fn() as any
    } as UseGetReturn<any, any, any, any>)
    jest.spyOn(cvService, 'useListActivitySources').mockReturnValue({
      data: MockActivitySource
    } as UseGetReturn<any, any, any, any>)
    const submitFuncMock = jest.fn()

    const { container, getByText } = render(
      <TestWrapper
        path={routes.toCVAdminSetupVerificationJob({ ...accountPathProps, ...projectPathProps })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG'
        }}
      >
        <VerificationJobsDetails
          onNext={submitFuncMock}
          stepData={{
            dataSource: [{ label: 'All', value: 'All' }],
            activitySource: [{ label: 'cdSource', value: 'cdSource' }],
            identifier: 'sdfsfsdf',
            serviceIdentifier: '1234_service',
            environentIdentifier: '1234_environentIdentifier',
            duration: '15m',
            name: 'sdfsfsdf',
            type: 'HEALTH'
          }}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(queryByText(container, 'cv.verificationJobs.details.heading')).not.toBeNull())
    fireEvent.click(getByText('Previous'))

    await waitFor(() =>
      expect(mockHistoryPush).toHaveBeenCalledWith(
        '/account/1234_account/cv/orgs/1234_ORG/projects/1234_project/admin/setup?step=3'
      )
    )
  })
})
