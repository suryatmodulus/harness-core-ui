import React from 'react'
import { Color, Layout, Text } from '@wings-software/uicore'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import ResourceCardList from '@common/components/ResourceCardList/ResourceCardList'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import css from './AccountResources.module.scss'

const AccountResources: React.FC = () => {
  const { getString } = useStrings()
  return (
    <>
      <Page.Header title={getString('common.accountResources')} breadcrumbs={<NGBreadcrumbs />} />
      <Page.Body>
        <div className={css.main}>
          <Layout.Vertical spacing="large" padding={{ bottom: 'huge' }}>
            <Text color={Color.BLACK} font={{ size: 'medium', weight: 'semi-bold' }}>
              {getString('common.accountResources')}
            </Text>
            <div>
              <Text>{getString('common.accountResourcesPage.line1')}</Text>
              <Text>{getString('common.accountResourcesPage.line2')}</Text>
            </div>
          </Layout.Vertical>
          <ResourceCardList />
        </div>
      </Page.Body>
    </>
  )
}

export default AccountResources
