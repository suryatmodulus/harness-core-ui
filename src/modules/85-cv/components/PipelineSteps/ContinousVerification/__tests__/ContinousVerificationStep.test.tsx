import React from 'react'
import { act, findByText, fireEvent, queryByAttribute, render, waitFor } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { ContinousVerificationStep } from '../ContinousVerificationStep'

const jobsData = {
  data: [
    {
      identifier: 'Health Job',
      jobName: 'Health Job',
      serviceIdentifier: '<+service.identifier>',
      serviceName: null,
      envIdentifier: '<+env.identifier>',
      envName: null,
      projectIdentifier: 'Test2',
      orgIdentifier: 'default',
      activitySourceIdentifier: 'cd_nextgen_activity_source',
      dataSources: null,
      monitoringSources: ['AppDynamics'],
      verificationJobUrl:
        '/cv/api/verification-job?accountId=kmpySmUISimoRrJL6NL73w&orgIdentifier=default&projectIdentifier=Test2&identifier=AppDynamics',
      duration: '5m',
      type: 'HEALTH',
      defaultJob: false
    },
    {
      identifier: 'Blue Green',
      jobName: 'Blue Green',
      serviceIdentifier: 'testservice',
      serviceName: null,
      envIdentifier: 'preprod',
      envName: null,
      projectIdentifier: 'Test2',
      orgIdentifier: 'default',
      activitySourceIdentifier: 'cd_nextgen_activity_source',
      dataSources: null,
      monitoringSources: ['AppDynamics'],
      verificationJobUrl:
        '/cv/api/verification-job?accountId=kmpySmUISimoRrJL6NL73w&orgIdentifier=default&projectIdentifier=Test2&identifier=Blue_Green',
      duration: '<+input>',
      sensitivity: '<+input>',
      trafficSplitPercentage: 10,
      type: 'BLUE_GREEN',
      defaultJob: false
    },
    {
      identifier: 'Canary',
      jobName: 'Canary',
      serviceIdentifier: 'testservice',
      serviceName: null,
      envIdentifier: 'preprod',
      envName: null,
      projectIdentifier: 'Test2',
      orgIdentifier: 'default',
      activitySourceIdentifier: 'cd_nextgen_activity_source',
      dataSources: null,
      monitoringSources: ['AppDynamics'],
      verificationJobUrl:
        '/cv/api/verification-job?accountId=kmpySmUISimoRrJL6NL73w&orgIdentifier=default&projectIdentifier=Test2&identifier=Canary',
      duration: '<+input>',
      sensitivity: 'HIGH',
      trafficSplitPercentage: null,
      type: 'CANARY',
      defaultJob: false
    },
    {
      identifier: 'Test type Job with run time service param',
      jobName: 'Test type Job with run time service param',
      serviceIdentifier: '<+input>',
      serviceName: null,
      envIdentifier: 'preprod',
      envName: null,
      projectIdentifier: 'Test2',
      orgIdentifier: 'default',
      activitySourceIdentifier: 'cd_nextgen_activity_source',
      dataSources: null,
      monitoringSources: ['AppDynamics'],
      verificationJobUrl:
        '/cv/api/verification-job?accountId=kmpySmUISimoRrJL6NL73w&orgIdentifier=default&projectIdentifier=Test2&identifier=Test_type_Job_with_run_time_service_param',
      duration: '10m',
      sensitivity: 'MEDIUM',
      baselineVerificationJobInstanceId: 'LAST',
      type: 'TEST',
      defaultJob: false
    }
  ]
}

