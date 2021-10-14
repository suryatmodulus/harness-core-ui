import { noop } from 'lodash-es'
import { createContext, Dispatch, SetStateAction } from 'react'

export enum GitErrorExperienceTab {
  ALL_ERRORS = 'ALL_ERRORS',
  CONNECTIVITY_ERRORS = 'CONNECTIVITY_ERRORS'
}

export enum GitErrorExperienceSubTab {
  ALL_ERRORS_COMMIT_VIEW = 'ALL_ERRORS_COMMIT_VIEW',
  ALL_ERRORS_FILE_VIEW = 'ALL_ERRORS_FILE_VIEW'
}

export interface GitSyncErrorStateType {
  selectedTab: GitErrorExperienceTab
  view: GitErrorExperienceSubTab | null
  setView: Dispatch<SetStateAction<GitErrorExperienceSubTab | null>>
  branch: string
  repoIdentifier: string
  searchTerm: string
}

export const GitSyncErrorState = createContext<GitSyncErrorStateType>({
  selectedTab: GitErrorExperienceTab.ALL_ERRORS,
  view: GitErrorExperienceSubTab.ALL_ERRORS_COMMIT_VIEW,
  setView: noop,
  branch: '',
  repoIdentifier: '',
  searchTerm: ''
})
