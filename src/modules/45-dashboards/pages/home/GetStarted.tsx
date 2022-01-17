/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Drawer } from '@blueprintjs/core'

import { Layout, Button, Text, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'

interface DrawerProps {
  isOpen: boolean
  setDrawerOpen: (state: boolean) => void
}

export const GetStarted: React.FC<DrawerProps> = props => {
  const { getString } = useStrings()

  return (
    <Drawer
      autoFocus={true}
      enforceFocus={true}
      hasBackdrop={true}
      usePortal={true}
      canOutsideClickClose={true}
      canEscapeKeyClose={true}
      isOpen={props.isOpen}
      onClose={() => {
        props.setDrawerOpen(false)
      }}
      size="500px"
      style={{
        // top: '85px',
        boxShadow: 'rgb(40 41 61 / 4%) 0px 2px 8px, rgb(96 97 112 / 16%) 0px 16px 24px',
        height: '100vh',
        overflowY: 'scroll',
        overflowX: 'hidden'
      }}
    >
      <Layout.Vertical>
        <Layout.Horizontal
          padding="medium"
          style={{ borderBottom: '1px solid var(--grey-200)', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.BLACK}>
            {getString('dashboards.getStarted.title')}
          </Text>
          <Button icon="cross" minimal onClick={_ => props.setDrawerOpen(false)} />
        </Layout.Horizontal>
        <Layout.Vertical spacing="medium" padding="medium">
          <Layout.Vertical spacing="large">
            <Text font={{ size: 'medium' }} color={Color.GREY_900}>
              {getString('dashboards.getStarted.video1Title')}
            </Text>
            <Text font={{ size: 'normal' }} color={Color.GREY_700}>
              {getString('dashboards.getStarted.subTextVideo1')}
            </Text>

            <iframe
              src="//fast.wistia.net/embed/iframe/38m8yricif"
              scrolling="no"
              allowFullScreen={true}
              frameBorder={0}
              className="wistia_embed"
              name="wistia_embed"
              width="470"
              height="250"
            ></iframe>
          </Layout.Vertical>
          <Layout.Vertical spacing="large">
            <Text font={{ size: 'medium' }} color={Color.GREY_900}>
              {getString('dashboards.getStarted.video2Title')}
            </Text>
            <Text font={{ size: 'normal' }} color={Color.GREY_700}>
              {getString('dashboards.getStarted.subTextVideo2')}
            </Text>

            <iframe
              src="//fast.wistia.net/embed/iframe/xde7qsupzd"
              scrolling="no"
              allowFullScreen={true}
              frameBorder={0}
              className="wistia_embed"
              name="wistia_embed"
              width="470"
              height="250"
            ></iframe>
          </Layout.Vertical>
          <Layout.Vertical spacing="large">
            <Text font={{ size: 'medium' }} color={Color.GREY_900}>
              {getString('dashboards.getStarted.video3Title')}
            </Text>
            <Text font={{ size: 'normal' }} color={Color.GREY_700}>
              {getString('dashboards.getStarted.subTextVideo3')}
            </Text>

            <iframe
              src="//fast.wistia.net/embed/iframe/ykdmbx7bfg"
              scrolling="no"
              allowFullScreen={true}
              frameBorder={0}
              className="wistia_embed"
              name="wistia_embed"
              width="470"
              height="250"
            ></iframe>
          </Layout.Vertical>
        </Layout.Vertical>
      </Layout.Vertical>
    </Drawer>
  )
}
