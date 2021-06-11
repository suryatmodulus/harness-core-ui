import React from 'react'
import cx from 'classnames'
import { Text, Popover, Layout, Icon, Container, Tag } from '@wings-software/uicore'
import { PopoverInteractionKind } from '@blueprintjs/core'

import type { tagsType } from '@common/utils/types'
import i18n from './TagsPopover.i18n'
import css from './TagsPopover.module.scss'

export interface ListTagsProps {
  tags: tagsType
  tagClassName?: string
  target?: React.ReactElement
}
const TagsPopover: React.FC<ListTagsProps> = props => {
  const { tags, target, tagClassName } = props
  return (
    <Popover interactionKind={PopoverInteractionKind.HOVER}>
      {target || (
        <Layout.Horizontal flex={{ align: 'center-center' }} spacing="xsmall">
          <Icon name="main-tags" size={15} />
          <Text>{Object.keys(tags).length}</Text>
        </Layout.Horizontal>
      )}
      <Container padding="small">
        <Text font={{ size: 'small', weight: 'bold' }}>{i18n.tags}</Text>
        <Container className={css.tagsPopover}>
          {Object.keys(tags).map(key => {
            const value = tags[key]
            return (
              <Tag className={cx(css.tag, tagClassName)} key={key}>
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
