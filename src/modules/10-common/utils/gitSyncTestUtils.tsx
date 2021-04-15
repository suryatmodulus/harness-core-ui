import React from 'react'
import { Route } from 'react-router-dom'

import { noop, pick } from 'lodash-es'

import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { GitSyncStoreContext, GitSyncStoreProps } from '../../../framework/GitRepoStore/GitSyncStoreContext'
import gitSyncListResponse from './__tests__/mocks/gitSyncRepoListMock.json'

export interface GitSyncTestWrapperProps extends TestWrapperProps {
  gitSyncSoreValues?: Partial<GitSyncStoreProps>
}

export const GitSyncTestWrapper: React.FC<GitSyncTestWrapperProps> = props => {
  const { defaultAppStoreValues, gitSyncSoreValues } = props
  return (
    <TestWrapper
      {...pick(props, ['path', 'pathParams', 'queryParams'])}
      defaultAppStoreValues={{
        featureFlags: {},
        updateAppStore: () => void 0,
        selectedProject: {
          identifier: 'dummy',
          name: 'dummy',
          modules: ['CI']
        },
        isGitSyncEnabled: true,
        ...defaultAppStoreValues
      }}
    >
      <GitSyncStoreContext.Provider
        value={
          {
            gitSyncRepos: gitSyncListResponse,
            updateStore: noop,
            refreshStore: noop,
            ...gitSyncSoreValues
          } as GitSyncStoreProps
        }
      >
        <Route exact path={props.path}>
          {props.children}
        </Route>
      </GitSyncStoreContext.Provider>
    </TestWrapper>
  )
}
