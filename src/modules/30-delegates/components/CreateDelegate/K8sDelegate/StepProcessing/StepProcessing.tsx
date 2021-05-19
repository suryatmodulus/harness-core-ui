import React from 'react'
import { useParams } from 'react-router-dom'
import { StepProps, Layout, Icon, Text, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'

import { useGetDelegatesHeartbeatDetails } from 'services/portal'
import type { StepK8Data } from '@delegates/DelegateInterface'
import { POLL_INTERVAL, TIME_OUT } from '@delegates/constants'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import DelegateInstallationError from '../DelegateInstallationError/DelegateInstallationError'
import DelegateInitialization from '../DelegateInitialization/DelegateInitialization'

import css from '../CreateK8sDelegate.module.scss'

let counter = 0

const StepProcessing: React.FC<StepProps<StepK8Data>> = props => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const [showSuccess, setShowSuccess] = React.useState(false)
  const [showError, setShowError] = React.useState(false)
  const [isHeartBeatVerified, setVerifyHeartBeat] = React.useState(false)
  const [isDelegateInitialized, setIsDelegateInitialised] = React.useState(false)
  const { data, loading, refetch: verifyHeartBeat } = useGetDelegatesHeartbeatDetails({
    queryParams: { accountId, sessionId: props?.prevStepData?.delegateYaml?.sessionIdentifier },
    debounce: 200
  })

  React.useEffect(() => {
    if (
      !loading &&
      (!data || (data && data?.resource?.numberOfConnectedDelegates !== props?.prevStepData?.replicas)) &&
      !showError &&
      !showSuccess
    ) {
      const timerId = window.setTimeout(() => {
        counter += POLL_INTERVAL
        verifyHeartBeat()
      }, POLL_INTERVAL)

      if (counter >= TIME_OUT * (props?.prevStepData?.replicas || 1)) {
        window.clearTimeout(timerId)
        setVerifyHeartBeat(true)
        setShowError(true)
      }

      return () => {
        window.clearTimeout(timerId)
      }
    } else if (data?.resource?.numberOfConnectedDelegates === props?.prevStepData?.replicas) {
      setVerifyHeartBeat(true)
      setShowSuccess(true)
    }
  }, [data, verifyHeartBeat, loading])

  if (showError) {
    return <DelegateInstallationError />
  } else if (showSuccess && isHeartBeatVerified && isDelegateInitialized) {
    return (
      <Layout.Horizontal spacing="medium" className={css.checkItemsWrapper}>
        <Icon size={10} color={Color.GREEN_500} name="command-artifact-check" className={css.checkIcon} />
        <Text font={{ weight: 'bold' }}>{getString('delegate.successVerification.delegateInstalled')}</Text>
      </Layout.Horizontal>
    )
  }
  const connectedDelegates = data?.resource?.numberOfConnectedDelegates || 0
  const totalReplicas = props?.prevStepData?.replicas || 0
  const iconColor = connectedDelegates < totalReplicas ? Color.YELLOW_500 : Color.GREEN_500
  return (
    <Layout.Vertical spacing="xxlarge">
      <Layout.Horizontal padding="large">
        <Icon size={16} name="steps-spinner" style={{ marginRight: '12px' }} />
        <Text font="small">{getString('delegate.successVerification.checkDelegateInstalled')}</Text>
      </Layout.Horizontal>
      <Layout.Vertical padding="large">
        <Layout.Horizontal spacing="medium" className={css.checkItemsWrapper}>
          <Icon size={10} color={iconColor} name="command-artifact-check" className={css.checkIcon} />
          <Text font={{ weight: 'bold' }}>
            {getString('delegate.successVerification.heartbeatReceived')}({connectedDelegates}/{totalReplicas})
          </Text>
        </Layout.Horizontal>
        {isHeartBeatVerified && (
          <DelegateInitialization
            setShowError={setShowError}
            setShowSuccess={setShowSuccess}
            isDelegateInitialized={isDelegateInitialized}
            setIsDelegateInitialised={setIsDelegateInitialised}
            {...props}
          />
        )}
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default StepProcessing
