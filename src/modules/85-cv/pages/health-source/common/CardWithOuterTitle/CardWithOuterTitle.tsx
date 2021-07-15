import React from 'react'
import cx from 'classnames'
import { Layout, Text, Card, Color } from '@wings-software/uicore'
import css from './CardWithOuterTitle.module.scss'

interface CardWithOuterTitleProp {
  title?: string
  children: JSX.Element
}

export default function CardWithOuterTitle({ title, children }: CardWithOuterTitleProp): JSX.Element {
  return (
    <>
      <Layout.Vertical margin={'xxlarge'}>
        {title && (
          <Text color={Color.BLACK} className={css.header}>
            {title}
          </Text>
        )}
        <Card className={cx(css.sectionCard, css.shadow)}>{children}</Card>
      </Layout.Vertical>
    </>
  )
}
