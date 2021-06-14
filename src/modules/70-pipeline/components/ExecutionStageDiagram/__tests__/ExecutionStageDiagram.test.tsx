import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ExecutionStatusEnum } from '@pipeline/utils/statusHelpers'
import { ExecutionPipelineNodeType } from '../ExecutionPipelineModel'
import ExecutionStageDiagram, { ExecutionStageDiagramProps } from '../ExecutionStageDiagram'

interface Data {
  label: string
}

const itemClickHandler = jest.fn()
const itemMouseEnter = jest.fn()
const itemMouseLeave = jest.fn()
const canvasListener = jest.fn()
const onChangeStageSelection = jest.fn()

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getExtraProps = () => ({
  itemClickHandler,
  itemMouseEnter,
  itemMouseLeave,
  canvasListener,
  onChangeStageSelection
})

const getProps = (): ExecutionStageDiagramProps<Data> => ({
  data: {
    items: [
      {
        item: {
          icon: 'pipeline-deploy',
          identifier: 'qaStage',
          name: 'qa stage',
          status: ExecutionStatusEnum.Failed,
          type: ExecutionPipelineNodeType.NORMAL,
          data: {
            label: 'qaStage'
          }
        }
      },
      {
        parallel: [
          {
            item: {
              icon: 'pipeline-deploy',
              identifier: 'parallel1',
              name: 'Parallel 1',
              status: ExecutionStatusEnum.Paused,
              type: ExecutionPipelineNodeType.NORMAL,
              data: {
                label: 'Parallel 1'
              }
            }
          },
          {
            item: {
              icon: 'pipeline-deploy',
              identifier: 'parallel3',
              name: 'Parallel 2',
              status: ExecutionStatusEnum.Success,
              type: ExecutionPipelineNodeType.NORMAL,
              data: {
                label: 'Parallel 2'
              }
            }
          }
        ]
      },
      {
        item: {
          icon: 'pipeline-deploy',
          identifier: 'stage2',
          name: 'stage 2',
          status: ExecutionStatusEnum.Running,
          type: ExecutionPipelineNodeType.NORMAL,
          data: {
            label: 'stage2'
          }
        }
      },
      {
        group: {
          icon: 'service' as any,
          identifier: 'Service',
          name: 'service',
          isOpen: true,
          status: ExecutionStatusEnum.ResourceWaiting,
          data: {
            label: 'service'
          },
          items: [
            {
              item: {
                icon: 'badge' as any,
                identifier: 'badge',
                name: 'Badge',
                status: ExecutionStatusEnum.Aborted,
                type: ExecutionPipelineNodeType.NORMAL,
                data: {
                  label: 'badge'
                }
              }
            },
            {
              group: {
                icon: 'step-group',
                identifier: 'Step-Group',
                name: 'Step Group HTTP',
                isOpen: true,
                showInLabel: false,
                status: ExecutionStatusEnum.Running,
                data: {
                  label: 'step-group'
                },
                items: [
                  {
                    item: {
                      icon: 'badge' as any,
                      identifier: 'badge',
                      name: 'Badge',
                      status: ExecutionStatusEnum.Aborted,
                      type: ExecutionPipelineNodeType.NORMAL,
                      data: {
                        label: 'badge'
                      }
                    }
                  },
                  {
                    item: {
                      icon: 'barcode' as any,
                      identifier: 'barcode',
                      name: 'barcode',
                      status: ExecutionStatusEnum.NotStarted,
                      type: ExecutionPipelineNodeType.NORMAL,
                      data: {
                        label: 'barcode'
                      }
                    }
                  }
                ]
              }
            },
            {
              item: {
                icon: 'barcode' as any,
                identifier: 'barcode',
                name: 'barcode',
                status: ExecutionStatusEnum.NotStarted,
                type: ExecutionPipelineNodeType.NORMAL,
                data: {
                  label: 'barcode'
                }
              }
            }
          ]
        }
      }
    ],
    identifier: 'Test_Pipline',
    status: ExecutionStatusEnum.Failed,
    allNodes: []
  },
  selectedIdentifier: 'qaStage',
  showStageSelection: true,
  selectedStage: { label: 'QA', value: 'qa', icon: { name: 'add' } },
  stageSelectionOptions: [
    { label: 'QA', value: 'qa', icon: { name: 'add' } },
    { label: 'Prod', value: 'prod', icon: { name: 'minus' } }
  ],
  gridStyle: { startX: 50, startY: 50 }
})
jest.mock('resize-observer-polyfill', () => {
  return class ResizeObserver {
    static default = ResizeObserver
    observe(): void {
      // do nothing
    }
    unobserve(): void {
      // do nothing
    }
    disconnect(): void {
      // do nothing
    }
  }
})

// eslint-disable-next-line jest/no-disabled-tests
describe('Test Execution StageDiagram', () => {
  beforeAll(() => {
    jest.spyOn(global.Math, 'random').mockReturnValue(0.12345)
  })
  afterAll(() => {
    jest.spyOn(global.Math, 'random').mockReset()
  })
  test('should render the default snapshot', () => {
    const { container } = render(
      <TestWrapper>
        <ExecutionStageDiagram {...getProps()} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('Test Execution StageDiagram - Action/Events', () => {
  test('Test Mouse Events on Nodes and Canvas', () => {
    const { container } = render(
      <TestWrapper>
        <ExecutionStageDiagram
          {...getProps()}
          {...getExtraProps()}
          diagramContainerHeight={100}
          selectedIdentifier="parallel1"
        />
      </TestWrapper>
    )
    const node = container.querySelector('[data-nodeid="qaStage"] .defaultNode') as HTMLElement
    fireEvent.mouseEnter(node)
    expect(itemMouseEnter).toBeCalled()
    fireEvent.mouseLeave(node)
    expect(itemMouseLeave).toBeCalled()
    fireEvent.click(node)
    expect(itemClickHandler).toBeCalled()
    const canvasButton = container.querySelectorAll('.canvasButtons button')[0]
    fireEvent.click(canvasButton)
    expect(canvasListener).toBeCalledWith(3)
  })

  test('Test click Event on label', async () => {
    const { container } = render(
      <TestWrapper>
        <ExecutionStageDiagram {...getProps()} {...getExtraProps()} />
      </TestWrapper>
    )
    const label = container.querySelector('.groupLabels .label') as HTMLElement
    fireEvent.click(label)
    waitFor(() => container.querySelector('.groupLabels .selectedLabel'))
    expect(label?.classList.contains('selectedLabel')).toBeTruthy()
  })

  test('Test Stage Selection', async () => {
    const { getByText, getByPlaceholderText } = render(
      <TestWrapper>
        <ExecutionStageDiagram {...getProps()} {...getExtraProps()} />
      </TestWrapper>
    )
    const qaStage = getByText('QA')
    fireEvent.click(qaStage)
    await waitFor(() => getByPlaceholderText('Filter...'))
    const search = getByPlaceholderText('Filter...')
    fireEvent.change(search, { target: { value: 'Prod' } })
    const prodStage = getByText('Prod')
    fireEvent.click(prodStage)
    expect(onChangeStageSelection).toBeCalledWith({ label: 'Prod', value: 'prod', icon: { name: 'minus' } })
  })
})
