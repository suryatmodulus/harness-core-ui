import React from 'react'
import { fireEvent, render, waitFor, act } from '@testing-library/react'
import { Container, Button } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { accountPathProps, projectPathProps, modulePathProps } from '@common/utils/routeUtils'
import * as dbHook from '@cv/hooks/IndexedDBHook/IndexedDBHook'
import Service from '../Service'
import { editModeData, onUpdatePayload } from './Service.mock'

const paramsEditMode = { ...accountPathProps, ...projectPathProps, ...modulePathProps, identifier: ':identifier' }
const testWrapperProps: TestWrapperProps = {
  path: routes.toCVAddMonitoringServicesEdit(paramsEditMode),
  pathParams: {
    module: 'cv',
    accountId: '1234_accountId',
    projectIdentifier: '1234_project',
    orgIdentifier: '1234_org',
    identifier: 'ms101'
  }
}

jest.mock('@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment', () => ({
  useGetHarnessServices: () => ({
    serviceOptions: [
      { label: 'service1', value: 'service1' },
      { label: 'AppDService101', value: 'AppDService101' }
    ]
  }),
  HarnessServiceAsFormField: function MockComponent(props: any) {
    return (
      <Container>
        <Button
          className="addService"
          onClick={() => props.serviceProps.onNewCreated({ name: 'newService', identifier: 'newService' })}
        />
      </Container>
    )
  },
  HarnessEnvironmentAsFormField: function MockComponent(props: any) {
    return (
      <Container>
        <Button
          className="addEnv"
          onClick={() => props.environmentProps.onNewCreated({ name: 'newEnv', identifier: 'newEnv' })}
        />
      </Container>
    )
  },
  useGetHarnessEnvironments: () => {
    return {
      environmentOptions: [
        { label: 'env1', value: 'env1' },
        { label: 'AppDTestEnv1', value: 'AppDTestEnv1' }
      ]
    }
  }
}))

const fetchMonitoredServiceYAML = jest.fn(() => Promise.resolve({ data: {} }))
const updateMonitoredService = jest.fn()

jest.mock('services/cv', () => ({
  useSaveMonitoredService: jest
    .fn()
    .mockImplementation(() => ({ loading: false, error: null, data: {}, refetch: jest.fn() })),
  useUpdateMonitoredService: jest
    .fn()
    .mockImplementation(() => ({ loading: false, error: null, data: {}, mutate: updateMonitoredService })),
  useGetMonitoredService: jest
    .fn()
    .mockImplementation(() => ({ loading: false, error: null, data: editModeData, refetch: jest.fn() })),
  useGetMonitoredServiceYamlTemplate: jest
    .fn()
    .mockImplementation(() => ({ loading: false, error: null, data: {}, refetch: fetchMonitoredServiceYAML }))
}))

describe('Verify Service', () => {
  test('Monitored service is poplulated in Edit mode', async () => {
    jest.spyOn(dbHook, 'useIndexedDBHook').mockReturnValue({
      dbInstance: {
        put: jest.fn(),
        get: jest.fn().mockReturnValue(undefined)
      } as any,
      isInitializingDB: false
    })
    const { container, getByText } = render(
      <TestWrapper {...testWrapperProps}>
        <Service />
      </TestWrapper>
    )
    // name
    await waitFor(() => expect(container.querySelector('input[value="Monitored Service 101"]')).toBeTruthy())
    // description
    await waitFor(() => expect(getByText('Monitored Service with change source and health source')).toBeTruthy())

    // Change Source populates
    await waitFor(() =>
      expect(container.querySelectorAll('.changeSourceTableWrapper .body [role="row"]').length).toEqual(1)
    )
    await waitFor(() => expect(getByText('PagerDuty 101')).toBeTruthy()) // name
    await waitFor(() => expect(getByText('Alert')).toBeTruthy()) // type
    await waitFor(() => expect(container.querySelector('span[data-icon="service-pagerduty"]')).toBeTruthy()) // source icon

    // Health Source populates
    await waitFor(() =>
      expect(container.querySelectorAll('.healthSourceTableWrapper .body [role="row"]').length).toEqual(1)
    )
    await waitFor(() => expect(getByText('Splunk 102')).toBeTruthy()) // name
    await waitFor(() => expect(getByText('pipeline.verification.analysisTab.logs')).toBeTruthy()) // type
    await waitFor(() => expect(container.querySelector('span[data-icon="service-splunk"]')).toBeTruthy()) // source icon

    // Click Save to update
    await waitFor(() => expect(getByText('save')).toBeTruthy())
    act(() => {
      fireEvent.click(getByText('save'))
    })

    // onSave works
    await waitFor(() => expect(updateMonitoredService).toHaveBeenCalledWith(onUpdatePayload))

    expect(container).toMatchSnapshot()
  })
})
