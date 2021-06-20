import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { SimpleTagInput, Text, Icon, Color } from '@wings-software/uicore'
import { useToaster } from '@common/exports'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useStrings } from 'framework/strings'
import { useGetDelegateSelectorsUpTheHierarchy, useGetDelegateSelectors } from 'services/portal'

import type { AccountPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import css from './DelegateSelectors.module.scss'

const isValidExpression = (tag: string, showError: any, errorMsg: string) => {
  let validExpression = true
  if (tag.includes('${')) {
    validExpression = tag.includes('${') && tag.includes('}')
    if (!validExpression) {
      showError(errorMsg, 5000)
    }
  }
  return validExpression
}

interface DelegateSelectorsProps {
  placeholder?: string
  pollingInterval?: number
}

export const DelegateSelectors = (
  props: Partial<React.ComponentProps<typeof SimpleTagInput> & DelegateSelectorsProps & ProjectPathProps>
): JSX.Element => {
  const { accountId } = useParams<AccountPathProps>()
  const { orgIdentifier, projectIdentifier, pollingInterval = null } = props

  const { getString } = useStrings()
  const { showError } = useToaster()
  const { NG_CG_TASK_ASSIGNMENT_ISOLATION } = useFeatureFlags()

  const getDelegateSelectors = NG_CG_TASK_ASSIGNMENT_ISOLATION
    ? useGetDelegateSelectorsUpTheHierarchy
    : useGetDelegateSelectors
  const queryParams = NG_CG_TASK_ASSIGNMENT_ISOLATION
    ? { accountId, orgId: orgIdentifier, projectId: projectIdentifier }
    : {
        accountId
      }
  const { data: apiData, loading, refetch } = getDelegateSelectors({
    queryParams
  })

  const [data, setData] = useState(apiData)

  useEffect(() => {
    if (apiData) {
      setData(apiData)
    }
  }, [apiData])

  // polling logic
  useEffect(() => {
    if (pollingInterval === null) {
      return
    }
    let id: NodeJS.Timeout
    if (!loading) {
      id = setTimeout(() => refetch(), pollingInterval)
    }
    return () => clearTimeout(id)
  }, [data, loading, refetch, pollingInterval])

  return (
    <div data-name="DelegateSelectors">
      {loading && !data ? (
        <Icon margin="medium" name="spinner" size={15} color={Color.BLUE_500} />
      ) : (
        <SimpleTagInput
          fill
          popoverProps={{
            usePortal: false,
            minimal: true,
            position: 'bottom-left',
            className: css.delegatePopover
          }}
          items={data?.resource || []}
          {...props}
          allowNewTag
          getTagProps={(value, _index, _selectedItems, createdItems, items) => {
            const _value = value as string
            const isItemNewlyCreated = createdItems.includes(_value) || !items.includes(_value)
            const isExpression = isItemNewlyCreated && _value.startsWith('${') && _value.endsWith('}')
            return isExpression
              ? { intent: 'none', minimal: true }
              : isItemNewlyCreated
              ? { intent: 'danger', minimal: true }
              : { intent: 'primary', minimal: true }
          }}
          validateNewTag={(tag: string) => {
            const pattern = new RegExp('^[a-z0-9-${}]+$', 'i')
            const validTag = new RegExp('^[a-z0-9-${}._<>+]+$', 'i').test(tag)
            const tagChars = tag.split('')
            const validExpression = isValidExpression(
              tag,
              showError,
              getString('delegate.DelegateSelectorErrorMessage')
            )
            const invalidChars = new Set()

            if (!validTag) {
              const errorMsg = (
                <Text>
                  {getString('delegate.DelegateSelector')}
                  <>
                    {tagChars.map((item: string) => {
                      if (!pattern.test(item)) {
                        invalidChars.add(item)
                        return <strong style={{ color: 'red' }}>{item}</strong>
                      } else {
                        return item
                      }
                    })}
                  </>
                  {getString('delegate.DelegateSelectorErrMsgSplChars')}: {Array.from(invalidChars).join(',')}
                </Text>
              )
              showError(errorMsg, 5000)
            }
            return validTag && validExpression
          }}
          placeholder={props.placeholder || getString('delegate.Delegate_Selector_placeholder')}
        />
      )}
    </div>
  )
}

export default DelegateSelectors
