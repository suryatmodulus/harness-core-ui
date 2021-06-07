import React from 'react'
import { render } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { TestWrapperProps, TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import {
  FormControlButtons,
  basicValidation,
  useFormSubmit,
  sensitivityEnunToLabel,
  baselineEnumToLabel,
  useVerificationJobFormSubmit
} from '../VerificationJobFormCommons'
import type { VerificationSensitivity } from '../../VerificationJobsSetup'

const testWrapperProps: TestWrapperProps = {
  path: routes.toCVActivityDashboard({ ...accountPathProps, ...projectPathProps }),
  pathParams: {
    accountId: 'testAcc',
    projectIdentifier: 'projectId',
    orgIdentifier: 'orgId'
  }
}

const testEditModeWrapperProps: TestWrapperProps = {
  path: routes.toCVAdminSetupVerificationJobEdit({
    ...accountPathProps,
    ...projectPathProps,
    verificationId: ':verificationId'
  }),
  pathParams: {
    verificationId: 'test',
    accountId: 'testAcc1212',
    projectIdentifier: 'projectId',
    orgIdentifier: 'orgId',
    activitySourceId: 'test',
    activitySource: 'test'
  }
}

const callSaveVerification = jest.fn()
const callUpdateVerification = jest.fn()

jest.mock('services/cv', () => ({
  useCreateVerificationJob: jest.fn().mockImplementation(() => ({
    mutate: callSaveVerification
  })),
  useUpdateVerificationJob: jest.fn().mockImplementation(() => ({
    mutate: callUpdateVerification
  }))
}))

const customTestWrapper: React.FC<TestWrapperProps> = props => (
  <TestWrapper {...testEditModeWrapperProps}> {props.children} </TestWrapper>
)

describe('VerificationJobFormCommons editmode', () => {
  test('check api is called in edit mode when edit mode is TRUE', async () => {
    const { result } = renderHook(() => useVerificationJobFormSubmit(), { wrapper: customTestWrapper })
    result.current.onSubmit({
      identifier: 'id',
      jobName: 'jobName',
      verificationId: 'test',
      projectIdentifier: 'projectIdentifier',
      orgIdentifier: 'orgIdentifier',
      environment: 'envIdentifier',
      service: { value: 'value' },
      dataSource: [{ value: 'datasource', label: 'label' }]
    })

    expect(callUpdateVerification).toBeCalled()
  })
})

describe('VerificationJobFormCommons', () => {
  test('check api is called', async () => {
    const { result } = renderHook(() => useFormSubmit(), { wrapper: TestWrapper })

    result.current.onSubmit({
      identifier: 'id',
      jobName: 'jobName',
      projectIdentifier: 'projectIdentifier',
      orgIdentifier: 'orgIdentifier',
      environment: 'envIdentifier',
      service: { value: 'value' },
      dataSource: [{ value: 'datasource', label: 'label' }]
    })

    expect(callSaveVerification).toBeCalled()
  })

  test('check api is called in when edit mode is FALSE', async () => {
    const { result } = renderHook(() => useVerificationJobFormSubmit(), {
      wrapper: TestWrapper
    })
    result.current.onSubmit({
      identifier: 'id',
      jobName: 'jobName',
      verificationId: 'test',
      projectIdentifier: 'projectIdentifier',
      orgIdentifier: 'orgIdentifier',
      environment: 'envIdentifier',
      service: { value: 'value' },
      dataSource: [{ value: 'datasource', label: 'label' }]
    })

    expect(callSaveVerification).toBeCalled()
  })

  test('check api is called when selected ALL monitering sources', async () => {
    const { result } = renderHook(() => useVerificationJobFormSubmit(), {
      wrapper: TestWrapper
    })
    result.current.onSubmit({
      identifier: 'id',
      jobName: 'jobName',
      verificationId: 'test',
      projectIdentifier: 'projectIdentifier',
      orgIdentifier: 'orgIdentifier',
      environment: 'envIdentifier',
      service: { value: 'value' },
      dataSource: [
        { value: 'datasource', label: 'label' },
        { value: 'datasource1', label: 'label1' },
        { value: 'all', label: 'all' }
      ]
    })
    expect(callSaveVerification).toHaveBeenCalledWith(expect.objectContaining({ allMonitoringSourcesEnabled: true }))
  })

  test('Ensure sensitivity labels are correct', () => {
    expect(sensitivityEnunToLabel('HIGH' as VerificationSensitivity)).toEqual('High')
    expect(sensitivityEnunToLabel('MEDIUM' as VerificationSensitivity)).toEqual('Medium')
    expect(sensitivityEnunToLabel('LOW' as VerificationSensitivity)).toEqual('Low')
  })

  test('Ensure baseline labels are correct', () => {
    expect(baselineEnumToLabel('LAST' as string)).toEqual('Last Successful run')
    expect(baselineEnumToLabel(1612376957777))
  })

  test('formControllerBtn render', async () => {
    const { container, getByText } = render(
      <TestWrapper {...testWrapperProps}>
        <FormControlButtons />
      </TestWrapper>
    )
    expect(getByText('Save')).toBeDefined()

    expect(container).toMatchSnapshot()
  })

  test('formControllerBtn render edit', async () => {
    const { container, getByText } = render(
      <TestWrapper {...testEditModeWrapperProps}>
        <FormControlButtons />
      </TestWrapper>
    )
    expect(getByText('Save')).toBeDefined()

    expect(container).toMatchSnapshot()
  })

  test('basic validation', async () => {
    // when all required fields are filled
    expect(
      basicValidation({
        jobName: 'jobName',
        service: 'service',
        environment: 'environment',
        dataSource: 'dataSource',
        duration: 'duration'
      })
    ).toMatchObject({})

    // when duration is missed
    expect(
      basicValidation({
        jobName: 'jobName',
        service: 'service',
        environment: 'environment',
        dataSource: 'dataSource'
        //   duration: 'duration'
      })
    ).toMatchObject({ duration: 'Required' })

    // when no required field is available
    expect(basicValidation({})).toEqual({
      dataSource: 'Required',
      duration: 'Required',
      environment: 'Required',
      jobName: 'Required',
      service: 'Required'
    })
  })
})
