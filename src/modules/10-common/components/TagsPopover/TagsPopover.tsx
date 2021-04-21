import React from 'react'
import { Text, Popover, Layout, Icon, Container, Tag } from '@wings-software/uicore'
import { PopoverInteractionKind } from '@blueprintjs/core'

import type { tagsType } from '@common/utils/types'
import { useStrings } from 'framework/exports'
import css from './TagsPopover.module.scss'

export interface ListTagsProps {
  tags: tagsType
  target?: React.ReactElement
}
const TagsPopover: React.FC<ListTagsProps> = props => {
  const { tags, target } = props
  const { getString } = useStrings()
  return (
    <Popover interactionKind={PopoverInteractionKind.HOVER}>
      {target || (
        <Layout.Horizontal flex={{ align: 'center-center' }} spacing="xsmall">
          <Icon name="main-tags" size={15} />
          <Text>{Object.keys(tags).length}</Text>
        </Layout.Horizontal>
      )}
      <Container padding="small">
        <Text font={{ size: 'small', weight: 'bold' }} className={css.label}>
          {getString('common.tagsLabel')}
        </Text>
        <Container className={css.tagsPopover}>
          {Object.keys(tags).map(key => {
            const value = tags[key]
            return (
              <Tag className={css.tag} key={key}>
                {value ? `${key}:${value}` : key}
              </Tag>
            )
          })}
        </Container>
      </Container>
    </Popover>
  )
}

export default TagsPopover
