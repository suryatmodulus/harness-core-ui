import { toggleSection } from './toggleSection'
import { updateSectionData } from './updateSectionData'
import { createSections } from './createSections'
import { fetchSectionData } from './fetchSectionData'
import { fetchingSectionData } from './fetchingSectionData'
import { resetSectionData } from './resetSectionData'
import { ActionType, Action, State } from './types'

export function reducer<T extends ActionType>(state: State, action: Action<T>): State {
  switch (action.type) {
    // Action for creating the sections
    case ActionType.CreateSections:
      return createSections(state, action as Action<ActionType.CreateSections>)
    // Action to fetch the section data
    case ActionType.FetchSectionData:
      return fetchSectionData(state, action as Action<ActionType.FetchSectionData>)
    // Action for fetching the section data
    case ActionType.FetchingSectionData:
      return fetchingSectionData(state, action as Action<ActionType.FetchingSectionData>)
    // Action for updating the section data
    case ActionType.UpdateSectionData:
      return updateSectionData(state, action as Action<ActionType.UpdateSectionData>)
    // Action for toggling a section
    case ActionType.ResetSection:
      return resetSectionData(state, action as Action<ActionType.ResetSection>)
    // Action for toggling a section
    case ActionType.ToggleSection:
      return toggleSection(state, action as Action<ActionType.ToggleSection>)
    default:
      return state
  }
}
