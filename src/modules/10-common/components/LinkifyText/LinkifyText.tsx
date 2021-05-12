import React from 'react'
import { Text, TextProps } from '@wings-software/uicore'

interface BrokenText {
  type: 'TEXT' | 'URL'
  content: string
}

export const breakOnLinks = (content = ''): BrokenText[] => {
  const LINK_REGEX = /(.)(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*))/g
  const nodes: BrokenText[] = []
  let index = 0
  let match: RegExpExecArray | null

  while ((match = LINK_REGEX.exec(content)) !== null) {
    const [, pre, url] = match

    const startIndex = match.index + pre.length

    if (startIndex > index) {
      nodes.push({ type: 'TEXT', content: content.substring(index, startIndex) })
    }

    nodes.push({ type: 'URL', content: url })

    index = LINK_REGEX.lastIndex
  }

  if (index < content.length) {
    nodes.push({ type: 'TEXT', content: content.substring(index) })
  }

  return nodes
}

export const LinkifyText: React.FC<{ content?: string; textProps?: TextProps; linkStyles?: string }> = props => {
  const { content, textProps = {}, linkStyles = '' } = props
  const textItems: BrokenText[] = breakOnLinks(content)
  return (
    <>
      {textItems.map((textItem, index) => {
        if (textItem.type === 'URL') {
          return (
            <a key={index} href={textItem.content} target="_blank" rel="noreferrer" className={linkStyles}>
              {textItem.content}
            </a>
          )
        } else {
          return (
            <Text key={index} {...textProps} inline>
              {textItem.content}
            </Text>
          )
        }
      })}
    </>
  )
}
