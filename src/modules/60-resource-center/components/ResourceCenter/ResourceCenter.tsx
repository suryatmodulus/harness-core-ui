import React from 'react'
import { Icon, Text, Layout, Color, IconName, FontVariation } from '@wings-software/uicore'

import cx from 'classnames'
import { useStrings } from 'framework/strings'
import resourceImage from './images/resource-center.svg'
import css from './ResourceCenter.module.scss'
const getButton = (buttonText: string, buttonIcon: IconName, link: string) => {
  return (
    <a href={link} rel="noreferrer" target="_blank">
      <Layout.Vertical
        flex={{ align: 'center-center' }}
        spacing="small"
        padding={'small'}
        className={cx(css.bottombutton)}
      >
        <Icon name={buttonIcon} size={24} />
        <Text
          font={{ variation: FontVariation.BODY2 }}
          padding={{ bottom: 'xsmall' }}
          color={Color.PRIMARY_3}
          className={css.text}
        >
          {buttonText}
        </Text>
      </Layout.Vertical>
    </a>
  )
}

const menuItems = (title: string, description: string) => {
  return (
    <>
      <Layout.Vertical>
        <Text font={{ weight: 'semi-bold', size: 'medium' }} padding={{ bottom: 'xsmall' }} color={Color.PRIMARY_3}>
          {title}
        </Text>
        <Text
          font={{ variation: FontVariation.BODY2 }}
          padding={{ bottom: 'xsmall' }}
          color={Color.WHITE}
          className={css.text}
        >
          {description}
        </Text>
      </Layout.Vertical>
      <Icon name={'chevron-right'} width={6} height={12} />
    </>
  )
}

export const ResourceCenter = () => {
  const { getString } = useStrings()

  return (
    <div className={css.resourceCenter}>
      <Layout.Vertical flex={{ alignItems: 'baseline' }} className={css.allregions}>
        <Text color={Color.WHITE} padding={{ bottom: 'medium' }}>
          {getString('resourceCenter.title')}
        </Text>
        <img src={resourceImage} height={106} />
      </Layout.Vertical>
      <Layout.Vertical className={cx(css.allregions, css.middleregion)}>
        <Layout.Horizontal
          padding={{ bottom: 'medium' }}
          flex={{ justifyContent: 'space-between' }}
          className={css.myticket}
        >
          {menuItems(
            getString('resourceCenter.ticketmenu.tickets'),
            getString('resourceCenter.ticketmenu.ticketsDesc')
          )}
          {/*<Icon name={'chevron-right'} width={6} height={12} />*/}
        </Layout.Horizontal>
        <Layout.Horizontal padding={{ top: 'medium' }} flex={{ justifyContent: 'space-between' }}>
          {menuItems(getString('resourceCenter.ticketmenu.submit'), getString('resourceCenter.ticketmenu.submitDesc'))}
          {/*<Icon name={'chevron-right'} width={6} height={12} />*/}
        </Layout.Horizontal>
      </Layout.Vertical>
      <Layout.Vertical className={css.allregions}>
        <Text font={{ weight: 'semi-bold' }} padding={{ bottom: 'medium' }} color={Color.WHITE} className={css.text}>
          {getString('resourceCenter.bottomlayout.desc')}
        </Text>
        <Layout.Horizontal flex={{ justifyContent: 'space-around' }}>
          {getButton(
            getString('search'),
            getString('resourceCenter.bottomlayout.search.icon') as IconName,
            getString('resourceCenter.bottomlayout.search.link')
          )}
          {getButton(
            getString('resourceCenter.bottomlayout.docs.text'),
            getString('resourceCenter.bottomlayout.docs.icon') as IconName,
            getString('resourceCenter.bottomlayout.docs.link')
          )}
          {getButton(
            getString('authSettings.cdCommunityPlan.communityTitle'),
            getString('resourceCenter.bottomlayout.community.icon') as IconName,
            getString('resourceCenter.bottomlayout.community.link')
          )}
          {getButton(
            getString('resourceCenter.bottomlayout.sitestatus.text'),
            getString('resourceCenter.bottomlayout.sitestatus.icon') as IconName,
            getString('resourceCenter.bottomlayout.sitestatus.link')
          )}
        </Layout.Horizontal>
      </Layout.Vertical>
    </div>
  )
}
