import React from 'react'
import { Container } from '@wings-software/uicore'
import TagsRenderer, { ListTagsProps } from '@common/components/TagsRenderer/TagsRenderer'
import css from './TemplateTags.module.scss'

export const TemplateTags: React.FC<ListTagsProps> = (props): JSX.Element => {
  const { tags } = props
  const [length, setLength] = React.useState(Object.keys(tags).length)
  const ref = React.useRef<HTMLDivElement | null>(null)

  React.useLayoutEffect(() => {
    const currentHeight = ref?.current?.clientHeight
    if (currentHeight && currentHeight > 20) {
      setLength(length - 1)
    }
  }, [length])

  return (
    <Container className={css.container}>
      <Container ref={ref}>
        <TagsRenderer
          className={css.tagsContainer}
          tagClassName={css.tag}
          targetClassName={css.count}
          {...props}
          length={length}
        />
      </Container>
    </Container>
  )
}
