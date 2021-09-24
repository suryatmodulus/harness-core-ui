import React from 'react'
import { ButtonVariation, Layout, Button } from '@wings-software/uicore'
// import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { PageHeader } from '@common/components/Page/PageHeader'
import { Page } from '@common/exports'
// import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
// import css from './NewPolicy.module.scss'

const NewPolicy: React.FC = () => {
  // const { accountId } = useParams<ProjectPathProps>()
  const { getString } = useStrings()

  const newUserGroupsBtn = (): JSX.Element => (
    <Button text={getString('common.policy.newPolicy')} variation={ButtonVariation.PRIMARY} icon="plus" />
  )

  return (
    <>
      <PageHeader
        title={<Layout.Horizontal>{newUserGroupsBtn()}</Layout.Horizontal>}
        toolbar={
          <Layout.Horizontal margin={{ right: 'small' }} height="xxxlarge">
            <Button variation={ButtonVariation.SECONDARY}>Save</Button>
            <Button variation={ButtonVariation.SECONDARY}>Discard</Button>
            <Button variation={ButtonVariation.PRIMARY}>Test</Button>
          </Layout.Horizontal>
        }
      />
      <Page.Body>
        <div>Hello World</div>
      </Page.Body>
    </>
  )
}

export default NewPolicy
