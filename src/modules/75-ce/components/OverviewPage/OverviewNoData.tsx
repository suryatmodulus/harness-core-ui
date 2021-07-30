import React from 'react'
import cx from 'classnames'
import { useHistory, useParams } from 'react-router-dom'
import { Classes } from '@blueprintjs/core'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { Container, Layout, useModalHook, Text } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import CCMDocsImage from './images/CCMDocs.svg'
import AutoStoppingImage from './images/AutoStopping.svg'
import ConnectorImage from './images/Connector.svg'
import NoDataImage from './images/NoData.svg'
import css from './OverviewPage.module.scss'

const useNoDataModal = ({ onConnectorCreateClick }: { onConnectorCreateClick: () => void }) => {
  const { accountId } = useParams<{ accountId: string }>()

  const history = useHistory()
  const { getString } = useStrings()

  const modalPropsLight: IDialogProps = {
    isOpen: true,
    enforceFocus: false,
    canOutsideClickClose: false,
    className: cx(Classes.DIALOG, css.noDataCtn)
  }

  const handleCreateAutoStoppingClick = () => {
    history.push(routes.toCECORules({ accountId }))
  }

  const [openModal, hideModal] = useModalHook(() => (
    <Dialog {...modalPropsLight}>
      <Layout.Vertical spacing="xxxlarge">
        <Container>
          <Layout.Horizontal spacing="large" style={{ alignItems: 'center' }}>
            <img src={NoDataImage} height={150} />
            <Text color="grey800" font="normal" style={{ lineHeight: '25px' }}>
              {getString('ce.overview.noData.info')}
            </Text>
          </Layout.Horizontal>
        </Container>
        <Container>
          <Text color="grey800">{getString('ce.overview.noData.explore')}</Text>
          <Layout.Horizontal style={{ justifyContent: 'space-evenly', marginTop: 25 }}>
            <Layout.Vertical>
              <img src={AutoStoppingImage} height={75} />
              <Text
                padding="medium"
                color="primary7"
                style={{ cursor: 'pointer' }}
                onClick={handleCreateAutoStoppingClick}
              >
                {getString('ce.overview.noData.autoStopping')}
              </Text>
            </Layout.Vertical>
            <Layout.Vertical>
              <img src={ConnectorImage} height={75} />
              <Text padding="medium" color="primary7" style={{ cursor: 'pointer' }} onClick={onConnectorCreateClick}>
                {getString('ce.overview.noData.connector')}
              </Text>
            </Layout.Vertical>
            <Layout.Vertical>
              <img src={CCMDocsImage} height={75} />
              <a href="http://ngdocs.harness.io/" target="_blank" rel="noreferrer" className={css.ngDocs}>
                {getString('ce.overview.noData.ngDocs')}
              </a>
            </Layout.Vertical>
          </Layout.Horizontal>
        </Container>
      </Layout.Vertical>
    </Dialog>
  ))

  return {
    hideModal,
    openModal
  }
}

export default useNoDataModal
