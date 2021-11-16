import React from 'react'
import cx from 'classnames'
import { CardSelect, Color, Container, FontVariation, Icon, Layout, Text } from '@wings-software/uicore'
import type { FormikProps } from 'formik'

import DelegatesGit from '@common/icons/DelegatesGit.svg'
import PlatformGit from '@common/icons/PlatformGit.svg'
import { useStrings } from 'framework/strings'
import css from './ConnectivityMode.module.scss'

export enum ConnectivityModeType {
  Manager = 'Manager',
  Delegate = 'Delegate'
}
export interface ConnectivityCardItem {
  type: ConnectivityModeType
  title: string
  info: string
  icon: JSX.Element
}

interface ConnectivityModeFormProps {
  connectivityMode: string
}

interface ConnectivityModeProps {
  formik: FormikProps<unknown>
  className?: string
  onChange: (val: ConnectivityModeType) => void
}

const ConnectivityMode: React.FC<ConnectivityModeProps> = props => {
  const { getString } = useStrings()
  const ConnectivityCard: ConnectivityCardItem[] = [
    {
      type: ConnectivityModeType.Manager,
      title: getString('common.connectThroughPlatform'),
      info: getString('common.connectThroughPlatformInfo'),
      icon: <img src={PlatformGit} width="100%" />
    },
    {
      type: ConnectivityModeType.Delegate,
      title: getString('common.connectThroughDelegate'),
      info: getString('common.connectThroughDelegateInfo'),
      icon: <img src={DelegatesGit} width="100%" />
    }
  ]

  return (
    <CardSelect
      onChange={(item: ConnectivityCardItem) => {
        props.formik?.setFieldValue('connectivityMode', item.type)
        props.onChange(item.type)
      }}
      data={ConnectivityCard}
      className={cx(css.cardRow, props.className)}
      renderItem={(item: ConnectivityCardItem) => {
        return (
          <Container className={css.cardT}>
            <Layout.Horizontal flex={{ distribution: 'space-between' }}>
              <Text font={{ variation: FontVariation.H6 }} color={Color.GREY_900}>
                {item.title}
              </Text>
              {item.type === (props.formik.values as ConnectivityModeFormProps).connectivityMode ? (
                <Icon margin="small" name="deployment-success-new" size={16} />
              ) : null}
            </Layout.Horizontal>

            <Text color={Color.BLACK} font={{ size: 'small', weight: 'light' }}>
              {item.info}
            </Text>
            {item.icon}
          </Container>
        )
      }}
      selected={
        ConnectivityCard[
          ConnectivityCard.findIndex(
            card => card.type === (props.formik.values as ConnectivityModeFormProps).connectivityMode
          )
        ]
      }
    />
  )
}

export default ConnectivityMode
