import React from 'react'
import cx from 'classnames'
import { CardSelect, Color, Container, FontVariation, Icon, Layout, Text } from '@wings-software/uicore'
import type { FormikContext, FormikProps } from 'formik'

import DelegatesGit from '@common/icons/DelegatesGit.svg'
import PlatformGit from '@common/icons/PlatformGit.svg'
import { useStrings } from 'framework/strings'
import css from './ConnectivityMode.module.scss'
import {
  CollapsableSelectOptions,
  CollapsableSelectType,
  FormikCollapsableSelect
} from './CollapsableSelect/CollapsableSelect'

export enum ConnectivityModeType {
  Manager = 'Manager',
  Delegate = 'Delegate'
}
export interface ConnectivityCardItem extends CollapsableSelectOptions {
  type: ConnectivityModeType
  title: string
  info: string
  icon: JSX.Element
}

interface ConnectivityModeFormProps {
  connectivityMode: string
}

interface ConnectivityModeProps {
  formik: FormikContext<Record<string, unknown>>
  className?: string
  onChange: (val: ConnectivityCardItem) => void
}

const ConnectivityMode: React.FC<ConnectivityModeProps> = props => {
  const { getString } = useStrings()
  const ConnectivityCard: Array<ConnectivityCardItem> = [
    {
      type: ConnectivityModeType.Manager,
      title: getString('common.connectThroughPlatform'),
      info: getString('common.connectThroughPlatformInfo'),
      icon: <img src={PlatformGit} width="100%" />,
      value: ConnectivityModeType.Manager
    },
    {
      type: ConnectivityModeType.Delegate,
      title: getString('common.connectThroughDelegate'),
      info: getString('common.connectThroughDelegateInfo'),
      icon: <img src={DelegatesGit} width="100%" />,
      value: ConnectivityModeType.Delegate
    }
  ]

  return (
    <FormikCollapsableSelect
      name="connectivityMode"
      items={ConnectivityCard}
      itemClassName={cx(props.className)}
      renderItem={(item: ConnectivityCardItem) => {
        return (
          <>
            <Layout.Horizontal flex={{ distribution: 'space-between' }}>
              <Text font={{ variation: FontVariation.H6 }} color={Color.GREY_900} margin={{ bottom: 'medium' }}>
                {item.title}
              </Text>
            </Layout.Horizontal>

            <Text color={Color.BLACK} font={{ size: 'small', weight: 'light' }}>
              {item.info}
            </Text>
            {item.icon}
          </>
        )
      }}
      onChange={(item: ConnectivityCardItem) => {
        props.onChange(item)
      }}
      type={CollapsableSelectType.CardView}
      selected={
        ConnectivityCard[ConnectivityCard.findIndex(card => card.type === props.formik.values.connectivityMode)]
      }
    />
  )
}

export default ConnectivityMode
