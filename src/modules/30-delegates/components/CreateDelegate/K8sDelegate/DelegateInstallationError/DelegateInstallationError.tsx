import React from 'react'

import { Layout, Icon, Text, Tabs, Tab } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import CommonProblems from '../../CommonProblems/CommonProblems'
import TroubleShooting from './TroubleShooting'
import css from './DelegateInstallationError.module.scss'

interface DelegateInstallationErrorProps {
  showDelegateInstalledMessage?: boolean
}
const DelegateInstallationError: React.FC<DelegateInstallationErrorProps> = ({
  showDelegateInstalledMessage = true
}) => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical
      padding="large"
      onClick={e => {
        e.stopPropagation()
      }}
    >
      {showDelegateInstalledMessage && (
        <Layout.Horizontal spacing="small">
          <Icon name="warning-sign" size={16} className={css.notInstalled} />
          <Text>{getString('delegates.delegateNotInstalled.title')}</Text>
        </Layout.Horizontal>
      )}
      <Layout.Horizontal spacing="small">
        <Tabs id="delegateNotInstalledTabs">
          <Tab
            id="tabId1"
            title={<Text>{getString('delegates.delegateNotInstalled.tabs.commonProblems.title')}</Text>}
            panel={<CommonProblems />}
          />
          <Tab
            id="tabId2"
            title={<Text>{getString('delegates.delegateNotInstalled.tabs.troubleshooting')}</Text>}
            panel={<TroubleShooting />}
          />
        </Tabs>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default DelegateInstallationError
