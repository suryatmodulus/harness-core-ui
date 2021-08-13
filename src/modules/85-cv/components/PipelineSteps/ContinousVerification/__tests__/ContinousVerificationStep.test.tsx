import React from 'react'
import { act, findByText, fireEvent, queryByAttribute, render, waitFor } from '@testing-library/react'
import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { useGetMonitoredServiceFromServiceAndEnvironment } from 'services/cv'
import { ContinousVerificationStep } from '../ContinousVerificationStep'
import {
  mockedMonitoredService,
  mockedMonitoredServiceAndHealthSources,
  PipelineResponse,
  verifyStepInitialValues,
  verifyStepInitialValuesWithRunTimeFields,
  mockedCreatedMonitoredService
} from './ContinousVerificationMocks'
import { getSpecYamlData } from '../utils'

jest.mock('services/cv', () => ({
  useGetMonitoredServiceFromServiceAndEnvironment: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: mockedMonitoredServiceAndHealthSources, error: null })),
  useCreateDefaultMonitoredService: jest.fn().mockImplementation(() => ({
    error: null,
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      return {
        metaData: {},
        resource: mockedCreatedMonitoredService,
        responseMessages: []
      }
    })
  })),
  useListBaselineExecutions: jest.fn().mockImplementation(() => ({
    metaData: {},
    resource: [],
    responseMessages: []
  })),
  useUpdateMonitoredService: () =>
    jest.fn().mockImplementation(() => ({ loading: false, error: null, data: {}, refetch: jest.fn() }))
}))

