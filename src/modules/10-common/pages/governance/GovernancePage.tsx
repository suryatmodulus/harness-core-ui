import { Button, Container } from '@wings-software/uicore'
import React from 'react'
import { Page } from '@common/exports'
import { useStrings } from 'framework/exports'

const GovernancePage: React.FC = () => {
  const { getString } = useStrings()
  return (
    <>
      <Page.Header
        title={getString('common.governance')}
        toolbar={
          <Container>
            <Button text={getString('common.governancePage.add')} />
          </Container>
        }
      />
      <Page.Body>
        <Page.NoDataCard
          icon="shield"
          message={getString('common.governancePage.noData')}
          buttonText={getString('common.governancePage.add')}
          onClick={() => {
            alert('TBD')
          }}
        />
      </Page.Body>
    </>
  )
}

export default GovernancePage
