import React, { useState } from 'react'
import { useModalHook, Button, Card, Color, Icon, Layout, Popover } from '@wings-software/uicore'
import { Menu, Classes, Position, Dialog } from '@blueprintjs/core'
import argoLogo from '../images/argo-icon-color.svg'
import harnessLogo from '../images/harness-logo.png'
import css from './ProviderCard.module.scss'

interface ProviderCardProps {
  provider: any
}

const ProviderCard: React.FC<ProviderCardProps> = props => {
  const { provider } = props

  const logo = provider.type === 'nativeArgo' ? argoLogo : harnessLogo

  const getStatusIcon = (status: any) => {
    if (status === 'Active') {
      return <Icon name="command-artifact-check" size={20} color={Color.GREEN_500} />
    }
    return <Icon name="warning-sign" size={20} color={Color.RED_500} />
  }

  const [menuOpen, setMenuOpen] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const handleDelete = () => {}

  const [openUploadCertiModal, closeUploadCertiModal] = useModalHook(() => {
    return (
      <Dialog
        onClose={closeUploadCertiModal}
        isOpen={true}
        style={{
          width: '100%',
          padding: '40px',
          position: 'relative',
          height: '100vh',
          background: 'none',
          margin: '0px'
        }}
        enforceFocus={false}
      >
        <div
          style={{
            height: '100%',
            background: 'white'
          }}
        >
          <iframe
            id="argoCD"
            height="100%"
            width="100%"
            frameBorder="0"
            name="argoCD"
            title="argoCD"
            src="http://localhost:8090/"
          ></iframe>
          <Button
            minimal
            icon="cross"
            iconProps={{ size: 18 }}
            onClick={closeUploadCertiModal}
            style={{ position: 'absolute', right: 'var(--spacing-large)', top: 'var(--spacing-small)' }}
            data-testid={'close-certi-upload-modal'}
          />
        </div>
      </Dialog>
    )
  })

  return (
    <Card className={css.card} interactive onClick={() => openUploadCertiModal()}>
      <div className={css.mainTitle}>
        <img className={css.argoLogo} src={logo} alt="" aria-hidden />

        <Layout.Horizontal className={css.layout}>
          <Popover
            isOpen={menuOpen}
            onInteraction={nextOpenState => {
              setMenuOpen(nextOpenState)
            }}
            className={Classes.DARK}
            position={Position.RIGHT_TOP}
          >
            <Button
              minimal
              icon="Options"
              onClick={e => {
                e.stopPropagation()
                setMenuOpen(true)
              }}
            />
            <Menu style={{ minWidth: 'unset' }}>
              <Menu.Item icon="trash" text="Delete" onClick={handleDelete} />
            </Menu>
          </Popover>
        </Layout.Horizontal>
      </div>

      <div className={css.projectName}> {provider.name} </div>
      <div className={css.id}> ID: {provider.id} </div>
      <div className={css.description}>This is an application to use now. Amazing work and all that.</div>

      <div className={css.urls}>
        <div className={css.serverUrl}>
          <a> Argo Server URL: &nbsp; {provider.baseURL} </a>
        </div>

        <div className={css.uiUrl}>
          <a> Argo UI URL: &nbsp; {provider.baseURL} </a>
        </div>
      </div>

      <div className={css.status}>
        <div className={css.label}> Status </div>
        <div className={`${css.serverStatus} ${provider.status === 'Active' ? css.success : css.failure}`}>
          {provider.status === 'Active' ? 'Connected' : 'Failed'}
        </div>
        <div> {getStatusIcon(provider.status)} </div>
      </div>
    </Card>
  )
}

export default ProviderCard
