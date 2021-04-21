import React from 'react'
import { Layout, Button } from '@wings-software/uicore'

import type { ResponseConnectorValidationResult, ConnectorInfoDTO } from 'services/cd-ng'
import type { UseGetMockData } from '@common/utils/testUtils'
import useTestConnectionModal from '@connectors/common/useTestConnectionModal/useTestConnectionModal'
import { useStrings } from 'framework/exports'
import css from './TestConnection.module.scss'

interface TestConnectionProps {
  connectorType: ConnectorInfoDTO['type']
  refetchConnector: () => Promise<any>
  connectorIdentifier: string
  url: string
  testConnectionMockData?: UseGetMockData<ResponseConnectorValidationResult>
}
const TestConnection: React.FC<TestConnectionProps> = props => {
  const { openErrorModal } = useTestConnectionModal({
    onClose: () => {
      props.refetchConnector()
    }
  })
  const { getString } = useStrings()
  return (
    <Layout.Vertical>
      <Button
        className={css.testButton}
        text={getString('common.testConnection')}
        onClick={() => {
          openErrorModal(props.connectorIdentifier, props.connectorType, props.url)
        }}
      />
    </Layout.Vertical>
  )
}
export default TestConnection
