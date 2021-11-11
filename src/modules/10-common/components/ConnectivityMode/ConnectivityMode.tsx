import React from 'react'
import cx from 'classnames'
import { CardSelect, Color, Container, FontVariation, Icon, Layout, Text } from '@wings-software/uicore'
import type { FormikProps } from 'formik'
// import { useStrings } from 'framework/strings'

import DelegatesGit from '@common/icons/DelegatesGit.svg'
import PlatformGit from '@common/icons/PlatformGit.svg'

import type { FormikPropsInterface } from '../Wizard/WizardUtils'
import css from './ConnectivityMode.module.scss'

export enum ConnectivityModeType {
  Manager = 'Manager',
  Delegate = 'Delegate'
}

// interface ConnectivityModeFormik {
//   connectivityMode: ConnectivityModeType
// }

export interface ConnectivityCardItem {
  type: ConnectivityModeType
  title: string
  info: string
  icon: JSX.Element
}

interface ConnectivityModeProps {
  formik: FormikProps<FormikPropsInterface>
  className?: string
  onChange: (val: ConnectivityModeType) => void
}

const ConnectivityMode: React.FC<ConnectivityModeProps> = props => {
  // const { getString } = useStrings()

  const ConnectivityCard: ConnectivityCardItem[] = [
    {
      type: ConnectivityModeType.Manager,
      title: 'Connect through Harness Platform',
      info: 'This option is meant for a SaaS Git provider.  Communication with the Git provider will be made through the Harness Platform.',
      icon: <img src={PlatformGit} width="100%" />
    },
    {
      type: ConnectivityModeType.Delegate,
      title: 'Connect through a Harness Delegate',
      info: 'This option is meant for a Git Provider that is behind your corporate firewall. Communication wth the Git provider will be made through a Harness Delegate. You will need to install a Harness Delegate with this option. This option provides enhanced security but may result in slower response times.',
      icon: <img src={DelegatesGit} width="100%" />
    }
  ]

  return (
    <CardSelect
      onChange={(item: ConnectivityCardItem) => {
        props.formik?.setFieldValue('connectivityMode', item.type)
        // console.log(item)
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
              {item.type === props.formik.values.connectivityMode ? (
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
        ConnectivityCard[ConnectivityCard.findIndex(card => card.type === props.formik.values.connectivityMode)]
      }
    />
  )
}

export default ConnectivityMode
