import React from 'react'
import { FooterCTA, FooterCTAProps } from '@cv/components/CVSetupSourcesView/SetupSourceLayout/SetupSourceLayout'
import css from './DrawerFooter.module.scss'

export default function DrawerFooter(props: FooterCTAProps): JSX.Element {
  return <FooterCTA className={css.footer} {...props} />
}
