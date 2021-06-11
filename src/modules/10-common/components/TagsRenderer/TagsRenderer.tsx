import React from 'react'
import { Text, Layout, Tag } from '@wings-software/uicore'
import TagsPopover from '@common/components/TagsPopover/TagsPopover'

import type { tagsType } from '@common/utils/types'
import { useStrings } from 'framework/strings'

export interface ListTagsProps {
  tags: tagsType
  length?: number
  className?: string
  tagClassName?: string
  width?: number
}

const getWidthForTags = (length: number, width: number): number => {
  switch (length) {
    case 1:
      return width
    case 2:
      return width / 2
    default:
      return width / 3
  }
}
const TagsRenderer: React.FC<ListTagsProps> = props => {
  const { tags, length = 3, className, width = 240, tagClassName } = props
  const baseTags = Object.keys(tags).slice(0, length)
  const remainingTags = Object.keys(tags)
    .slice(length)
    .reduce((result: tagsType, key) => {
      result[key] = tags[key]
      return result
    }, {})
  const { getString } = useStrings()
  return (
    <>
      <Layout.Horizontal spacing="xsmall" className={className}>
        {baseTags.map(key => {
          const value = tags[key]
          return (
            <Tag style={{ maxWidth: getWidthForTags(baseTags.length, width) }} className={tagClassName} key={key}>
              {value ? `${key}:${value}` : key}
            </Tag>
          )
        })}
        {Object.keys(tags).length - length > 0 && (
          <TagsPopover
            tags={remainingTags}
            tagClassName={tagClassName}
            target={<Text>{getString('plus') + (Object.keys(tags).length - length)}</Text>}
          />
        )}
      </Layout.Horizontal>
    </>
  )
}

export default TagsRenderer
