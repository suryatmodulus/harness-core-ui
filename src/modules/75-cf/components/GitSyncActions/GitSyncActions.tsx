import React, { ReactElement } from 'react'
import { Text, Layout, Color, Container, Button, Icon, Switch } from '@wings-software/uicore'

import css from './GitSyncActions.module.scss'

interface GitSyncActionsProps {
  isLoading: boolean
  branch: string
  repository: string
  isAutoCommitEnabled: boolean
  handleToggleAutoCommit: (newAutoCommitValue: boolean) => void
}

const GitSyncActions = ({
  isLoading,
  branch,
  repository,
  isAutoCommitEnabled,
  handleToggleAutoCommit
}: GitSyncActionsProps): ReactElement => {
  return (
    <>
      <Container className={css.gitRepoText}>
        <Icon name="repository" margin={{ right: '10px' }} />
        <Text color={Color.BLACK}>{repository}</Text>
      </Container>

      <Container className={css.verticalDivider}></Container>

      <Container>
        <Button
          noStyling
          className={css.branchActionButtons}
          tooltipProps={{
            fill: true,
            interactionKind: 'click',
            minimal: true,
            position: 'bottom'
          }}
          tooltip={
            <Layout.Vertical padding="medium" spacing="small">
              <Container flex={{ alignItems: 'start' }}>
                <Switch
                  alignIndicator="left"
                  checked={isAutoCommitEnabled}
                  onChange={event => handleToggleAutoCommit(event.currentTarget.checked)}
                  disabled={isLoading}
                />
                <Text color={Color.BLACK}>Auto-commit to selected branch</Text>
              </Container>
            </Layout.Vertical>
          }
        >
          <Container className={css.branchActionButtonsWrapper}>
            <Icon name="git-new-branch" size={15} />
            <Text color={Color.GREY_900}>{branch}</Text>
            <Container className={css.gitStatusIcon}>
              <Button
                noStyling
                tooltipProps={{
                  isDark: true
                }}
                tooltip={
                  <Layout.Vertical padding="medium" spacing="small">
                    <Text color={Color.WHITE}>{`Auto-commit to "${branch}" is ${
                      isAutoCommitEnabled ? 'ON' : 'OFF'
                    }`}</Text>
                  </Layout.Vertical>
                }
              >
                {isLoading ? (
                  <Icon name="steps-spinner" size={15} className={css.loadingSpinner} />
                ) : (
                  <Icon
                    name="full-circle"
                    size={10}
                    className={isAutoCommitEnabled ? css.autoCommitEnabled : css.autoCommitDisabled}
                  />
                )}
              </Button>
            </Container>
          </Container>
        </Button>
      </Container>
    </>
  )
}

export default GitSyncActions
