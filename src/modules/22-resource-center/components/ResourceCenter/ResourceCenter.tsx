import React from 'react'
import { Button, ButtonVariation, Color, FontVariation, Icon, IconName, Layout, Text } from '@wings-software/uicore'

import { Dialog, IDialogProps } from '@blueprintjs/core'

import { upperFirst } from 'lodash-es'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import resourceImage from './images/resource-center.png'
import css from './ResourceCenter.module.scss'

const getButton = (buttonText: string, buttonIcon: string, link: string): JSX.Element => {
  return (
    <a href={link} rel="noreferrer" target="_blank">
      <Layout.Vertical
        flex={{ align: 'center-center' }}
        spacing="small"
        padding={'small'}
        className={cx(css.bottombutton)}
      >
        <Icon name={buttonIcon as IconName} size={24} color={Color.WHITE} />
        <Text font={{ variation: FontVariation.BODY2 }} padding={{ bottom: 'xsmall' }} color={Color.PRIMARY_3}>
          {buttonText}
        </Text>
      </Layout.Vertical>
    </a>
  )
}

const menuItems = (
  title: string,
  description: string,
  buttonClickOp: ((event: React.MouseEvent<Element, MouseEvent>) => void | Promise<void>) | undefined
): JSX.Element => {
  return (
    <>
      <Layout.Vertical>
        <Text font={{ variation: FontVariation.H4 }} padding={{ bottom: 'xsmall' }} color={Color.PRIMARY_3}>
          {title}
        </Text>
        <Text font={{ variation: FontVariation.BODY2 }} padding={{ bottom: 'xsmall' }} color={Color.WHITE}>
          {description}
        </Text>
      </Layout.Vertical>
      <Button icon="chevron-right" variation={ButtonVariation.ICON} onClick={buttonClickOp} />
    </>
  )
}

const ResourceCenterHome = () => {
  const { getString } = useStrings()

  return (
    <Layout.Vertical width={440} className={css.resourceCenter}>
      <Layout.Vertical padding={'xlarge'} flex={{ alignItems: 'baseline' }}>
        <Layout.Horizontal padding={{ bottom: 'medium' }} flex={{ alignItems: 'center' }}>
          <Text color={Color.WHITE}>{getString('resourceCenter.title')}</Text>
          <Button icon={'cross'} variation={ButtonVariation.ICON} onClick={onClose} />
        </Layout.Horizontal>

        <img src={resourceImage} height={106} alt={'Resource center image'} />
      </Layout.Vertical>
      <Layout.Vertical padding={'xlarge'} className={css.middleregion}>
        <Layout.Horizontal
          padding={{ bottom: 'medium' }}
          flex={{ justifyContent: 'space-between' }}
          className={css.myticket}
        >
          {menuItems(
            getString('resourceCenter.ticketmenu.tickets'),
            getString('resourceCenter.ticketmenu.ticketsDesc'),
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            () => {}
          )}
        </Layout.Horizontal>
        <Layout.Horizontal padding={{ top: 'medium' }} flex={{ justifyContent: 'space-between' }}>
          {menuItems(
            getString('resourceCenter.ticketmenu.submit'),
            getString('resourceCenter.ticketmenu.submitDesc'),
            submitTicket
          )}
        </Layout.Horizontal>
      </Layout.Vertical>
      <Layout.Vertical padding={'xlarge'}>
        <Text font={{ variation: FontVariation.BODY2 }} padding={{ bottom: 'medium' }} color={Color.WHITE}>
          {getString('resourceCenter.bottomlayout.desc')}
        </Text>
        <Layout.Horizontal flex={{ justifyContent: 'space-around' }}>
          {getButton(getString('search'), 'thinner-search', 'https://search.harness.io/')}
          {getButton(
            getString('resourceCenter.bottomlayout.docs.text'),
            'resource-center-docs-icon',
            'https://docs.harness.io/'
          )}
          {getButton(
            getString('resourceCenter.bottomlayout.community.text'),
            'resource-center-community-icon',
            'https://community.harness.io/'
          )}
          {getButton(
            getString('resourceCenter.bottomlayout.sitestatus.text'),
            'right-bar-notification',
            'https://status.harness.io/'
          )}
        </Layout.Horizontal>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export const ResourceCenter = () => {
  const { getString } = useStrings()
  const modalProps = {
    isOpen: true,
    enforceFocus: false,
    title: upperFirst(getString('resourceCenter.title')),
    isCloseButtonShown: true,
    onClose: () => {
      hideModal()
    },
    style: {
      width: 900,
      minHeight: 240,
      borderLeft: 0,
      paddingBottom: 0,
      position: 'relative',
      overflow: 'hidden'
    }
  } as IDialogProps

  return (
    <Layout.Vertical width={440} className={css.resourceCenter}>
      <Layout.Vertical padding={'xlarge'} flex={{ alignItems: 'baseline' }}>
        <Text color={Color.WHITE} padding={{ bottom: 'medium' }}>
          {getString('resourceCenter.title')}
        </Text>
        <img src={resourceImage} height={106} alt={'Resource center image'} />
      </Layout.Vertical>
      <Layout.Vertical padding={'xlarge'} className={css.middleregion}>
        <Layout.Horizontal
          padding={{ bottom: 'medium' }}
          flex={{ justifyContent: 'space-between' }}
          className={css.myticket}
        >
          {menuItems(
            getString('resourceCenter.ticketmenu.tickets'),
            getString('resourceCenter.ticketmenu.ticketsDesc')
          )}
        </Layout.Horizontal>
        <Layout.Horizontal padding={{ top: 'medium' }} flex={{ justifyContent: 'space-between' }}>
          {menuItems(getString('resourceCenter.ticketmenu.submit'), getString('resourceCenter.ticketmenu.submitDesc'))}
        </Layout.Horizontal>
      </Layout.Vertical>
      <Layout.Vertical padding={'xlarge'}>
        <Text font={{ variation: FontVariation.BODY2 }} padding={{ bottom: 'medium' }} color={Color.WHITE}>
          {getString('resourceCenter.bottomlayout.desc')}
        </Text>
        <Layout.Horizontal flex={{ justifyContent: 'space-around' }}>
          {getButton(getString('search'), 'thinner-search', 'https://search.harness.io/')}
          {getButton(
            getString('resourceCenter.bottomlayout.docs.text'),
            'resource-center-docs-icon',
            'https://docs.harness.io/'
          )}
          {getButton(
            getString('resourceCenter.bottomlayout.community.text'),
            'resource-center-community-icon',
            'https://community.harness.io/'
          )}
          {getButton(
            getString('resourceCenter.bottomlayout.sitestatus.text'),
            'right-bar-notification',
            'https://status.harness.io/'
          )}
        </Layout.Horizontal>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}
