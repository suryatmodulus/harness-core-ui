/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonVariation, Color, FontVariation, Icon, IconName, Layout, Text } from '@wings-software/uicore'

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

const menuItems = (title: string, description: string): JSX.Element => {
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
      <Button icon="chevron-right" variation={ButtonVariation.ICON} />
    </>
  )
}

export const ResourceCenter = () => {
  const { getString } = useStrings()

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
