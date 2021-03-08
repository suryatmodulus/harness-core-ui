import React from 'react'
import { useParams } from 'react-router-dom'
import { SimpleTagInput, Text, Icon, Color } from '@wings-software/uicore'
import { useToaster } from '@common/exports'
import { useStrings } from 'framework/exports'
import { useGetDelegateSelectors } from 'services/portal'

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

const formatSelectors = (data: any) => {
  const selectors: Array<string> = data?.resource
  return selectors
}

interface DelegateSelectorsProps {
  placeholder?: string
}

export const DelegateSelectors = (
  props: Partial<React.ComponentProps<typeof SimpleTagInput> & DelegateSelectorsProps>
): JSX.Element => {
  const { accountId } = useParams()
  const { getString } = useStrings()
  const { showError } = useToaster()

  const { data, loading } = useGetDelegateSelectors({ queryParams: { accountId } })

  const selectors = formatSelectors(data)

  return (
    <div data-name="DelegateSelectors">
      {loading ? (
        <Icon margin="medium" name="spinner" size={15} color={Color.BLUE_500} />
      ) : (
        <SimpleTagInput
          fill
          items={selectors}
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
            const validTag = new RegExp('^[a-z0-9-${}._]+$', 'i').test(tag)
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
