import React from 'react'
import type { UseGetReturn } from 'restful-react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import type { IconName } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import * as pipelinesNgService from 'services/pipeline-ng'
import { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { Step, StepProps } from '@pipeline/components/AbstractSteps/Step'
import { StepPalette } from '../StepPalette'
import { StageTypes } from '../../Stages/StageTypes'

class StepFactory extends AbstractStepFactory {
  protected type = 'test-factory'
  protected stepName = 'stepOne'
  protected stepIcon: IconName = 'cross'
}

class StepOne extends Step<object> {
  protected type = StepType.KubernetesDirect
  protected stepName = 'stepOne'
  protected stepIcon: IconName = 'cross'
  validateInputSet(): object {
    return {}
  }
  protected defaultValues = { a: 'a' }
  renderStep(props: StepProps<object>): JSX.Element {
    return <div onClick={() => props.onUpdate?.(props.initialValues)}>{JSON.stringify(props.initialValues)}</div>
  }
}

const stepFactory = new StepFactory()
stepFactory.registerStep(new StepOne())

const getProps = () => ({
  onSelect: jest.fn(),
  onClose: jest.fn(),
  stepsFactory: stepFactory,
  selectedStage: {},
  stageType: StageTypes.DEPLOY
})

describe('Step Palette tests', () => {
  const spy = jest.spyOn(pipelinesNgService, 'useGetSteps')

  test('Show all steps count and filters correctly', async () => {
    const props = getProps()
    spy.mockReturnValue({
      loading: false,
      error: null,
      data: {
        status: 'SUCCESS',
        data: {
          name: 'Library',
          stepCategories: [
            {
              name: 'K8',
              stepCategories: [],
              stepsData: [
                {
                  name: 's1',
                  type: 't1'
                },
                {
                  name: 's2',
                  type: 't2'
                }
              ]
            },
            {
              name: 'Utilities',
              stepCategories: [
                {
                  name: 'Scripted',
                  stepsData: [
                    {
                      name: 's3',
                      type: 't3'
                    },
                    {
                      name: 's4',
                      type: 't4'
                    }
                  ]
                }
              ],
              stepsData: []
            }
          ],
          stepsData: []
        },
        metaData: (null as unknown) as undefined,
        correlationId: 'someId'
      }
    } as UseGetReturn<any, pipelinesNgService.Failure, any, unknown>)
    const { container, queryByText } = render(
      <TestWrapper>
        <StepPalette {...props} />
      </TestWrapper>
    )

    expect(queryByText('Show All Steps (4)')).toBeDefined()
    fireEvent.change(container.querySelector('input[type="search"]')!, { target: { value: 'tttt' } })
    await waitFor(() => expect(queryByText('stepPalette.noSearchResultsFound')).not.toBeNull())
  })

  test('Loading indicator', () => {
    const props = getProps()
    spy.mockReturnValue({
      loading: true,
      error: null,
      data: {
        status: 'SUCCESS',
        data: {
          name: 'Library',
          stepCategories: [],
          stepsData: []
        },
        metaData: (null as unknown) as undefined,
        correlationId: 'someId'
      }
    } as UseGetReturn<any, pipelinesNgService.Failure, any, unknown>)
    const { queryByText } = render(
      <TestWrapper>
        <StepPalette {...props} />
      </TestWrapper>
    )

    expect(queryByText('stepPalette.noSearchResultsFound')).toBeNull()
    expect(queryByText('Loading steps...')).toBeDefined()
    expect(queryByText('Show All Steps (0)')).toBeDefined()
  })

  test('No data indicator', () => {
    const props = getProps()
    spy.mockReturnValue({
      loading: false,
      error: null,
      data: {
        status: 'SUCCESS',
        data: {
          name: 'Library',
          stepCategories: [],
          stepsData: []
        },
        metaData: (null as unknown) as undefined,
        correlationId: 'someId'
      }
    } as UseGetReturn<any, pipelinesNgService.Failure, any, unknown>)
    const { queryByText } = render(
      <TestWrapper>
        <StepPalette {...props} />
      </TestWrapper>
    )

    expect(queryByText('stepPalette.noSearchResultsFound')).toBeDefined()
    expect(queryByText('Show All Steps (0)')).toBeDefined()
  })
})
