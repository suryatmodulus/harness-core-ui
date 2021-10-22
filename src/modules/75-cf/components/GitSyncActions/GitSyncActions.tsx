import React from 'react'
import { Button, Container, Icon } from '@wings-software/uicore'

const GitSyncActions = () => {
  return (
    <>
      <Container style={{ flex: 0.5, padding: '0.5em', textAlign: 'center', borderRight: '0.5px solid #d9dae6' }}>
        <Icon name="git-repo" margin={{ right: '10px' }} />
        Chris Repo
      </Container>

      <Container style={{ flex: 0.5, textAlign: 'center' }}>
        <Button>
          <Icon name="git-new-branch" margin={{ right: '10px' }} /> Main <Icon name="full-circle" />
        </Button>
      </Container>
    </>

    // <StringWithTooltip stringId="cf.shared.prerequisites" tooltipId="ff_ffPrerequisites_heading" />
    // </Layout.Horizontal>
  )
}

export default GitSyncActions
