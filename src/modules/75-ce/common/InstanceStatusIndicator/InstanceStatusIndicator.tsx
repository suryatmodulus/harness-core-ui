import React from 'react'
import { Icon, Layout } from '@wings-software/uicore'
import css from './InstanceStatusIndicator.module.scss'

export const RunningStatusIndicator = () => {
  return (
    <Layout.Horizontal className={css.instanceStatusIndicator}>
      <Icon name={'play'} />
      <span style={{ color: '#42ab45' }}>Running</span>
    </Layout.Horizontal>
  )
}

export const StoppedStatusIndicator = () => {
  return (
    <Layout.Horizontal className={css.instanceStatusIndicator}>
      <Icon name={'stop'} />
      <span style={{ color: '#DA291D' }}>Stopped</span>
    </Layout.Horizontal>
  )
}

export const CreatedStatusIndicator = () => {
  return (
    <Layout.Horizontal className={css.instanceStatusIndicator}>
      <Icon name={'full-circle'} size={10} />
      <span style={{ color: '#42ab45' }}>Created</span>
    </Layout.Horizontal>
  )
}
