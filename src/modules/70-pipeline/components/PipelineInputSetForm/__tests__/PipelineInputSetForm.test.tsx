/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Formik, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import connector from '@connectors/pages/connectors/__tests__/mocks/get-connector-mock.json'
import type { AllNGVariables } from '@pipeline/utils/types'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { PipelineInputSetForm, PipelineInputSetFormProps } from '../PipelineInputSetForm'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('@common/utils/YamlUtils', () => ({}))

jest.mock('services/cd-ng', () => ({
  useGetOrganizationAggregateDTO: jest.fn().mockImplementation(() => {
    return { data: {} }
  }),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: connector, refetch: jest.fn(), error: null, loading: false }
  })
}))

const getCommonProps = () => ({
  path: '/dummypath',
  readonly: false,
  viewType: StepViewType.InputSet,
  maybeContainerClass: ''
})

const getPropsForVariables = (): PipelineInputSetFormProps => ({
  originalPipeline: {
    name: 'TestPipeline',
    identifier: 'TestPipeline',
    variables: [
      {
        name: 'testvariable',
        type: 'String'
      }
    ] as AllNGVariables[]
  },
  template: {
    name: 'TestPipeline',
    identifier: 'TestPipeline',
    variables: [
      {
        name: 'testvariable',
        type: 'String',
        value: RUNTIME_INPUT_VALUE
      }
    ] as AllNGVariables[]
  },
  ...getCommonProps()
})

const getPropsForCIStage = (): PipelineInputSetFormProps => ({
  originalPipeline: {
    name: 'TestPipeline',
    identifier: 'TestPipeline',
    stages: [
      {
        stage: {
          type: 'CI',
          spec: {
            // eslint-disable-next-line
            // @ts-ignore
            cloneCodebase: true
          }
        }
      }
    ]
  },
  template: {
    name: 'TestPipeline',
    identifier: 'TestPipeline',
    properties: {
      ci: {
        codebase: {
          connectorRef: 'testConnectorRef',
          build: RUNTIME_INPUT_VALUE as any
        }
      }
    }
  },
  ...getCommonProps()
})

const getPropsForCDStage = (withStageVariables = false, withStageSpec = false): PipelineInputSetFormProps => ({
  originalPipeline: {
    name: 'TestPipeline',
    identifier: 'TestPipeline',
    stages: [
      {
        stage: {
          type: 'Deploy',
          identifier: 'testCdStage1',
          name: 'testCdStage1',
          spec: withStageSpec
            ? {
                execution: {
                  steps: [
                    {
                      step: {
                        name: 'Step1',
                        identifier: 'Step1',
                        type: 'Rolling',
                        timeout: ''
                      }
                    }
                  ]
                }
              }
            : undefined,
          variables: withStageVariables
            ? ([
                {
                  name: 'testStageVariable',
                  type: 'String'
                }
              ] as AllNGVariables[])
            : undefined
        }
      },
      {
        parallel: [
          {
            stage: {
              type: 'Deploy',
              identifier: 'parallelStage1',
              name: 'parallelStage1'
            }
          },
          {
            stage: {
              type: 'Deploy',
              identifier: 'parallelStage2',
              name: 'parallelStage2'
            }
          }
        ]
      }
    ]
  },
  template: {
    name: 'TestPipeline',
    identifier: 'TestPipeline',
    stages: [
      {
        stage: {
          type: 'Deploy',
          identifier: 'testCdStage1',
          name: 'testCdStage1',
          spec: withStageSpec
            ? {
                execution: {
                  steps: [
                    {
                      step: {
                        name: 'Step1',
                        identifier: 'Step1',
                        type: 'Rolling',
                        timeout: RUNTIME_INPUT_VALUE
                      }
                    }
                  ]
                }
              }
            : undefined,
          variables: withStageVariables
            ? ([
                {
                  name: 'testStageVariable',
                  type: 'String',
                  value: RUNTIME_INPUT_VALUE
                }
              ] as AllNGVariables[])
            : undefined
        }
      },
      {
        parallel: [
          {
            stage: {
              type: 'Deploy',
              identifier: 'parallelStage1',
              name: 'parallelStage1'
            }
          },
          {
            stage: {
              type: 'Deploy',
              identifier: 'parallelStage2',
              name: 'parallelStage2'
            }
          }
        ]
      }
    ]
  },
  ...getCommonProps()
})

