import React from 'react'

import { StepProps, Layout, Icon, Text, Tabs, Tab } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import CommonProblems from '../../CommonProblems/CommonProblems'
import TroubleShooting from './TroubleShooting'
import css from './DelegateInstallationError.module.scss'

const DelegateInstallationError: React.FC<StepProps<null>> = () => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical padding="large">
      <Layout.Horizontal spacing="small">
        <Icon name="warning-sign" size={16} className={css.notInstalled} />
        <Text>{getString('delegate.delegateNotInstalled.title')}</Text>
      </Layout.Horizontal>
      <Layout.Horizontal spacing="small">
        <Tabs id="delegateNotInstalledTabs">
          <Tab
            id="tabId1"
            title={<Text>{getString('delegate.delegateNotInstalled.tabs.commonProblems.title')}</Text>}
            panel={<CommonProblems />}
          />
          <Tab
            id="tabId2"
            title={<Text>{getString('delegate.delegateNotInstalled.tabs.troubleshooting')}</Text>}
            panel={<TroubleShooting />}
          />
        </Tabs>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default DelegateInstallationError
