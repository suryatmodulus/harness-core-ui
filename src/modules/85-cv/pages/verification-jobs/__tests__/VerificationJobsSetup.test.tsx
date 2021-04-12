import React from 'react'
import { render, waitFor, queryByText, fireEvent } from '@testing-library/react'
import type { UseGetReturn } from 'restful-react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import * as cvService from 'services/cv'
import * as cdService from 'services/cd-ng'
import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import VerificationJobsSetup from '../VerificationJobsSetup'

const MockHealthVerificationJobResponse = {
  metaData: {},
  data: {
    identifier: 'sdfsfdsf',
    jobName: 'sdfsfdsf',
    serviceIdentifier: 'asdasdadsd',
    envIdentifier: 'test',
    projectIdentifier: 'raghu_p',
    orgIdentifier: 'harness_test',
    activitySourceIdentifier: 'k8',
    dataSources: null,
    monitoringSources: ['appdtest'],
    duration: '15m',
    type: 'HEALTH',
    defaultJob: false
  },
  responseMessages: []
}

const MockBlueGreenVerificationJobResponse = {
  metaData: {},
  data: {
    identifier: 'sdfsfdsf',
    jobName: 'sdfsfdsf',
    serviceIdentifier: 'asdasdadsd',
    envIdentifier: 'test',
    projectIdentifier: 'raghu_p',
    orgIdentifier: 'harness_test',
    activitySourceIdentifier: 'cdSource',
    dataSources: null,
    monitoringSources: ['appdtest'],
    duration: '15m',
    sensitivity: 'MEDIUM',
    trafficSplitPercentage: 5,
    type: 'BLUE_GREEN',
    defaultJob: false
  },
  responseMessages: []
}

const MockTestVerificationJobResponse = {
  metaData: {},
  data: {
    identifier: 'sdfsfdsf',
    jobName: 'sdfsfdsf',
    serviceIdentifier: 'asdasdadsd',
    envIdentifier: 'test',
    projectIdentifier: 'raghu_p',
    orgIdentifier: 'harness_test',
    activitySourceIdentifier: 'cdSource',
    dataSources: null,
    monitoringSources: ['appdtest'],
    duration: '15m',
    sensitivity: 'LOW',
    baselineVerificationJobInstanceId: null,
    type: 'TEST',
    defaultJob: false
  },
  responseMessages: []
}