jest.mock('services/pipeline-ng', () => ({
  useGetPipeline: jest.fn(() => PipelineResponse)
}))

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

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
      name: 'CV Step',
      type: 'ContinousVerification',
      identifier: 'ContinousVerification',
      timeout: '2h',
      spec: {
        monitoredServiceRef: 'monitored-service',
        type: 'Rolling',
        healthSources: [],
        spec: {
          sensitivity: 'Low',
          duration: '15min',
          baseline: 'Last successful job run',
          trafficsplit: '5%',
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
    const initialValues = verifyStepInitialValuesWithRunTimeFields
    const { container } = render(
      <TestStepWidget initialValues={initialValues} type={StepType.Verify} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })

  test('renders inputSetView', () => {
    const onUpdate = jest.fn()
    const initialValues = verifyStepInitialValuesWithRunTimeFields
    const { container } = render(
      <TestStepWidget
        initialValues={{}}
        template={initialValues}
        type={StepType.Verify}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdate}
      />
    )

    expect(container).toMatchSnapshot()
  })

  test('renders empty inputSetView', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} template={{}} type={StepType.Verify} stepViewType={StepViewType.InputSet} />
    )
    expect(container).toMatchSnapshot()
  })

  test('Verify if generating yaml spec works correctly and traffic split field is omitted when verification type is LoadTest', () => {
    const specInfo = {
      sensitivity: {
        label: 'High',
        value: 'HIGH'
      },
      duration: {
        label: '30 min',
        value: '30m'
      },
      baseline: {
        label: 'Last Successful job run',
        value: 'LAST'
      },
      deploymentTag: '<+serviceConfig.artifacts.primary.tag>',
      trafficsplit: ''
    }
    const type = 'LoadTest'
    const recievedYamlSpec = getSpecYamlData(specInfo, type)
    expect(recievedYamlSpec).toEqual({
      sensitivity: 'HIGH',
      duration: '30m',
      baseline: 'LAST',
      deploymentTag: '<+serviceConfig.artifacts.primary.tag>'
    })
  })

  test('Verify if generating yaml spec works correctly and baseline field is omitted when verification type is Bluegreen/Canary', () => {
    const specInfo = {
      sensitivity: {
        label: 'High',
        value: 'HIGH'
      },
      duration: {
        label: '30 min',
        value: '30m'
      },
      baseline: {
        label: 'Last Successful job run',
        value: 'LAST'
      },
      deploymentTag: '<+serviceConfig.artifacts.primary.tag>',
      trafficsplit: '5%'
    }
    const type = 'Bluegreen'
    const recievedYamlSpec = getSpecYamlData(specInfo, type)
    expect(recievedYamlSpec).toEqual({
      sensitivity: 'HIGH',
      duration: '30m',
      trafficsplit: '5%',
      deploymentTag: '<+serviceConfig.artifacts.primary.tag>'
    })
  })

  test('Verify when Monitored service and HealthSource is present for a given service and environment and selected type is rolling update.', async () => {
    const onUpdate = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={verifyStepInitialValues}
        type={StepType.Verify}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        ref={ref}
      />
    )

    // entering the step name
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'CV Step' } })

    // Verify if correct monitoring service is present.
    await waitFor(() => {
      expect(getByText('connectors.cdng.monitoredService.label')).toBeTruthy()
      const monitoredService = container.querySelector('input[name="spec.monitoredServiceRef"]') as HTMLInputElement
      expect(monitoredService).toBeTruthy()
      expect(monitoredService.value).toBe(mockedMonitoredServiceAndHealthSources.data.monitoredService.name)
    })

    // Verify if correct health source is present.
    await waitFor(() => {
      expect(getByText('connectors.cdng.healthSources.label')).toBeTruthy()
      for (const healthSource of mockedMonitoredServiceAndHealthSources.data.monitoredService.sources.healthSources) {
        expect(getByText(healthSource.name)).toBeTruthy()
      }
    })

    //verify if the continous verification type is getting selected correctly.
    const verificationTypeDropdown = container.querySelector('input[name="spec.type"]') as HTMLInputElement
    const selectCaret = container
      .querySelector(`[name="spec.type"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')
    await waitFor(() => {
      fireEvent.click(selectCaret!)
    })
    const typeToSelect = await findByText(container, 'Rolling Update')
    act(() => {
      fireEvent.click(typeToSelect)
    })
    expect(verificationTypeDropdown.value).toBe('Rolling Update')

    // verify if the correct fields are present for the selected verification type of rolling update
    await waitFor(() => {
      const sensitivityDropdown = container.querySelector('input[name="spec.spec.sensitivity"]') as HTMLInputElement
      const durationDropdown = container.querySelector('input[name="spec.spec.duration"]') as HTMLInputElement
      const trafficsplitDropdown = container.querySelector('input[name="spec.spec.trafficsplit"]') as HTMLInputElement
      const deploymentTagField = container.querySelector('input[name="spec.spec.deploymentTag"]') as HTMLInputElement

      expect(sensitivityDropdown).toBeTruthy()
      expect(durationDropdown).toBeTruthy()
      expect(deploymentTagField).toBeTruthy()
      expect(trafficsplitDropdown).toBeTruthy()
    })
  })

  test('Verify when Monitored service and HealthSource is present for a given service and environment and selected type is Load Test.', async () => {
    const onUpdate = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={verifyStepInitialValues}
        type={StepType.Verify}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        ref={ref}
      />
    )

    // entering the step name
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'CV Step' } })

    // Verify if correct monitoring service is present.
    await waitFor(() => {
      expect(getByText('connectors.cdng.monitoredService.label')).toBeTruthy()
      const monitoredService = container.querySelector('input[name="spec.monitoredServiceRef"]') as HTMLInputElement
      expect(monitoredService).toBeTruthy()
      expect(monitoredService.value).toBe(mockedMonitoredServiceAndHealthSources.data.monitoredService.name)
    })

    // Verify if the correct health sources are present.
    await waitFor(() => {
      expect(getByText('connectors.cdng.healthSources.label')).toBeTruthy()
      for (const healthSource of mockedMonitoredServiceAndHealthSources.data.monitoredService.sources.healthSources) {
        expect(getByText(healthSource.name)).toBeTruthy()
      }
    })

    //verify if the continous verification type is getting selected correctly.
    const verificationTypeDropdown = container.querySelector('input[name="spec.type"]') as HTMLInputElement
    const selectCaret = container
      .querySelector(`[name="spec.type"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')
    await waitFor(() => {
      fireEvent.click(selectCaret!)
    })
    const typeToSelect = await findByText(container, 'Load Test')
    act(() => {
      fireEvent.click(typeToSelect)
    })
    expect(verificationTypeDropdown.value).toBe('Load Test')

    // verify if the correct fields are present for the selected verification type of Load Test
    await waitFor(() => {
      const sensitivityDropdown = container.querySelector('input[name="spec.spec.sensitivity"]') as HTMLInputElement
      const durationDropdown = container.querySelector('input[name="spec.spec.duration"]') as HTMLInputElement
      const baselineDropdown = container.querySelector('input[name="spec.spec.baseline"]') as HTMLInputElement
      const deploymentTagField = container.querySelector('input[name="spec.spec.deploymentTag"]') as HTMLInputElement

      expect(sensitivityDropdown).toBeTruthy()
      expect(durationDropdown).toBeTruthy()
      expect(deploymentTagField).toBeTruthy()
      expect(baselineDropdown).toBeTruthy()
    })
  })

  test('Verify when Monitored service is present and HealthSource is not present for a given service and environment ', async () => {
    ;(useGetMonitoredServiceFromServiceAndEnvironment as jest.Mock).mockImplementation(() => ({
      loading: false,
      data: mockedMonitoredService,
      error: false
    }))
    const onUpdate = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={verifyStepInitialValues}
        type={StepType.Verify}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        ref={ref}
      />
    )

    // entering the step name
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'CV Step' } })

    // Verify if correct monitoring service is present.
    await waitFor(() => {
      expect(getByText('connectors.cdng.monitoredService.label')).toBeTruthy()
      const monitoredService = container.querySelector('input[name="spec.monitoredServiceRef"]') as HTMLInputElement
      expect(monitoredService).toBeTruthy()
      expect(monitoredService.value).toBe(mockedMonitoredService.data.monitoredService.name)
    })

    // Verify if no health sources are present.
    await waitFor(() => {
      expect(getByText('connectors.cdng.healthSources.label')).toBeTruthy()
      expect(getByText('connectors.cdng.healthSources.noHealthSourcesDefined')).toBeTruthy()
      const AddHealthSourceLink = getByText('plusAdd')
      expect(AddHealthSourceLink).toBeTruthy()

      // Clicking on Add Health Source Link and verifying if the drawer opens for adding the health source.
      AddHealthSourceLink.click()
      expect(getByText('cv.healthSource.addHealthSource')).toBeTruthy()
    })

    //verify if the continous verification type is getting selected correctly.
    const verificationTypeDropdown = container.querySelector('input[name="spec.type"]') as HTMLInputElement
    const selectCaret = container
      .querySelector(`[name="spec.type"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')
    await waitFor(() => {
      fireEvent.click(selectCaret!)
    })
    const typeToSelect = await findByText(container, 'Load Test')
    act(() => {
      fireEvent.click(typeToSelect)
    })
    expect(verificationTypeDropdown.value).toBe('Load Test')

    // verify if the correct fields are present for the selected verification type
    await waitFor(() => {
      const sensitivityDropdown = container.querySelector('input[name="spec.spec.sensitivity"]') as HTMLInputElement
      const durationDropdown = container.querySelector('input[name="spec.spec.duration"]') as HTMLInputElement
      const baselineDropdown = container.querySelector('input[name="spec.spec.baseline"]') as HTMLInputElement
      const deploymentTagField = container.querySelector('input[name="spec.spec.deploymentTag"]') as HTMLInputElement

      expect(sensitivityDropdown).toBeTruthy()
      expect(durationDropdown).toBeTruthy()
      expect(deploymentTagField).toBeTruthy()
      expect(baselineDropdown).toBeTruthy()
    })
  })

  test('Verify when Monitored service and HealthSource both are not present for a given service and environment ', async () => {
    ;(useGetMonitoredServiceFromServiceAndEnvironment as jest.Mock).mockImplementation(() => ({
      loading: false,
      data: { data: null },
      error: false
    }))

    const onUpdate = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={verifyStepInitialValues}
        type={StepType.Verify}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        ref={ref}
      />
    )

    // entering the step name
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'CV Step' } })

    // Verify that no monitoring source is present and autocreate link is present to create the monitored service
    let autoCreateMonitoredServiceLink: HTMLElement
    await waitFor(() => {
      expect(getByText('connectors.cdng.monitoredService.label')).toBeTruthy()
      autoCreateMonitoredServiceLink = getByText('connectors.cdng.monitoredService.autoCreateMonitoredService')
      expect(autoCreateMonitoredServiceLink).toBeTruthy()
    })

    // Auto creating the monitored service and verify if correct monitored service is created.
    await waitFor(() => {
      autoCreateMonitoredServiceLink.click()
      const createdMonitoredService = container.querySelector(
        'input[name="spec.monitoredServiceRef"]'
      ) as HTMLInputElement

      expect(createdMonitoredService.value).toEqual(mockedCreatedMonitoredService.monitoredService.name)
    })

    // Verify if no health sources are present.
    await waitFor(() => {
      expect(getByText('connectors.cdng.healthSources.label')).toBeTruthy()
      expect(getByText('connectors.cdng.healthSources.noHealthSourcesDefined')).toBeTruthy()
      const AddHealthSourceLink = getByText('plusAdd')
      expect(AddHealthSourceLink).toBeTruthy()

      // Clicking on Add Health Source Link and verifying if the drawer opens for adding the health source.
      AddHealthSourceLink.click()
      expect(getByText('cv.healthSource.addHealthSource')).toBeTruthy()
    })
  })
})
