import React from 'react'
import { Layout, Text } from '@wings-software/uicore'
import css from './COGatewayConfig.module.scss'

interface COGatewayConfigStepProps {
  count: number
  title: string
  subTitle?: string
  totalStepsCount?: number
  id?: string
}

const stepInfoColorMap: { [key: string]: { main: string; secondary: string } } = {
  0: { main: '#FCB519', secondary: '#FFFBEE' },
  1: { main: '#1e5c1f', secondary: '#e4f7e1' },
  2: { main: '#0278D5', secondary: '#EFF8FE' },
  3: { main: '#592BAA', secondary: '#E1D0FF' }
}

const COGatewayConfigStep: React.FC<COGatewayConfigStepProps> = props => {
  const colorPallete = stepInfoColorMap[props.count % 4]
  return (
    <Layout.Vertical id={props.id} className={css.configStepContainer} spacing={'small'}>
      <Layout.Horizontal className={css.stepInfo}>
        <span style={{ color: colorPallete.main, backgroundColor: colorPallete.secondary }}>{`Step ${props.count} of ${
          props.totalStepsCount || props.count
        }`}</span>
      </Layout.Horizontal>
      <Text className={css.title}>{props.title}</Text>
      {props.subTitle && <Text className={css.subTitle}>{props.subTitle}</Text>}
      {props.children && <div className={css.childrenContainer}>{props.children}</div>}
    </Layout.Vertical>
  )
}

export default COGatewayConfigStep
