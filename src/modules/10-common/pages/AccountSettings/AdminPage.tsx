import { Button, Container } from '@wings-software/uicore'
import React from 'react'
import { Page } from '@common/exports'
import { useStrings } from 'framework/exports'

const AdminPage: React.FC = () => {
  const { getString } = useStrings()
  return (
    <>
      <Page.Header
        title={getString('common.adminPage.title')}
        toolbar={
          <Container>
            <Button text={getString('common.adminPage.addUser')} />
          </Container>
        }
      />
      <Page.Body>
        <Page.NoDataCard
          icon="user"
          message={getString('common.adminPage.noData')}
          buttonText={getString('common.adminPage.addUser')}
          onClick={() => {
            alert('TBD')
          }}
        />
      </Page.Body>
    </>
  )
}

export default AdminPage
