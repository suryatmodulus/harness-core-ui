import React from 'react'
import { Tag, Popover, PopoverInteractionKind } from '@blueprintjs/core'
import { Layout } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'
import css from './RoleBindingsList.module.scss'

interface RoleBindingsListProps {
  data?: {
    item: string
    managed: boolean
  }[]
  length?: number
}

const RoleBindingsList: React.FC<RoleBindingsListProps> = ({ data, length = data?.length }) => {
  const baseData = data?.slice(0, length)
  const popoverData = data?.slice(length, data.length)
  const { getString } = useStrings()
  return (
    <>
      {baseData?.map(({ item, managed }) => (
        <Tag key={item} className={managed ? css.harnesstag : css.customtag}>
          {item}
        </Tag>
      ))}
      {popoverData?.length ? (
        <Popover interactionKind={PopoverInteractionKind.HOVER}>
          <Layout.Horizontal flex={{ align: 'center-center' }} spacing="xsmall">
            <Tag className={css.tag}>{getString('common.plusNumber', { number: popoverData?.length })}</Tag>
          </Layout.Horizontal>
          <Layout.Vertical padding="small" spacing="small">
            {popoverData?.map(({ item, managed }) => (
              <Tag key={item} className={managed ? css.harnesstag : css.customtag}>
                {item}
              </Tag>
            ))}
          </Layout.Vertical>
        </Popover>
      ) : null}
    </>
  )
}

export default RoleBindingsList
