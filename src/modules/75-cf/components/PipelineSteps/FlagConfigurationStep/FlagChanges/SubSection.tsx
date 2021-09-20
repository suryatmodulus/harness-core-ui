import React, { FC, ReactElement } from 'react'
import { Layout } from '@wings-software/uicore'
import type { LayoutProps } from '@wings-software/uicore/dist/layouts/Layout'
import css from './SubSection.module.scss'

export interface SubSectionProps {
  removeSubSectionButton?: ReactElement
  subSectionSelector: ReactElement
}

const SubSection: FC<SubSectionProps & LayoutProps> = ({
  removeSubSectionButton,
  subSectionSelector,
  children,
  ...props
}) => {
  return (
    <Layout.Vertical spacing="medium" padding="large" className={css.subSection} {...props}>
      <Layout.Horizontal style={{ justifyContent: 'space-between' }}>
        {subSectionSelector}
        {removeSubSectionButton}
      </Layout.Horizontal>
      {children}
    </Layout.Vertical>
  )
}

export default SubSection
