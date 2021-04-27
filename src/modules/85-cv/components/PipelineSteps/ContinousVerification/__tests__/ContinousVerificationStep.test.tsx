import React from 'react'
import { fireEvent, queryByAttribute, render, waitFor } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { ContinousVerificationStep } from '../ContinousVerificationStep'

const jobsData = {
  data: [
    {
      identifier: 'test11212',
      jobName: 'test-11212',
      serviceIdentifier: '<+input>',
      serviceName: null,
      envIdentifier: '<+input>',
      envName: null,
      projectIdentifier: 'test1',
      orgIdentifier: 'default',
      activitySourceIdentifier: 'cd_nextgen_activity_source',
      dataSources: null,
      monitoringSources: ['AppDynamics'],
      verificationJobUrl:
        '/cv/api/verification-job?accountId=kmpySmUISimoRrJL6NL73w&orgIdentifier=default&projectIdentifier=test1&identifier=test11212',
      duration: '5m',
      sensitivity: 'HIGH',
      trafficSplitPercentage: 5,
      type: 'BLUE_GREEN',
      defaultJob: false
    }
  ]
}

jest.mock('services/cv', () => ({
  useCDNGVerificationJobs: jest.fn().mockImplementation(() => ({ loading: false, data: jobsData, error: false }))
}))

jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => ({ children }: { children: JSX.Element }) => (
  <div>{children}</div>
))

describe('Test ContinousVerificationStep Step', () => {
  beforeEach(() => {
    factory.registerStep(new ContinousVerificationStep())
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should render editView when a new step is added', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.Verify} stepViewType={StepViewType.Edit} />
    )

    expect(container).toMatchSnapshot()
  })

  test('should render editView when current step is being edited', () => {
    const initialValues = {
      type: 'ContinousVerification',
      identifier: 'ContinousVerification',
      name: 'CV',
      spec: {
        verificationJobRef: 'Blue Green Job',
        type: 'BLUE_GREEN',
        spec: {
          sensitivity: 'Low',
          duration: '15min',
          baseline: 'Last successful job run',
          trafficsplit: '5%',
          service: 'dockerservice',
          env: 'preprod',
          deploymentTag: '1.2'
        }
      }
    }
    const { container } = render(
      <TestStepWidget initialValues={initialValues} type={StepType.Verify} stepViewType={StepViewType.Edit} />
    )

    expect(container).toMatchSnapshot()
  })

  test('should render editView when current step is being edited and runtime inputs are passed', () => {
    const initialValues = {
      type: 'ContinousVerification',
      identifier: 'ContinousVerification',
      name: 'CV',
      spec: {
        verificationJobRef: 'Blue Green Job',
        type: 'BLUE_GREEN',
        spec: {
          sensitivity: '<+input>',
          duration: '<+input>',
          baseline: '<+input>',
          trafficsplit: '<+input>',
          service: 'dockerservice',
          env: 'preprod',
          deploymentTag: '1.2'
        }
      }
    }
    const { container } = render(
      <TestStepWidget initialValues={initialValues} type={StepType.Verify} stepViewType={StepViewType.Edit} />
    )

    expect(container).toMatchSnapshot()
  })

  test('renders inputSetView', () => {
    const onUpdate = jest.fn()
    const initialValues = {
      type: 'ContinousVerification',
      identifier: 'ContinousVerification',
      name: 'CV',
      spec: {
        verificationJobRef: 'Blue Green Job',
        type: 'BLUE_GREEN',
        spec: {
          sensitivity: RUNTIME_INPUT_VALUE,
          duration: RUNTIME_INPUT_VALUE,
          baseline: RUNTIME_INPUT_VALUE,
          trafficsplit: RUNTIME_INPUT_VALUE,
          service: RUNTIME_INPUT_VALUE,
          env: RUNTIME_INPUT_VALUE,
          deploymentTag: RUNTIME_INPUT_VALUE
        }
      }
    }
    const { container } = render(
      <TestStepWidget
        initialValues={{}}
        template={initialValues}
        type={StepType.Verify}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdate}
        path=""
      />
    )

    expect(container).toMatchSnapshot()
  })

  test('renders empty inputSetView', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{}}
        template={{}}
        type={StepType.Verify}
        stepViewType={StepViewType.InputSet}
        path=""
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('shows different interface when the api call to fetch CV jobs is completed', async () => {
    const onUpdate = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.Verify}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        ref={ref}
      />
    )
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'CV Step' } })

    fireEvent.click(getByText('connectors.cdng.defineVerificationJob'))
    await waitFor(() => {
      expect(getByText('connectors.cdng.jobName')).toBeTruthy()
    })

    fireEvent.click(getByText('connectors.cdng.configureVerificationJob'))
    await waitFor(() => {
      expect(getByText('connectors.cdng.selectTheJobNameFirst')).toBeTruthy()
    })
  })
})
