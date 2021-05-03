import React from 'react'
import { useParams } from 'react-router-dom'
import { StepProps, Layout, Icon, Text, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { useInitialization } from 'services/portal'
import type { StepK8Data } from '@delegates/DelegateInterface'

import { POLL_INTERVAL, TIME_OUT } from '@delegates/constants'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'

import css from '../CreateK8sDelegate.module.scss'
let counter = 0

interface DelegateInitProps {
  setShowError: any
  setShowSuccess: any
  isDelegateInitialized: boolean
  setIsDelegateInitialised: any
}

const DelegateInitialization: React.FC<StepProps<StepK8Data> & DelegateInitProps> = props => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const { data: initData, loading: initLoading, refetch: verifyInitialization } = useInitialization({
    queryParams: { accountId, sessionId: props?.prevStepData?.delegateYaml?.sessionIdentifier },
    lazy: true,
    debounce: 200
  })
  const timeout = props?.prevStepData?.replicas ? TIME_OUT * props?.prevStepData?.replicas : TIME_OUT
  const getInitialisedArray = () => {
    return initData && initData?.resource ? initData?.resource.filter(item => item.initialized) : []
  }

  React.useEffect(() => {
    const initDelegatesArr = getInitialisedArray()
    if (!initLoading && (!initData || initDelegatesArr.length === props?.prevStepData?.replicas)) {
      const timerId = window.setTimeout(() => {
        counter = counter + 1
        verifyInitialization()
      }, POLL_INTERVAL)

      if (counter * 60 * 1000 === timeout) {
        window.clearTimeout(timerId)
        // setVerifyHeartBeat(true)
        props.setShowError(true)
      }

      return () => {
        window.clearTimeout(timerId)
      }
    } else {
      if (initDelegatesArr && initDelegatesArr.length === props?.prevStepData?.replicas) {
        props.setIsDelegateInitialised(true)
        props.setShowSuccess(true)
      }
    }
  }, [initData, initLoading, verifyInitialization])

  return (
    <Layout.Horizontal spacing="medium" className={css.checkItemsWrapper}>
      <Icon size={10} color={Color.GREEN_500} name="command-artifact-check" className={css.checkIcon} />
      <Text font={{ weight: 'bold' }}>
        {getString('delegate.successVerification.delegateInitialized')}({getInitialisedArray()?.length}/
        {props?.prevStepData?.replicas})
      </Text>
    </Layout.Horizontal>
  )
}

export default DelegateInitialization