const MockActivitySourceResponse = {
  metaData: {},
  data: {
    totalPages: 1,
    totalItems: 1,
    pageItemCount: 1,
    pageSize: 100,
    content: [
      {
        uuid: '12323_ddsf',
        identifier: 'k8',
        name: 'k8',
        createdAt: 1609952915403,
        lastUpdatedAt: 1609952927353,
        connectorIdentifier: 'org.harness_test_ban',
        activitySourceConfigs: [
          {
            serviceIdentifier: 'todolist',
            envIdentifier: 'Prod',
            namespace: 'raghu',
            workloadName: 'harness-example-prod-deployment',
            namespaceRegex: null
          }
        ],
        type: 'KUBERNETES'
      },
      {
        uuid: '1234_activityId',
        identifier: 'cdSource',
        name: 'cdSource',
        createdAt: 1609952915403,
        lastUpdatedAt: 1609952927353,
        connectorIdentifier: 'org.harness_test_ban',
        activitySourceConfigs: [
          {
            serviceIdentifier: 'todolist',
            envIdentifier: 'Prod',
            namespace: 'raghu',
            workloadName: 'harness-example-prod-deployment',
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

const MockServiceResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 4,
    pageItemCount: 4,
    pageSize: 100,
    content: [
      {
        accountId: 'kmpySmUISimoRrJL6NL73w',
        identifier: 'asdasdadsd',
        orgIdentifier: 'harness_test',
        projectIdentifier: 'raghu_p',
        name: 'simpleDo',
        description: null,
        deleted: false,
        tags: {},
        version: 0
      },
      {
        accountId: 'kmpySmUISimoRrJL6NL73w',
        identifier: 'verification',
        orgIdentifier: 'harness_test',
        projectIdentifier: 'raghu_p',
        name: 'verification',
        description: null,
        deleted: false,
        tags: {},
        version: 0
      },
      {
        accountId: 'kmpySmUISimoRrJL6NL73w',
        identifier: 'todolist',
        orgIdentifier: 'harness_test',
        projectIdentifier: 'raghu_p',
        name: 'todolist',
        description: null,
        deleted: false,
        tags: {},
        version: 0
      },
      {
        accountId: 'kmpySmUISimoRrJL6NL73w',
        identifier: 'manager',
        orgIdentifier: 'harness_test',
        projectIdentifier: 'raghu_p',
        name: 'manager',
        description: null,
        deleted: false,
        tags: {},
        version: 0
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: '9556372d-48b8-49a5-9bab-d0b214dd8b7e'
}

const MockEnvironentResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 2,
    pageItemCount: 2,
    pageSize: 100,
    content: [
      {
        accountId: 'kmpySmUISimoRrJL6NL73w',
        orgIdentifier: 'harness_test',
        projectIdentifier: 'raghu_p',
        identifier: 'test',
        name: 'test',
        description: null,
        type: 'PreProduction',
        deleted: false,
        tags: {},
        version: 0
      },
      {
        accountId: 'kmpySmUISimoRrJL6NL73w',
        orgIdentifier: 'harness_test',
        projectIdentifier: 'raghu_p',
        identifier: 'Prod',
        name: 'Prod',
        description: null,
        type: 'Production',
        deleted: false,
        tags: {},
        version: 0
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: '52fa60c8-7816-4e28-9920-4ecbe7c76030'
}

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest.fn().mockImplementation(() => {
    return { isInitializingDB: false, dbInstance: { get: jest.fn(), put: jest.fn() } }
  }),
  CVObjectStoreNames: {}
}))

describe('VerificationJobsSetup', () => {
  test('Render initialy', async () => {
    jest.spyOn(cvService, 'useGetVerificationJob').mockReturnValue({
      refetch: jest.fn() as unknown,
      loading: false
    } as UseGetReturn<any, any, any, any>)

    jest.spyOn(cvService, 'useListAllSupportedDataSource').mockReturnValue({
      refetch: jest.fn() as unknown,
      data: null,
      loading: false
    } as UseGetReturn<any, any, any, any>)

    jest
      .spyOn(cvService, 'useListActivitySources')
      .mockReturnValue({ data: MockActivitySourceResponse } as UseGetReturn<any, any, any, any>)
    jest.spyOn(cvService, 'useGetMonitoringSources').mockReturnValue({} as UseGetReturn<any, any, any, any>)

    const { container } = render(
      <TestWrapper
        path={routes.toCVAdminSetupVerificationJob({ ...accountPathProps, ...projectPathProps })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG'
        }}
      >
        <VerificationJobsSetup />
      </TestWrapper>
    )
    await waitFor(() => expect(queryByText(container, 'verificationJobs')).not.toBeNull())
    expect(container).toMatchSnapshot()
  })

  test('Ensure tabs are rendered in edit mode - health verification', async () => {
    jest.spyOn(cvService, 'useGetVerificationJob').mockReturnValue({
      refetch: jest.fn() as unknown,
      loading: false,
      data: MockHealthVerificationJobResponse
    } as UseGetReturn<any, any, any, any>)

    jest.spyOn(cvService, 'useListAllSupportedDataSource').mockReturnValue({
      refetch: jest.fn() as unknown,
      data: null,
      loading: false
    } as UseGetReturn<any, any, any, any>)

    jest
      .spyOn(cvService, 'useListActivitySources')
      .mockReturnValue({ data: MockActivitySourceResponse } as UseGetReturn<any, any, any, any>)
    jest.spyOn(cvService, 'useGetMonitoringSources').mockReturnValue({} as UseGetReturn<any, any, any, any>)

    jest.spyOn(cdService, 'useGetEnvironmentListForProject').mockReturnValue({
      data: MockEnvironentResponse
    } as UseGetReturn<any, any, any, any>)
    jest.spyOn(cdService, 'useGetServiceListForProject').mockReturnValue({
      data: MockServiceResponse
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
        <VerificationJobsSetup />
      </TestWrapper>
    )

    await waitFor(() => expect(queryByText(container, 'verificationJobs')).not.toBeNull())
    fireEvent.click(getByText('Next'))
    await waitFor(() => expect(getByText('cv.verificationJobs.configure.heading')).not.toBeNull())
    await waitFor(() => expect(getByText('health')).not.toBeNull())
  })

  test('Ensure tabs are rendered in edit mode - test verification', async () => {
    jest.spyOn(cvService, 'useGetVerificationJob').mockReturnValue({
      refetch: jest.fn() as unknown,
      loading: false,
      data: MockTestVerificationJobResponse
    } as UseGetReturn<any, any, any, any>)

    jest.spyOn(cvService, 'useListAllSupportedDataSource').mockReturnValue({
      refetch: jest.fn() as unknown,
      data: null,
      loading: false
    } as UseGetReturn<any, any, any, any>)

    jest
      .spyOn(cvService, 'useListActivitySources')
      .mockReturnValue({ data: MockActivitySourceResponse } as UseGetReturn<any, any, any, any>)
    jest.spyOn(cvService, 'useGetMonitoringSources').mockReturnValue({} as UseGetReturn<any, any, any, any>)

    jest.spyOn(cdService, 'useGetEnvironmentListForProject').mockReturnValue({
      data: MockEnvironentResponse
    } as UseGetReturn<any, any, any, any>)
    jest.spyOn(cdService, 'useGetServiceListForProject').mockReturnValue({
      data: MockServiceResponse
    } as UseGetReturn<any, any, any, any>)

    jest.spyOn(cvService, 'useListBaselineExecutions').mockReturnValue({
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
        <VerificationJobsSetup />
      </TestWrapper>
    )

    await waitFor(() => expect(queryByText(container, 'verificationJobs')).not.toBeNull())
    fireEvent.click(getByText('Next'))
    await waitFor(() => expect(getByText('cv.verificationJobs.configure.heading')).not.toBeNull())
    await waitFor(() => expect(getByText('test')).not.toBeNull())
  })

  test('Ensure tabs are rendered in edit mode - blue green verification', async () => {
    jest.spyOn(cvService, 'useGetVerificationJob').mockReturnValue({
      refetch: jest.fn() as unknown,
      loading: false,
      data: MockBlueGreenVerificationJobResponse
    } as UseGetReturn<any, any, any, any>)

    jest.spyOn(cvService, 'useListAllSupportedDataSource').mockReturnValue({
      refetch: jest.fn() as unknown,
      data: null,
      loading: false
    } as UseGetReturn<any, any, any, any>)

    jest.spyOn(cvService, 'useListActivitySources').mockReturnValue({} as UseGetReturn<any, any, any, any>)
    jest.spyOn(cvService, 'useGetMonitoringSources').mockReturnValue({} as UseGetReturn<any, any, any, any>)

    jest.spyOn(cdService, 'useGetEnvironmentListForProject').mockReturnValue({
      data: MockEnvironentResponse
    } as UseGetReturn<any, any, any, any>)
    jest.spyOn(cdService, 'useGetServiceListForProject').mockReturnValue({
      data: MockServiceResponse
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
        <VerificationJobsSetup />
      </TestWrapper>
    )

    await waitFor(() => expect(queryByText(container, 'verificationJobs')).not.toBeNull())
    fireEvent.click(getByText('Next'))
    await waitFor(() => expect(getByText('cv.verificationJobs.configure.heading')).not.toBeNull())
    await waitFor(() => expect(getByText('blueGreen')).not.toBeNull())
  })

  test('Ensure that when api returns runtime values, it is transformed correctly for test verification', async () => {
    jest.spyOn(cvService, 'useGetVerificationJob').mockReturnValue({
      refetch: jest.fn() as unknown,
      loading: false,
      data: {
        data: {
          identifier: 'sdfsfdsf',
          jobName: 'sdfsfdsf',
          serviceIdentifier: RUNTIME_INPUT_VALUE,
          envIdentifier: RUNTIME_INPUT_VALUE,
          projectIdentifier: 'raghu_p',
          orgIdentifier: 'harness_test',
          activitySourceIdentifier: 'mmm',
          dataSources: null,
          monitoringSources: ['appdtest'],
          duration: RUNTIME_INPUT_VALUE,
          sensitivity: RUNTIME_INPUT_VALUE,
          baselineVerificationJobInstanceId: null,
          type: 'TEST',
          defaultJob: false
        }
      }
    } as UseGetReturn<any, any, any, any>)

    jest.spyOn(cvService, 'useListAllSupportedDataSource').mockReturnValue({
      refetch: jest.fn() as unknown,
      data: null,
      loading: false
    } as UseGetReturn<any, any, any, any>)

    jest
      .spyOn(cvService, 'useListActivitySources')
      .mockReturnValue({ data: MockActivitySourceResponse } as UseGetReturn<any, any, any, any>)
    jest.spyOn(cvService, 'useGetMonitoringSources').mockReturnValue({} as UseGetReturn<any, any, any, any>)

    jest.spyOn(cdService, 'useGetEnvironmentListForProject').mockReturnValue({
      data: MockEnvironentResponse
    } as UseGetReturn<any, any, any, any>)
    jest.spyOn(cdService, 'useGetServiceListForProject').mockReturnValue({
      data: MockServiceResponse
    } as UseGetReturn<any, any, any, any>)

    jest.spyOn(cvService, 'useListBaselineExecutions').mockReturnValue({
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
        <VerificationJobsSetup />
      </TestWrapper>
    )

    await waitFor(() => expect(queryByText(container, 'verificationJobs')).not.toBeNull())
    fireEvent.click(getByText('Next'))
    await waitFor(() => expect(getByText('cv.verificationJobs.configure.heading')).not.toBeNull())
    const runTimeParams = container.querySelectorAll(`input[value="${RUNTIME_INPUT_VALUE}"]`)
    expect(container.querySelectorAll(`input[value="${RUNTIME_INPUT_VALUE}"]`).length).toBe(5)
    const expectedRunTimeParams = [
      'baselineVerificationJobInstanceId',
      'service',
      'environment',
      'duration',
      'sensitivity',
      'baseline'
    ]
    for (const param of runTimeParams) {
      expect(expectedRunTimeParams).toContain(param.getAttribute('name'))
    }
  })

  test('Ensure that when api returns runtime values (with null for sensitivity and trafficSplit), it is transformed correctly for CANARY verification', async () => {
    jest.spyOn(cvService, 'useGetVerificationJob').mockReturnValue({
      refetch: jest.fn() as unknown,
      loading: false,
      data: {
        data: {
          identifier: 'sdfsfdsf',
          jobName: 'sdfsfdsf',
          serviceIdentifier: RUNTIME_INPUT_VALUE,
          envIdentifier: RUNTIME_INPUT_VALUE,
          projectIdentifier: 'raghu_p',
          orgIdentifier: 'harness_test',
          activitySourceIdentifier: 'mmm',
          dataSources: null,
          monitoringSources: ['appdtest'],
          duration: RUNTIME_INPUT_VALUE,
          sensitivity: null,
          trafficSplitPercentage: null,
          type: 'CANARY',
          defaultJob: false
        }
      }
    } as UseGetReturn<any, any, any, any>)

    jest.spyOn(cvService, 'useListAllSupportedDataSource').mockReturnValue({
      refetch: jest.fn() as unknown,
      data: null,
      loading: false
    } as UseGetReturn<any, any, any, any>)

    jest
      .spyOn(cvService, 'useListActivitySources')
      .mockReturnValue({ data: MockActivitySourceResponse } as UseGetReturn<any, any, any, any>)
    jest.spyOn(cvService, 'useGetMonitoringSources').mockReturnValue({} as UseGetReturn<any, any, any, any>)

    jest.spyOn(cdService, 'useGetEnvironmentListForProject').mockReturnValue({
      data: MockEnvironentResponse
    } as UseGetReturn<any, any, any, any>)
    jest.spyOn(cdService, 'useGetServiceListForProject').mockReturnValue({
      data: MockServiceResponse
    } as UseGetReturn<any, any, any, any>)

    jest.spyOn(cvService, 'useListBaselineExecutions').mockReturnValue({
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
        <VerificationJobsSetup />
      </TestWrapper>
    )

    await waitFor(() => expect(queryByText(container, 'verificationJobs')).not.toBeNull())
    fireEvent.click(getByText('Next'))
    await waitFor(() => expect(getByText('cv.verificationJobs.configure.heading')).not.toBeNull())
    await waitFor(() => expect(container.querySelector(`input[value="${RUNTIME_INPUT_VALUE}"]`)).not.toBeNull())
    const dynamicFields = container.querySelectorAll(`input[value="${RUNTIME_INPUT_VALUE}"]`)
    expect(dynamicFields.length).toBe(5)
  })

  test('Ensure that when api returns runtime values, it is transformed correctly for blue green verification', async () => {
    jest.spyOn(cvService, 'useGetVerificationJob').mockReturnValue({
      refetch: jest.fn() as unknown,
      loading: false,
      data: {
        data: {
          identifier: 'sdfsfdsf',
          jobName: 'sdfsfdsf',
          serviceIdentifier: 'asdasdadsd',
          envIdentifier: 'test',
          projectIdentifier: 'raghu_p',
          orgIdentifier: 'harness_test',
          dataSources: null,
          activitySourceIdentifier: 'mmm',
          monitoringSources: ['appdtest'],
          duration: '15m',
          sensitivity: RUNTIME_INPUT_VALUE,
          trafficSplitPercentage: RUNTIME_INPUT_VALUE,
          type: 'BLUE_GREEN',
          defaultJob: false
        }
      }
    } as UseGetReturn<any, any, any, any>)

    jest.spyOn(cvService, 'useListAllSupportedDataSource').mockReturnValue({
      refetch: jest.fn() as unknown,
      data: null,
      loading: false
    } as UseGetReturn<any, any, any, any>)

    jest
      .spyOn(cvService, 'useListActivitySources')
      .mockReturnValue({ data: MockActivitySourceResponse } as UseGetReturn<any, any, any, any>)
    jest.spyOn(cvService, 'useGetMonitoringSources').mockReturnValue({} as UseGetReturn<any, any, any, any>)

    jest.spyOn(cdService, 'useGetEnvironmentListForProject').mockReturnValue({
      data: MockEnvironentResponse
    } as UseGetReturn<any, any, any, any>)
    jest.spyOn(cdService, 'useGetServiceListForProject').mockReturnValue({
      data: MockServiceResponse
    } as UseGetReturn<any, any, any, any>)

    jest.spyOn(cvService, 'useListBaselineExecutions').mockReturnValue({
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
        <VerificationJobsSetup />
      </TestWrapper>
    )

    await waitFor(() => expect(queryByText(container, 'verificationJobs')).not.toBeNull())
    fireEvent.click(getByText('Next'))
    await waitFor(() => expect(getByText('cv.verificationJobs.configure.heading')).not.toBeNull())
    const dynamicFields = container.querySelectorAll(`input[value="${RUNTIME_INPUT_VALUE}"]`)
    expect(dynamicFields.length).toBe(2)
    expect(dynamicFields[1].getAttribute('name')).toEqual('trafficSplit')
    expect(dynamicFields[0].getAttribute('name')).toEqual('sensitivity')
  })
})
