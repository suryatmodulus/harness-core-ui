import React from 'react'
import { Icon, Text, Layout, Color, IconName } from '@wings-software/uicore'

import cx from 'classnames'
import resourceImage from './images/resource-center.svg'
import css from './ResourceCenter.module.scss'
const getButton = (buttonText: string, buttonIcon: IconName) => {
  return (
    <Layout.Vertical
      flex={{ align: 'center-center' }}
      spacing="small"
      padding={'small'}
      className={cx(css.bottombutton)}
    >
      <Icon name={buttonIcon} size={24} />
      <Text
        font={{ weight: 'semi-bold', align: 'center' }}
        padding={{ bottom: 'xsmall' }}
        color={Color.PRIMARY_3}
        className={css.text}
      >
        {buttonText}
      </Text>
    </Layout.Vertical>
  )
}

export const ResourceCenter = () => {
  return (
    <div className={css.resourceCenter}>
      <Layout.Vertical flex={{ alignItems: 'baseline' }} className={css.allregions}>
        <Text color={Color.WHITE} padding={{ bottom: 'medium' }}>
          RESOURCE CENTER
        </Text>
        <img src={resourceImage} height={106} />
      </Layout.Vertical>
      <Layout.Vertical className={cx(css.allregions, css.middleregion)}>
        <Layout.Horizontal
          padding={{ bottom: 'medium' }}
          flex={{ justifyContent: 'space-between' }}
          className={css.myticket}
        >
          <Layout.Vertical>
            <Text font={{ weight: 'semi-bold', size: 'medium' }} padding={{ bottom: 'xsmall' }} color={Color.PRIMARY_3}>
              {'My Tickets'}
            </Text>
            <Text
              font={{ weight: 'semi-bold' }}
              padding={{ bottom: 'xsmall' }}
              color={Color.WHITE}
              className={css.text}
            >
              {'View and manage your tickets'}
            </Text>
          </Layout.Vertical>
          <Icon name={'chevron-right'} width={6} height={12} />
        </Layout.Horizontal>
        <Layout.Horizontal padding={{ top: 'medium' }} flex={{ justifyContent: 'space-between' }}>
          <Layout.Vertical>
            <Text font={{ weight: 'semi-bold', size: 'medium' }} padding={{ bottom: 'xsmall' }} color={Color.PRIMARY_3}>
              {'Submit a ticket'}
            </Text>
            <Text
              font={{ weight: 'semi-bold' }}
              padding={{ bottom: 'xsmall' }}
              color={Color.WHITE}
              className={css.text}
            >
              {'Get help from our expert system'}
            </Text>
          </Layout.Vertical>
          <Icon name={'chevron-right'} width={6} height={12} />
        </Layout.Horizontal>
      </Layout.Vertical>
      <Layout.Vertical className={css.allregions}>
        <Text font={{ weight: 'semi-bold' }} padding={{ bottom: 'medium' }} color={Color.WHITE} className={css.text}>
          {'Other useful resources'}
        </Text>
        <Layout.Horizontal flex={{ justifyContent: 'space-around' }}>
          {getButton('Search', 'thinner-search')}
          {getButton('Docs', 'file')}
          {getButton('Community', 'people')}
          {getButton('Site Status', 'new-notification')}
        </Layout.Horizontal>
      </Layout.Vertical>
    </div>
  )
}
