import React from 'react'
import cx from 'classnames'
import { Layout, Text, Card, Color } from '@wings-software/uicore'
import css from './CardWithOuterTitle.module.scss'

interface CardWithOuterTitleProp {
  title?: string
  children: React.ReactNode
  className?: string
}

export default function CardWithOuterTitle({ title, children, className }: CardWithOuterTitleProp): JSX.Element {
  return (
    <>
      <Layout.Vertical margin={'xxlarge'} className={className}>
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
