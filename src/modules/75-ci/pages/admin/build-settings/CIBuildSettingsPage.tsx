import { Button, Container } from '@wings-software/uicore'
import React from 'react'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'

const CIBuildSettingsPage: React.FC = () => {
  const tbd: () => void = () => {
    alert('TBD')
  }
  const { getString } = useStrings()
  return (
    <>
      <Page.Header
        title={getString('ci.titleSettings')}
        toolbar={
          <Container>
            <Button text={getString('ci.newItem')} onClick={tbd} />
          </Container>
        }
      />
      <Page.Body>
        <Page.NoDataCard
          icon="nav-dashboard"
          message={getString('ci.noData')}
          buttonText={getString('ci.newItem')}
          onClick={tbd}
        />
      </Page.Body>
    </>
  )
}

export default CIBuildSettingsPage
