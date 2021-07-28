import React from 'react'
import { Dialog } from '@blueprintjs/core'
import { useModalHook, Button, Card, Color, Icon } from '@wings-software/uicore'
import argoLogo from './images/argo-icon-color.svg'
import css from './GitOpsModalContainer.module.scss'

const GitOpsModalContainer: React.FC = () => {
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
    <div className={css.gitOpsContainer}>
      <div className={css.header}>
        <h1 className={css.title}> Git Ops </h1>
      </div>
      {/* <Button intent="primary" onClick={() => openUploadCertiModal()} text={'Open Argo'} className="" /> */}

      <div className={css.providerContainer}>
        <Card className={css.card} interactive onClick={() => openUploadCertiModal()}>
          <img className={css.argoLogo} src={argoLogo} alt="" aria-hidden />
          <h4> Name: &nbsp; Argo App </h4>
          <h4> URL: &nbsp; https://34.123.123 </h4>

          <h4>
            Status: &nbsp; <Icon name="command-artifact-check" color={Color.GREEN_450} />
          </h4>

          <div className={css.footer}>
            <Button className={css.launch} intent="primary" text={'Launch'}></Button>
          </div>
        </Card>

        <Card className={css.card} interactive onClick={() => openUploadCertiModal()}>
          <img className={css.argoLogo} src={argoLogo} alt="" aria-hidden />
          <h4> Name: &nbsp; Argo App </h4>
          <h4> URL: &nbsp; https://34.123.123 </h4>

          <h4>
            Status: &nbsp; <Icon name="command-artifact-check" color={Color.GREEN_450} />
          </h4>

          <div className={css.footer}>
            <Button className={css.launch} intent="primary" text={'Launch'}></Button>
          </div>
        </Card>

        <Card className={css.card} interactive onClick={() => openUploadCertiModal()}>
          <img className={css.argoLogo} src={argoLogo} alt="" aria-hidden />
          <h4> Name: &nbsp; Argo App </h4>
          <h4> URL: &nbsp; https://34.123.123 </h4>

          <h4>
            Status: &nbsp; <Icon name="command-artifact-check" color={Color.GREEN_450} />
          </h4>

          <div className={css.footer}>
            <Button className={css.launch} intent="primary" text={'Launch'}></Button>
          </div>
        </Card>

        <Card className={css.card} interactive onClick={() => openUploadCertiModal()}>
          <img className={css.argoLogo} src={argoLogo} alt="" aria-hidden />
          <h4> Name: &nbsp; Argo App </h4>
          <h4> URL: &nbsp; https://34.123.123 </h4>

          <h4>
            Status: &nbsp; <Icon name="command-artifact-check" color={Color.GREEN_450} />
          </h4>

          <div className={css.footer}>
            <Button className={css.launch} intent="primary" text={'Launch'}></Button>
          </div>
        </Card>
      </div>

      <div className={css.providerContainer}>
        <Card className={css.card} interactive onClick={() => openUploadCertiModal()}>
          <img className={css.argoLogo} src={argoLogo} alt="" aria-hidden />
          <h4> Name: &nbsp; Argo App </h4>
          <h4> URL: &nbsp; https://34.123.123 </h4>

          <h4>
            Status: &nbsp; <Icon name="command-artifact-check" color={Color.GREEN_450} />
          </h4>

          <div className={css.footer}>
            <Button className={css.launch} intent="primary" text={'Launch'}></Button>
          </div>
        </Card>

        <Card className={css.card} interactive onClick={() => openUploadCertiModal()}>
          <img className={css.argoLogo} src={argoLogo} alt="" aria-hidden />
          <h4> Name: &nbsp; Argo App </h4>
          <h4> URL: &nbsp; https://34.123.123 </h4>

          <h4>
            Status: &nbsp; <Icon name="command-artifact-check" color={Color.GREEN_450} />
          </h4>

          <div className={css.footer}>
            <Button className={css.launch} intent="primary" text={'Launch'}></Button>
          </div>
        </Card>

        <Card className={css.card} interactive onClick={() => openUploadCertiModal()}>
          <img className={css.argoLogo} src={argoLogo} alt="" aria-hidden />
          <h4> Name: &nbsp; Argo App </h4>
          <h4> URL: &nbsp; https://34.123.123 </h4>

          <h4>
            Status: &nbsp; <Icon name="command-artifact-check" color={Color.GREEN_450} />
          </h4>

          <div className={css.footer}>
            <Button className={css.launch} intent="primary" text={'Launch'}></Button>
          </div>
        </Card>

        <Card className={css.card} interactive onClick={() => openUploadCertiModal()}>
          <img className={css.argoLogo} src={argoLogo} alt="" aria-hidden />
          <h4> Name: &nbsp; Argo App </h4>
          <h4> URL: &nbsp; https://34.123.123 </h4>

          <h4>
            Status: &nbsp; <Icon name="command-artifact-check" color={Color.GREEN_450} />
          </h4>

          <div className={css.footer}>
            <Button className={css.launch} intent="primary" text={'Launch'}></Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default GitOpsModalContainer
