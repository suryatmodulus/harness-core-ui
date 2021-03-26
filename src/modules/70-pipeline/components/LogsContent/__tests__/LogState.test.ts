import type { LogViewerAccordionStatus } from '@common/components/MultiLogsViewer/MultiLogsViewer'

import { reducer, ActionType, State, Action } from '../LogsState'

jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => () => null)

function getCreateSectionsAction(statuses: LogViewerAccordionStatus[]): Action<ActionType.CreateSections> {
  return {
    type: ActionType.CreateSections,
    payload: {
      module: 'cd',
      executionIdentifier: '',
      pipelineIdentifier: '',
      projectIdentifier: '',
      orgIdentifier: '',
      accountId: '',
      node: {
        executableResponses: [
          {
            taskChain: {
              logKeys: statuses.map((_, i) => `logKey${i + 1}`),
              units: statuses.map((_, i) => `Unit ${i + 1}`)
            } as any
          }
        ],
        unitProgresses: statuses.map((status, i) => ({ unitName: `Unit ${i + 1}`, status })) as any
      },
      stageIdentifier: '',
      selectedStep: 'SELECTED_STEP_1'
    }
  }
}

interface GetStateDataProps {
  status: LogViewerAccordionStatus
  unitStatus: LogViewerAccordionStatus
  selectedStep?: string
}

function getStateData({ status, unitStatus, selectedStep = 'SELECTED_STEP_1' }: GetStateDataProps): State {
  return {
    units: ['Unit 1'],
    dataMap: {
      'Unit 1': {
        title: 'Unit 1',
        id: 'Unit 1',
        data: '',
        dataSource: 'blob',
        logKey: 'logKey1',
        status,
        unitStatus,
        formattedData: []
      }
    },
    selectedStep
  }
}

function getUnitStatuses(state: State): string[] {
  return Object.values(state.dataMap).map(row => row.unitStatus)
}

describe('logs state reducer tests', () => {
  describe('cd module', () => {
    describe('CreateSections', () => {
      test('INIT', () => {
        const state = reducer(
          { units: [], dataMap: {}, selectedStep: '' },
          getCreateSectionsAction(['NOT_STARTED', 'NOT_STARTED', 'NOT_STARTED'])
        )

        expect(getUnitStatuses(state)).toMatchInlineSnapshot(`
          Array [
            "NOT_STARTED",
            "NOT_STARTED",
            "NOT_STARTED",
          ]
        `)
      })

      test('NOT_STARTED => SUCCESS', () => {
        const state = reducer(
          getStateData({ status: 'NOT_STARTED', unitStatus: 'NOT_STARTED' }),
          getCreateSectionsAction(['SUCCESS'])
        )
        expect(state.dataMap['Unit 1'].status).toBe('SUCCESS')
        expect(state).toMatchInlineSnapshot(`
          Object {
            "dataMap": Object {
              "Unit 1": Object {
                "data": "",
                "dataSource": "blob",
                "endTime": undefined,
                "formattedData": Array [],
                "id": "Unit 1",
                "isOpen": false,
                "logKey": "logKey1",
                "manuallyToggled": false,
                "startTime": undefined,
                "status": "SUCCESS",
                "title": "Unit 1",
                "unitStatus": "SUCCESS",
              },
            },
            "selectedStep": "SELECTED_STEP_1",
            "units": Array [
              "Unit 1",
            ],
          }
        `)
      })
    })
  })
})
