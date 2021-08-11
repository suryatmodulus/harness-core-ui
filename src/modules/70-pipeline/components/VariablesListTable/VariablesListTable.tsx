import React from 'react'
import { isPlainObject, get, isNil } from 'lodash-es'
import cx from 'classnames'

import { Text, useNestedAccordion } from '@wings-software/uicore'
import { CopyText } from '@common/components/CopyText/CopyText'
import type { VariableResponseMapValue } from 'services/pipeline-ng'
import { toVariableStr } from '@common/utils/StringUtils'

import { getTextWithSearchMarkers, usePipelineVariables } from '../PipelineVariablesContext/PipelineVariablesContext'
import css from './VariablesListTable.module.scss'

export interface VariableListTableProps<T = Record<string, any>> {
  data: T
  originalData: T
  metadataMap: Record<string, VariableResponseMapValue>
  className?: string
}

export function VariablesListTable<T>(props: VariableListTableProps<T>): React.ReactElement | null {
  const { data, metadataMap, originalData, className } = props
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
  if (!data || !originalData || !metadataMap) return null
  return (
    <div className={cx(css.variablesListTable, className)} ref={tableRef as any}>
      {Object.entries(data || {}).map(([key, value]) => {
        if (typeof value !== 'string' || key === 'uuid' || isNil(value)) return null

        const metadata = metadataMap[value]
        const finalvalue = get(originalData, key)
        let formattedValue
        if (Array.isArray(finalvalue)) {
          formattedValue = finalvalue
            .map(item => (isPlainObject(item) ? JSON.stringify(item, null, 2) : item))
            .join(', ')
        } else if (isPlainObject(finalvalue)) {
          formattedValue = JSON.stringify(finalvalue, null, 2)
        } else {
          formattedValue = finalvalue
        }

        if (isNil(metadata) || isNil(formattedValue)) return null
        const variableNameParts = metadata.yamlProperties?.localName?.split('.') || []
        const vairableName = variableNameParts[variableNameParts?.length - 1]
        const searchedEntityType = searchedEntity.type || null
        formattedValue = formattedValue.toString()
        const hasSameMetaKeyId = searchedEntity.metaKeyId === value

        return (
          <div key={key} className={css.variableListRow}>
            <CopyText className="variable-name-cell" textToCopy={toVariableStr(metadata.yamlProperties?.fqn || '')}>
              <span
                className={cx({
                  [css.selectedSearchText]: searchedEntityType === 'key' && hasSameMetaKeyId,
                  'selected-search-text': searchedEntityType === 'key' && hasSameMetaKeyId
                })}
                dangerouslySetInnerHTML={{
                  __html: getTextWithSearchMarkers({ searchText, txt: vairableName })
                }}
              />
            </CopyText>
            <Text lineClamp={1}>
              <span
                className={cx({
                  [css.selectedSearchText]: searchedEntityType === 'value' && hasSameMetaKeyId,
                  'selected-search-text': searchedEntityType === 'value' && hasSameMetaKeyId
                })}
                dangerouslySetInnerHTML={{
                  __html: getTextWithSearchMarkers({ searchText, txt: formattedValue })
                }}
              />
            </Text>
          </div>
        )
      })}
    </div>
  )
}