jest.mock('services/cv', () => ({
  useCDNGVerificationJobs: jest.fn().mockImplementation(() => ({ loading: false, data: jobsData, error: false })),
  useListBaselineExecutions: jest.fn().mockImplementation(() => ({
    metaData: {},
    resource: [],
    responseMessages: []
  }))
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

  test('shows different UI elements under configure job panel with different values when job of type HEALTH is selected', async () => {
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

    //clicking on the select jobs dropdown and selecting the job of type HEALTH
    const defineVJDropdown = container.querySelector('input[name="spec.verificationJobRef"]') as HTMLInputElement
    const selectCaret = container
      .querySelector(`[name="spec.verificationJobRef"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="caret-down"]')
    await waitFor(() => {
      fireEvent.click(selectCaret!)
    })
    const jobToSelect = await findByText(container, 'Health Job')
    act(() => {
      fireEvent.click(jobToSelect)
    })
    expect(defineVJDropdown.value).toBe('Health Job')

    // clicking on the configure Verification Job panel and verifying existence of diffferent UI elements and their values.
    fireEvent.click(getByText('connectors.cdng.configureVerificationJob'))
    await waitFor(() => {
      const serviceDropdown = container.querySelector('input[name="spec.spec.serviceRef"]') as HTMLInputElement
      const durationDropdown = container.querySelector('input[name="spec.spec.duration"]') as HTMLInputElement
      const envDropdown = container.querySelector('input[name="spec.spec.envRef"]') as HTMLInputElement
      const deploymentTagField = container.querySelector('input[name="spec.spec.deploymentTag"]') as HTMLInputElement

      expect(serviceDropdown).toBeTruthy()
      expect(serviceDropdown.value).toBe('<+service.identifier>')

      expect(envDropdown).toBeTruthy()
      expect(envDropdown.value).toBe('<+env.identifier>')

      expect(durationDropdown).toBeTruthy()
      expect(durationDropdown.value).toBe('5 min')

      expect(deploymentTagField).toBeTruthy()
      expect(deploymentTagField.value).toBe('<+serviceConfig.artifacts.primary.tag>')
    })
  })

  test('shows different UI elements under configure job panel with different values when job of type TEST is selected', async () => {
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

    //clicking on the select jobs dropdown and selecting the job of type TEST
    const defineVJDropdown = container.querySelector('input[name="spec.verificationJobRef"]') as HTMLInputElement
    const selectCaret = container
      .querySelector(`[name="spec.verificationJobRef"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="caret-down"]')
    await waitFor(() => {
      fireEvent.click(selectCaret!)
    })
    const jobToSelect = await findByText(container, 'Test type Job with run time service param')
    act(() => {
      fireEvent.click(jobToSelect)
    })
    expect(defineVJDropdown.value).toBe('Test type Job with run time service param')

    // clicking on the configure Verification Job panel and verifying existence of diffferent UI elements and their values.
    fireEvent.click(getByText('connectors.cdng.configureVerificationJob'))
    await waitFor(() => {
      const serviceDropdown = container.querySelector('input[name="spec.spec.serviceRef"]') as HTMLInputElement
      const envDropdown = container.querySelector('input[name="spec.spec.envRef"]') as HTMLInputElement
      const durationDropdown = container.querySelector('input[name="spec.spec.duration"]') as HTMLInputElement
      const sensitivityDropdown = container.querySelector('input[name="spec.spec.sensitivity"]') as HTMLInputElement
      const baselineDropdown = container.querySelector('input[name="spec.spec.baseline"]') as HTMLInputElement
      const deploymentTagField = container.querySelector('input[name="spec.spec.deploymentTag"]') as HTMLInputElement

      expect(serviceDropdown).toBeTruthy()
      expect(serviceDropdown.value).toBe('<+service.identifier>')

      expect(envDropdown).toBeTruthy()
      expect(envDropdown.value).toBe('preprod')

      expect(durationDropdown).toBeTruthy()
      expect(durationDropdown.value).toBe('10 min')

      expect(sensitivityDropdown).toBeTruthy()
      expect(sensitivityDropdown.value).toBe('connectors.cdng.verificationSensitivityLabel.medium')

      expect(baselineDropdown).toBeTruthy()
      expect(baselineDropdown.value).toBe('Last Successful job run')

      expect(deploymentTagField).toBeTruthy()
      expect(deploymentTagField.value).toBe('<+serviceConfig.artifacts.primary.tag>')
    })
  })

  test('shows different UI elements under configure job panel with different values when job of type BLUE GREEN is selected', async () => {
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

    //clicking on the select jobs dropdown and selecting the job of type BLUE GREEN
    const defineVJDropdown = container.querySelector('input[name="spec.verificationJobRef"]') as HTMLInputElement
    const selectCaret = container
      .querySelector(`[name="spec.verificationJobRef"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="caret-down"]')
    await waitFor(() => {
      fireEvent.click(selectCaret!)
    })
    const jobToSelect = await findByText(container, 'Blue Green')
    act(() => {
      fireEvent.click(jobToSelect)
    })
    expect(defineVJDropdown.value).toBe('Blue Green')

    // clicking on the configure Verification Job panel and verifying existence of diffferent UI elements and their values.
    fireEvent.click(getByText('connectors.cdng.configureVerificationJob'))
    await waitFor(() => {
      const serviceDropdown = container.querySelector('input[name="spec.spec.serviceRef"]') as HTMLInputElement
      const envDropdown = container.querySelector('input[name="spec.spec.envRef"]') as HTMLInputElement
      const durationDropdown = container.querySelector('input[name="spec.spec.duration"]') as HTMLInputElement
      const sensitivityDropdown = container.querySelector('input[name="spec.spec.sensitivity"]') as HTMLInputElement
      const trafficsplitDropdown = container.querySelector('input[name="spec.spec.trafficsplit"]') as HTMLInputElement
      const deploymentTagField = container.querySelector('input[name="spec.spec.deploymentTag"]') as HTMLInputElement

      expect(serviceDropdown).toBeTruthy()
      expect(serviceDropdown.value).toBe('testservice')

      expect(envDropdown).toBeTruthy()
      expect(envDropdown.value).toBe('preprod')

      expect(durationDropdown).toBeTruthy()
      expect(durationDropdown.value).toBe('')

      expect(sensitivityDropdown).toBeTruthy()
      expect(sensitivityDropdown.value).toBe('')

      expect(trafficsplitDropdown).toBeTruthy()
      expect(trafficsplitDropdown.value).toBe('10%')

      expect(deploymentTagField).toBeTruthy()
      expect(deploymentTagField.value).toBe('<+serviceConfig.artifacts.primary.tag>')
    })
  })

  test('shows different UI elements under configure job panel with different values when job of type CANARY is selected', async () => {
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

    //clicking on the select jobs dropdown and selecting the job of type CANARY
    const defineVJDropdown = container.querySelector('input[name="spec.verificationJobRef"]') as HTMLInputElement
    const selectCaret = container
      .querySelector(`[name="spec.verificationJobRef"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="caret-down"]')
    await waitFor(() => {
      fireEvent.click(selectCaret!)
    })
    const jobToSelect = await findByText(container, 'Canary')
    act(() => {
      fireEvent.click(jobToSelect)
    })
    expect(defineVJDropdown.value).toBe('Canary')

    // clicking on the configure Verification Job panel and verifying existence of diffferent UI elements and their values.
    fireEvent.click(getByText('connectors.cdng.configureVerificationJob'))
    await waitFor(() => {
      const serviceDropdown = container.querySelector('input[name="spec.spec.serviceRef"]') as HTMLInputElement
      const envDropdown = container.querySelector('input[name="spec.spec.envRef"]') as HTMLInputElement
      const durationDropdown = container.querySelector('input[name="spec.spec.duration"]') as HTMLInputElement
      const sensitivityDropdown = container.querySelector('input[name="spec.spec.sensitivity"]') as HTMLInputElement
      const deploymentTagField = container.querySelector('input[name="spec.spec.deploymentTag"]') as HTMLInputElement

      expect(serviceDropdown).toBeTruthy()
      expect(serviceDropdown.value).toBe('testservice')

      expect(envDropdown).toBeTruthy()
      expect(envDropdown.value).toBe('preprod')

      expect(durationDropdown).toBeTruthy()
      expect(durationDropdown.value).toBe('')

      expect(sensitivityDropdown).toBeTruthy()
      expect(sensitivityDropdown.value).toBe('connectors.cdng.verificationSensitivityLabel.high')

      expect(deploymentTagField).toBeTruthy()
      expect(deploymentTagField.value).toBe('<+serviceConfig.artifacts.primary.tag>')
    })
  })
})
