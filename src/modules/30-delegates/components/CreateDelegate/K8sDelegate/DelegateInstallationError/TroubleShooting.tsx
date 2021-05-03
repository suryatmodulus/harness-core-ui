import React from 'react'
import { StepProps, Container, Layout, Text, Color, Button } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import CopyToClipboard from '@common/components/CopyToClipBoard/CopyToClipBoard'
import { TroubleShootingTypes } from '@delegates/constants'
import css from './DelegateInstallationError.module.scss'

const TroubleShooting: React.FC<StepProps<null>> = () => {
  const { getString } = useStrings()
  const [activeEvent, setActiveEvent] = React.useState(TroubleShootingTypes.VERIFY_PODS_COMEUP)
  const iconProps = { size: 10, color: 'orange' }

  const onEventClick = () => {
    setActiveEvent(TroubleShootingTypes.VERIFY_HARNESS_SASS)
  }
  return (
    <Layout.Vertical width={630} style={{ padding: '0px var(--spacing-large)' }}>
      <Layout.Horizontal
        flex
        style={{
          borderBottom: '0.5px solid #B0B1C4',
          padding: 'var(--spacing-small) var(--spacing-medium)'
        }}
      >
        <Button
          intent="primary"
          minimal
          text={getString('back')}
          onClick={() => {
            switch (activeEvent) {
              case TroubleShootingTypes.VERIFY_EVENTS:
                setActiveEvent(TroubleShootingTypes.VERIFY_PODS_COMEUP)
                return
              case TroubleShootingTypes.VERIFY_HARNESS_SASS:
                setActiveEvent(TroubleShootingTypes.VERIFY_EVENTS)
                return
              case TroubleShootingTypes.CONTACT_HARNESS_SUPPORT:
                setActiveEvent(TroubleShootingTypes.VERIFY_HARNESS_SASS)
                return
              default:
                setActiveEvent(TroubleShootingTypes.VERIFY_PODS_COMEUP)
                return
            }
          }}
        />

        <Text
          icon="info"
          color={Color.BLACK}
          font={{ size: 'medium', weight: 'bold' }}
          style={{ lineHeight: '22px' }}
          iconProps={{
            color: Color.BLUE_800
          }}
        >
          {getString('delegate.delegateNotInstalled.tabs.commonProblems.hereIsWhatYouCanDo')}
        </Text>
        <Button
          intent="primary"
          minimal
          text={getString('restart')}
          onClick={() => {
            setActiveEvent(TroubleShootingTypes.VERIFY_PODS_COMEUP)
          }}
        />
      </Layout.Horizontal>
      <Layout.Vertical width={511} style={{ padding: 'var(--spacing-medium) 0px' }}>
        <Layout.Horizontal flex>
          <Text color={Color.BLACK_100} font={{ weight: 'bold' }}>
            {getString('delegate.delegateNotInstalled.statusOfCluster')}
          </Text>
          <Button
            intent="primary"
            minimal
            text={getString('delegate.delegateNotInstalled.tabs.commonProblems.troubleshoot')}
          />
        </Layout.Horizontal>
        <Container
          intent="primary"
          padding="small"
          font={{
            align: 'center'
          }}
          flex
          className={css.podCmndField}
        >
          <Text>{getString('delegate.delegateNotInstalled.podCommand')}</Text>
          <CopyToClipboard content={getString('delegate.delegateNotInstalled.podCommand')} />
        </Container>
      </Layout.Vertical>
      {activeEvent === TroubleShootingTypes.VERIFY_PODS_COMEUP && (
        <Container className={css.podCmndVerification}>
          <Text color={Color.BLACK_100}>{getString('delegate.delegateNotInstalled.podComeUp')}</Text>
          <Container style={{ marginTop: 'var(--spacing-medium)' }}>
            <Button text={getString('yes')} />
            <Button
              intent="none"
              onClick={() => {
                setActiveEvent(TroubleShootingTypes.VERIFY_EVENTS)
              }}
              className={css.noBtn}
              text={getString('no')}
            />
          </Container>
        </Container>
      )}

      {activeEvent === TroubleShootingTypes.VERIFY_EVENTS && (
        <>
          <Layout.Vertical width={511} style={{ padding: 'var(--spacing-medium) 0px' }}>
            <Text color={Color.BLACK_100} font={{ weight: 'bold' }}>
              {getString('delegate.delegateNotInstalled.eventErrorBlock')}
            </Text>
          </Layout.Vertical>
          <Container className={css.btnContainer}>
            <Button rightIcon="warning-sign" iconProps={iconProps} onClick={onEventClick} className={css.error}>
              {getString('delegate.delegateNotInstalled.permissionError')}
            </Button>
            <Button
              onClick={onEventClick}
              rightIcon="warning-sign"
              iconProps={iconProps}
              className={`${css.error} ${css.addSpacing}`}
            >
              {getString('delegate.delegateNotInstalled.crashloopError')}
            </Button>
            <Button
              onClick={onEventClick}
              rightIcon="warning-sign"
              iconProps={iconProps}
              className={`${css.error} ${css.addSpacing}`}
            >
              {getString('delegate.delegateNotInstalled.pullError')}
            </Button>
          </Container>
        </>
      )}
      {activeEvent === TroubleShootingTypes.VERIFY_HARNESS_SASS && (
        <>
          <Layout.Vertical width={511} style={{ padding: 'var(--spacing-medium) 0px' }}>
            <Text color={Color.BLACK_100} font={{ weight: 'bold' }}>
              {getString('delegate.delegateNotInstalled.harnessErrorValidation')}
            </Text>
          </Layout.Vertical>
          <Container className={css.podCmndVerification}>
            <Button
              onClick={() => {
                setActiveEvent(TroubleShootingTypes.CONTACT_HARNESS_SUPPORT)
              }}
              text={getString('yes')}
            />
            <Button text={getString('no')} intent="none" className={css.noBtn} />
          </Container>
        </>
      )}
      {activeEvent === TroubleShootingTypes.CONTACT_HARNESS_SUPPORT && (
        <Button
          minimal
          color={Color.BLACK_100}
          font={{ weight: 'bold' }}
          width={200}
          text={getString('delegate.delegateNotInstalled.contactHarness')}
        />
      )}
    </Layout.Vertical>
  )
}

export default TroubleShooting
