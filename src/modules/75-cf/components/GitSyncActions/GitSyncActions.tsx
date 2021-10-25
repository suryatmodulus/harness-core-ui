import React, { ReactElement, useState } from 'react'
import { Text, Layout, Color, Container, Button, Icon, Switch } from '@wings-software/uicore'
import cx from 'classnames'

import { PopoverPosition } from '@blueprintjs/core'
import css from './GitSyncActions.module.scss'

export interface GitSyncActionsProps {
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  return (
    <>
      <Container className={cx(css.gitRepoText, css.itemContainer)}>
        <Icon name="repository" margin={{ right: '10px' }} />
        <Text color={Color.BLACK}>{repository}</Text>
      </Container>

      <Container className={css.verticalDivider}></Container>

      <Container className={css.itemContainer}>
        <Button
          noStyling
          className={cx(css.branchActionButton, isSettingsOpen && css.branchActionButtonActive)}
          tooltipProps={{
            fill: true,
            interactionKind: 'click',
            minimal: true,
            position: PopoverPosition.BOTTOM_LEFT,
            isOpen: isSettingsOpen,
            onInteraction: nextOpenState => setIsSettingsOpen(nextOpenState)
          }}
          tooltip={
            <Layout.Vertical padding="medium" spacing="small">
              <Container flex={{ alignItems: 'start' }}>
                <Switch
                  data-testid="auto-commit-switch"
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
          <Container className={css.branchActionButtonWrapper}>
            <Icon name="git-new-branch" size={15} />
            <Text color={Color.GREY_900}>{branch}</Text>
            <Container className={css.gitStatusIcon}>
              <Button
                noStyling
                tooltipProps={{
                  isDark: true,
                  disabled: isSettingsOpen
                }}
                tooltip={
                  <Layout.Vertical padding="medium" spacing="small" data-testid="git-sync-status-tooltip">
                    <Text color={Color.WHITE}>{`Auto-commit to "${branch}" is ${
                      isAutoCommitEnabled ? 'ON' : 'OFF'
                    }`}</Text>
                  </Layout.Vertical>
                }
              >
                {isLoading ? (
                  <Icon name="steps-spinner" size={15} className={css.loadingSpinner} data-testid="git-sync-spinner" />
                ) : (
                  <Icon
                    data-testid="auto-commit-status-icon"
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
