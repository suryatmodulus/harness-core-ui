import { ActionType, State, Action, UnitLoadingStatus } from '../LogsState/types'
import { reducer } from '../LogsState'
import { getDefaultReducerState } from '../LogsState/utils'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

function getCreateSectionsAction(statuses: UnitLoadingStatus[]): Action<ActionType.CreateSections> {
  return {
    type: ActionType.CreateSections,
    payload: {
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
      selectedStep: 'SELECTED_STEP_1',
      selectedStage: 'SELECTED_STAGE_1'
    }
  }
}

function getUnitStatuses(state: State): string[] {
  return Object.values(state.dataMap).map(row => row.unitStatus)
}

describe('logs state reducer tests', () => {
  describe('CreateSections', () => {
    test('INIT', () => {
      const state = reducer(
        getDefaultReducerState(),
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
  })
})
