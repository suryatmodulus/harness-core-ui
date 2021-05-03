import React from 'react'
import { Container, Tabs, Tab, Layout, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { useQueryParams } from '@common/hooks'
import DelegateListing from './DelegateListing'
import DelegateConfigurations from './DelegateConfigurations'
import { DelegateTab } from './utils/DelegateHelper'
import css from './DelegatesPage.module.scss'

export const DelegatesPage: React.FC = () => {
  const { getString } = useStrings()
  const { tab = DelegateTab.DELEGATES } = useQueryParams<{ tab?: DelegateTab }>()

  return (
    <Layout.Vertical height={'calc(100vh - 64px'} className={css.listPage}>
      <Container className={css.delegateTabs} background={Color.WHITE}>
        <Tabs id="delegateTabs" defaultSelectedTabId={tab}>
          <Tab id={DelegateTab.DELEGATES} title={getString('delegate.delegates')} panel={<DelegateListing />} />
          <Tab
            id={DelegateTab.CONFIGURATIONS}
            title={getString('delegate.delegateConfigurations')}
            panel={<DelegateConfigurations />}
          />
        </Tabs>
      </Container>
    </Layout.Vertical>
  )
}

export default DelegatesPage
