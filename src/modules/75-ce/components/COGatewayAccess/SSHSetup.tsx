import React from 'react'
import { Layout } from '@wings-software/uicore'
import DownloadCLI from '../DownloadCLI/DownloadCLI'
import css from './COGatewayAccess.module.scss'

const SSHSetup: React.FC = () => {
  return (
    <Layout.Vertical spacing="medium" padding="medium" className={css.sshSetupContainer}>
      <DownloadCLI />
    </Layout.Vertical>
  )
}

export default SSHSetup
