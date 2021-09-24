import React from 'react'
import cx from 'classnames'
import { escape, isEmpty } from 'lodash-es'
import { useNestedAccordion } from '@wings-software/uicore'
import type { VariableResponseMapValue } from 'services/pipeline-ng'
import { CopyText } from '@common/components/CopyText/CopyText'
import { TagsPopover } from '@common/components'
import { getTextWithSearchMarkers, usePipelineVariables } from '../PipelineVariablesContext/PipelineVariablesContext'
import css from './VariablesListTable.module.scss'
export interface VariableRowProps {
  name: string
  fqn: string
  tags?: { [key: string]: string }
  metadataMap?: Record<string, VariableResponseMapValue>
  className?: string
  nameSectionClassName?: string
  valueSectionClassName?: string
}
export default function VariableListTagRow(props: VariableRowProps): React.ReactElement {
  const { searchText, searchIndex, searchResults = [] } = usePipelineVariables()
  const searchedEntity = searchResults[searchIndex || 0] || {}
  const tableRef = React.useRef()
  const { openNestedPath } = useNestedAccordion()

  React.useLayoutEffect(() => {
    if (tableRef.current) {
      const { testid: accordianId = '', open } =
        (tableRef?.current as any)?.closest?.('.Accordion--panel')?.dataset || {}
      if (open === 'false') {
        openNestedPath(accordianId?.replace('-panel', ''))
        setTimeout(() => {
          document?.querySelector('span.selected-search-text')?.scrollIntoView({ behavior: 'smooth' })
        }, 500)
      } else {
        ;(tableRef?.current as any)?.querySelector('span.selected-search-text')?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [searchIndex, openNestedPath, searchText])
  const searchedEntityType = searchedEntity.type || null

  return (
    <div ref={tableRef as any} className={cx(css.variableListRowItem, css.variableBorderBottom, props.className)}>
      <div className={cx(css.nameSection, props.nameSectionClassName)}>
        <CopyText className="variable-name-cell" textToCopy={props.fqn}>
          <span
            className={cx({
              'selected-search-text': searchedEntityType === 'key' && searchedEntity.path?.includes('.tags.')
            })}
            dangerouslySetInnerHTML={{
              __html: getTextWithSearchMarkers({
                searchText: escape(searchText),
                txt: escape(props.name),
                className: cx(css.selectedSearchText, {
                  [css.currentSelection]: false
                })
              })
            }}
          />
        </CopyText>
      </div>
      <div className={cx(css.valueSection, props.valueSectionClassName)}>
        {!isEmpty(props?.tags) && (
          <TagsPopover
            tags={Object.keys(props?.tags || {})
              .filter(tag => tag !== '__uuid')
              .reduce((acc: { [key: string]: string }, tag: string) => {
                acc[tag] = ''
                return acc
              }, {})}
          />
        )}
      </div>
    </div>
  )
}