describe('PIPELINE VARIABLES', () => {
  test('Render variables in normal mode', () => {
    const props = getPropsForVariables()
    const { container } = render(
      <Formik initialValues={{}} formName="pipelineInputSetFormTest" onSubmit={jest.fn()}>
        {() => (
          <TestWrapper>
            <PipelineInputSetForm {...props} />
          </TestWrapper>
        )}
      </Formik>
    )

    // Check if variable is rendered
    const variableInput = container.querySelector('input[name="/dummypath.variables[0].value"]')
    expect(variableInput).toBeTruthy()
  })

  test('Render variables in READONLY mode', () => {
    const props = getPropsForVariables()
    const { container } = render(
      <Formik initialValues={{}} formName="pipelineInputSetFormTest" onSubmit={jest.fn()}>
        {() => (
          <TestWrapper>
            <PipelineInputSetForm {...props} readonly={true} />
          </TestWrapper>
        )}
      </Formik>
    )

    // Check for the disabled class
    const disabledBp3 = container.querySelector('.bp3-disabled')
    expect(disabledBp3).toBeTruthy()
  })
})

describe('CI enabled', () => {
  test('CI present in one of the stages', () => {
    const props = getPropsForCIStage()
    const { container } = render(
      <Formik initialValues={{}} formName="pipelineInputSetFormTest" onSubmit={jest.fn()}>
        {() => (
          <TestWrapper>
            <PipelineInputSetForm {...props} />
          </TestWrapper>
        )}
      </Formik>
    )

    expect(container).toMatchSnapshot('CI codebase input set form')
  })

  test('CI READONLY mode', () => {
    const props = getPropsForCIStage()
    const { container } = render(
      <Formik initialValues={{}} formName="pipelineInputSetFormTest" onSubmit={jest.fn()}>
        {() => (
          <TestWrapper>
            <PipelineInputSetForm {...props} readonly={true} />
          </TestWrapper>
        )}
      </Formik>
    )

    expect(container).toMatchSnapshot('CI stage readonly mode')
  })

  test('PR Number build radio option should not be visible for CodeCommit type connector', () => {
    connector.data.connector.type = 'Codecommit'
    jest.mock('services/cd-ng', () => ({
      useGetConnector: jest.fn().mockImplementation(() => {
        return { data: connector, refetch: jest.fn(), error: null, loading: false }
      })
    }))
    const props = getPropsForCIStage()
    const { container } = render(
      <Formik initialValues={{}} formName="pipelineInputSetFormTest" onSubmit={jest.fn()}>
        {() => (
          <TestWrapper>
            <PipelineInputSetForm {...props} readonly={true} />
          </TestWrapper>
        )}
      </Formik>
    )

    expect(container).toMatchSnapshot(
      'PR Number build radio option should not be visible for CodeCommit type connector'
    )
  })
})

describe('CD enabled', () => {
  test('CD stage form', () => {
    const props = getPropsForCDStage()
    const { queryByText } = render(
      <Formik initialValues={{}} formName="pipelineInputSetFormTest" onSubmit={jest.fn()}>
        {() => (
          <TestWrapper>
            <PipelineInputSetForm {...props} />
          </TestWrapper>
        )}
      </Formik>
    )

    expect(queryByText('Stage: testCdStage1')).toBeTruthy()
    expect(queryByText('Stage: parallelStage1')).toBeTruthy()
    expect(queryByText('Stage: parallelStage2')).toBeTruthy()
  })

  test('CD stage form READONLY mode', () => {
    const props = getPropsForCDStage()
    const { container } = render(
      <Formik initialValues={{}} formName="pipelineInputSetFormTest" onSubmit={jest.fn()}>
        {() => (
          <TestWrapper>
            <PipelineInputSetForm {...props} readonly={true} />
          </TestWrapper>
        )}
      </Formik>
    )

    expect(container).toMatchSnapshot('disabled CD stage')
  })

  test('CD stage with variables', () => {
    const props = getPropsForCDStage(true)
    const { container } = render(
      <Formik initialValues={{}} formName="pipelineInputSetFormTest" onSubmit={jest.fn()}>
        {() => (
          <TestWrapper>
            <PipelineInputSetForm {...props} readonly={true} />
          </TestWrapper>
        )}
      </Formik>
    )

    const stageVariableInput = container.querySelector('input[name="/dummypath.stages[0].stage.variables[0].value"]')
    expect(stageVariableInput).toBeTruthy()
  })

  test('CD stage with spec', () => {
    const props = getPropsForCDStage(false, true)
    const { queryByText } = render(
      <Formik initialValues={{}} formName="pipelineInputSetFormTest" onSubmit={jest.fn()}>
        {() => (
          <TestWrapper>
            <PipelineInputSetForm {...props} readonly={true} />
          </TestWrapper>
        )}
      </Formik>
    )
    expect(queryByText('executionText')).toBeTruthy()
  })
})
