import React from 'react'
import { useModalHook, Button, Layout, Text, Color } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import cx from 'classnames'
import moment from 'moment'
import { useStrings } from 'framework/strings'

import { TrialModalTemplate } from '@common/components/TrialModalTemplate/TrialModalTemplate'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import ceImage from './images/Illustration.svg'

import css from './useCETrialModal.module.scss'

interface CETrialModalData {
  onContinue: () => void
}

interface UseCETrialModalProps {
  onClose?: () => void
  onContinue: () => void
}

interface UseCETrialModalReturn {
  showModal: () => void
  hideModal: () => void
}

const CETrial: React.FC<CETrialModalData> = props => {
  const { onContinue } = props

  const { getString } = useStrings()

  const { licenseInformation } = useLicenseStore()
  const ceLicenseInformation = licenseInformation?.['CE']

  const expiryTime = ceLicenseInformation?.expiryTime
  const time = moment(expiryTime)
  const expiryDate = time.format('DD MMM YYYY')

  function getChildComponent(): React.ReactElement {
    return (
      <>
        <Layout.Vertical flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }} spacing="medium">
          <Text className={css.titleText}>{getString('ce.ceTrialHomePage.modal.title')}</Text>
          <Text
            className={css.trialBadge}
            background={Color.ORANGE_500}
            color={Color.WHITE}
            width={120}
            border={{ radius: 3 }}
            margin={{ left: 30 }}
            inline
            font={{ align: 'center' }}
          >
            {getString('common.trialInProgress')}
          </Text>
          <Layout.Horizontal>
            <Text className={css.expiryText}>{`${getString('common.extendTrial.expiryDate')}:`}</Text>
            <Text className={css.expiryDate}>{`${expiryDate}`}</Text>
          </Layout.Horizontal>
        </Layout.Vertical>
        <Layout.Vertical
          className={css.descriptionBlock}
          flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
          height="35%"
        >
          <Layout.Vertical spacing="small">
            <Text className={css.description}>{getString('ce.ceTrialHomePage.modal.welcome')}</Text>
            <Text className={css.description}>{getString('ce.ceTrialHomePage.modal.description')}</Text>
          </Layout.Vertical>
          <Layout.Horizontal spacing="small" padding={{ top: 'large' }}>
            <Button intent="primary" text={getString('continue')} onClick={onContinue} />
          </Layout.Horizontal>
        </Layout.Vertical>
      </>
    )
  }

  return (
    <TrialModalTemplate title={getString('ce.continuous')} hideTrialBadge imgSrc={ceImage} rightWidth="40%">
      {getChildComponent()}
    </TrialModalTemplate>
  )
}

const useCETrialModal = (props: UseCETrialModalProps): UseCETrialModalReturn => {
  const { onContinue } = props

  const [showModal, hideModal] = useModalHook(() => {
    return (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        isCloseButtonShown={false}
        canOutsideClickClose={false}
        canEscapeKeyClose={false}
        // onClose={closeModal}
        className={cx(css.dialog, Classes.DIALOG, css.ceTrial)}
      >
        <CETrial onContinue={onContinue} />
        {/* <Button
          aria-label="close modal"
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={onContinue}
          className={css.crossIcon}
        /> */}
      </Dialog>
    )
  }, [onContinue])

  return {
    showModal,
    hideModal
  }
}

export default useCETrialModal
