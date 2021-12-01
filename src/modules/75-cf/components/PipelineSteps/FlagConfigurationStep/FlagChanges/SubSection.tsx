import React, { FC, ReactElement } from 'react'
import { omit } from 'lodash-es'
import { Layout } from '@wings-software/uicore'
import type { LayoutProps } from '@wings-software/uicore/dist/layouts/Layout'
import type { SubSectionComponentProps } from './FlagChangesForm'
import css from './SubSection.module.scss'

export interface SubSectionProps {
  removeSubSectionButton?: ReactElement
  subSectionSelector: ReactElement
}

export const disallowedProps: Array<string | keyof SubSectionComponentProps> = [
  'fieldValues',
  'subSectionSelector',
  'removeSubSectionButton',
  'clearField',
  'setField',
  'prefix',
  'targetAttributes',
  'targetGroups',
  'variations',
  'targets'
]

const SubSection: FC<SubSectionProps & LayoutProps> = ({
  removeSubSectionButton,
  subSectionSelector,
  children,
  ...props
}) => {
  return (
    <Layout.Vertical spacing="medium" padding="large" className={css.subSection} {...omit(props, ...disallowedProps)}>
      <Layout.Horizontal className={css.header}>
        {subSectionSelector}
        {removeSubSectionButton}
      </Layout.Horizontal>
      {children}
    </Layout.Vertical>
  )
}

export default SubSection
