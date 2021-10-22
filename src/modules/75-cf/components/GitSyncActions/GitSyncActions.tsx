import React, { ReactElement } from 'react'
import { Text, Layout, Color, Container, Button, Icon, Switch } from '@wings-software/uicore'

import css from './GitSyncActions.module.scss'

interface GitSyncActionsProps {
  isLoading: boolean
  branch: string
  isAutoCommitEnabled: boolean
  handleToggleAutoCommit: (newAutoCommitValue: boolean) => void
}

const GitSyncActions = ({
  isLoading,
  branch,
  isAutoCommitEnabled,
  handleToggleAutoCommit
}: GitSyncActionsProps): ReactElement => {
  return (
    <>
      <Container style={{ flex: 0.5, padding: '0.5em', textAlign: 'center' }}>
        <Icon name="git-repo" margin={{ right: '10px' }} />
        Chris Repo
      </Container>

      <Container style={{ flex: 0.5, textAlign: 'center' }}>
        <Button
          className={css.actionsButton}
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
          <Container
            className={css.buttonContentWrapper}
            flex={{ justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Icon name="git-new-branch" size={15} />
            <Text color={Color.GREY_900}>{branch}</Text>
            {isLoading ? <Icon name="spinner" size={10} color="blue500" /> : <Icon name="full-circle" size={10} />}
          </Container>
        </Button>
      </Container>
    </>
  )
}

export default GitSyncActions
