import React, { useEffect, useMemo, useState } from 'react'
import { Dialog, Intent } from '@blueprintjs/core'
import {
  Button,
  useModalHook,
  Text,
  ButtonProps,
  Container,
  Layout,
  FlexExpander,
  Icon,
  Select,
  SimpleTagInput,
  TagInputProps,
  SelectOption
} from '@wings-software/uicore'
import { get } from 'lodash-es'
import {
  CFEntityType,
  CF_DEFAULT_PAGE_SIZE,
  getErrorMessage,
  SEGMENT_PRIMARY_COLOR,
  TARGET_PRIMARY_COLOR
} from '@cf/utils/CFUtils'
import { useStrings } from 'framework/strings'
import { useGetFeatureFlag, useGetTargetsAndSegments } from 'services/cf'
import { CFVariationColors } from '@cf/constants'
import { PageError } from '@common/components/Page/PageError'
import type { TargetGroupCollection, TargetCollection } from './types'

export interface VariationMappingModalButtonProps extends Omit<ButtonProps, 'onClick' | 'onSubmit'> {
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
  environmentIdentifier: string
  featureFlagIdentifier: string

  modalTitle: string
  submitButtonTitle?: string
  cancelButtonTitle?: string

  targets?: TargetGroupCollection
  targetGroups?: TargetGroupCollection
  variationIdentifier?: string
  excludeVariationIdentifiers?: string[]
  excludeTargetIdentifiers?: string[]
  excludeTargetGroupIdentifiers?: string[]

  onSubmit: (targets: TargetCollection, targetGroups: TargetGroupCollection, variationIdentifier: string) => void
}

const SEPARATOR = '////'

interface TagItem {
  label: string
  value: string
}

const toSelectedOptions = (targets?: TargetCollection, targetGroups?: TargetGroupCollection): string[] => {
  const options: string[] = []
  targets?.forEach(({ identifier, name }) => {
    options.push(`${identifier}${SEPARATOR}${CFEntityType.TARGET}${SEPARATOR}${name}`)
  })
  targetGroups?.forEach(({ identifier, name }) => {
    options.push(`${identifier}${SEPARATOR}${CFEntityType.TARGET_GROUP}${SEPARATOR}${name}`)
  })
  return options
}

const toTagItems = (targets?: TargetCollection, targetGroups?: TargetGroupCollection): TagItem[] => {
  const tagItems: TagItem[] = []
  targets?.forEach(({ identifier, name }) => {
    tagItems.push({
      label: name,
      value: `${identifier}${SEPARATOR}${CFEntityType.TARGET}${SEPARATOR}${name}`
    })
  })
  targetGroups?.forEach(({ identifier, name }) => {
    tagItems.push({
      label: name,
      value: `${identifier}${SEPARATOR}${CFEntityType.TARGET_GROUP}${SEPARATOR}${name}`
    })
  })
  return tagItems
}

export const VariationMappingModalButton: React.FC<VariationMappingModalButtonProps> = ({
  accountId,
  orgIdentifier,
  projectIdentifier,
  environmentIdentifier,
  featureFlagIdentifier,
  targets = [],
  targetGroups = [],
  variationIdentifier,
  excludeVariationIdentifiers,
  excludeTargetIdentifiers,
  excludeTargetGroupIdentifiers,
  modalTitle,
  submitButtonTitle,
  cancelButtonTitle,
  onSubmit,
  ...props
}) => {
  const ModalComponent: React.FC = () => {
    const { getString } = useStrings()
    const queryParams = {
      account: accountId,
      accountIdentifier: accountId,
      org: orgIdentifier,
      project: projectIdentifier,
      environment: environmentIdentifier,
      sortOrder: 'ASC' as 'ASC' | 'DESC',
      sortByField: 'name' as 'name' | 'identifier',
      pageSize: CF_DEFAULT_PAGE_SIZE
    }
    const {
      data: targetsAndTargetGroups,
      loading: loadingTargetsAndTargetGroups,
      error: errorTargetsAndTargetGroups,
      refetch: refetchTargetsAndTargetGroups
    } = useGetTargetsAndSegments({ queryParams })
    const tagItems = useMemo(() => {
      const _itemsFromProps = toTagItems(targets, targetGroups)

      targetsAndTargetGroups?.entities
        ?.filter(({ identifier, type }) => {
          switch (type) {
            case CFEntityType.TARGET:
              return !excludeTargetIdentifiers?.includes(identifier as string)

            case CFEntityType.TARGET_GROUP:
              return !excludeTargetGroupIdentifiers?.includes(identifier as string)
          }

          return true
        })
        ?.forEach(({ identifier, name, type }) => {
          const _itemFromFetch = {
            label: name as string,
            // target and target group may have the same identifier. Conbining identifier, type,
            // and name makes value unique
            value: `${identifier}${SEPARATOR}${type}${SEPARATOR}${name}`
          }

          const duplicatedIndex = _itemsFromProps.findIndex(item => {
            const [_identifier, _type] = item.value.split(SEPARATOR)
            return type === _type && identifier === _identifier
          })

          if (duplicatedIndex !== -1) {
            _itemsFromProps.splice(duplicatedIndex, 1)
          }

          _itemsFromProps.push(_itemFromFetch)
        })

      return _itemsFromProps
    }, [targetsAndTargetGroups])
    const [selectedTargetsAndTargetGroups, setSelectedTargetsAndTargetGroups] = useState<string[]>(
      toSelectedOptions(targets, targetGroups)
    )
    const {
      data: featureFlag,
      loading: loadingFeatureFlag,
      error: errorFeatureFlag,
      refetch: refetchFeatureFlag
    } = useGetFeatureFlag({
      identifier: featureFlagIdentifier,
      queryParams
    })
    const variationOptions: SelectOption[] = useMemo(
      () =>
        featureFlag?.variations
          ?.filter(({ identifier }) => !excludeVariationIdentifiers?.includes(identifier))
          ?.map((variation, index) => ({
            label: variation.name as string,
            value: variation.identifier,
            icon: {
              name: 'full-circle',
              style: { color: CFVariationColors[index] }
            }
          })) || [],
      [featureFlag]
    )
    const [variationOptionValue, setVariationOptionValue] = useState(
      variationOptions.find(variation => variation.value === variationIdentifier)
    )

    useEffect(() => {
      if (variationOptions?.length) {
        setVariationOptionValue(variationOptions.find(variation => variation.value === variationIdentifier))
      }
    }, [variationOptions])

    const [targetTargetGroupError, setTargetTargetGroupError] = useState<string | undefined>()
    const [variationError, setVariationError] = useState<string | undefined>()

    const onDone = (): void => {
      const _targets: { name: string; identifier: string }[] = []
      const _targetGroups: { name: string; identifier: string }[] = []
      const _variationIdentifier = variationOptionValue?.value as string

      selectedTargetsAndTargetGroups.forEach(entry => {
        const [identifier, type, name] = entry.split(SEPARATOR)

        if (type === CFEntityType.TARGET) {
          _targets.push({ identifier, name })
        } else {
          _targetGroups.push({ identifier, name })
        }
      })

      if (!_targets.length && !_targetGroups.length) {
        return setTargetTargetGroupError(getString('cf.pipeline.variationMapping.targetTargetGroupRequired'))
      }

      if (!_variationIdentifier) {
        return setVariationError(getString('cf.pipeline.variationMapping.variationRequired'))
      }

      onSubmit(_targets, _targetGroups, _variationIdentifier)
      hideModal()
    }

    const loading = loadingTargetsAndTargetGroups || loadingFeatureFlag
    const error = errorTargetsAndTargetGroups || errorFeatureFlag
    const count = selectedTargetsAndTargetGroups.length ? `(${selectedTargetsAndTargetGroups.length})` : undefined

    return (
      <Dialog
        enforceFocus={false}
        isOpen
        onClose={hideModal}
        title={
          <Text
            style={{
              fontWeight: 600,
              fontSize: '14px',
              color: 'var(--black)',
              lineHeight: '20px',
              padding: 'var(--spacing-large) 0 0 var(--spacing-small)'
            }}
          >
            {modalTitle}
          </Text>
        }
        style={{ width: 600, height: 500 }}
      >
        <Layout.Vertical style={{ height: '100%' }}>
          <Layout.Vertical padding="xlarge" spacing="xsmall" style={{ height: 'calc(100% - 120px)' }}>
            {(error && (
              <PageError
                message={getErrorMessage(error)}
                onClick={() => {
                  refetchFeatureFlag()
                  refetchTargetsAndTargetGroups()
                }}
              />
            )) || (
              <>
                <Text>{getString('cf.pipeline.variationMapping.targetTargetGroup', { count })}</Text>
                <Container>
                  <SimpleTagInput
                    fill
                    openOnKeyDown={false}
                    showClearAllButton
                    showNewlyCreatedItemsInList={false}
                    placeholder={getString('cf.pipeline.variationMapping.placeholder')}
                    getTagProps={(_value, _index, _selectedItems, _createdItems, _items) => {
                      const isItemATarget = (_selectedItems as string[])[_index].includes(
                        `${SEPARATOR}target${SEPARATOR}`
                      )

                      return {
                        intent: 'none',
                        minimal: true,
                        style: { backgroundColor: isItemATarget ? TARGET_PRIMARY_COLOR : SEGMENT_PRIMARY_COLOR }
                      }
                    }}
                    selectedItems={selectedTargetsAndTargetGroups}
                    items={async () => {
                      return new Promise(resolve => {
                        resolve({ items: (tagItems || []) as TagItem[] })
                      })
                    }}
                    onChange={selectedItems => {
                      setTargetTargetGroupError(undefined)
                      setSelectedTargetsAndTargetGroups(selectedItems as string[])
                      refetchTargetsAndTargetGroups({ queryParams: { ...queryParams, tsName: '' } })
                    }}
                    inputProps={
                      {
                        onChange: event => {
                          refetchTargetsAndTargetGroups({
                            queryParams: { ...queryParams, tsName: get(event, 'target.value') }
                          })
                        }
                      } as TagInputProps<TagItem>['inputProps']
                    }
                  />
                </Container>
                {targetTargetGroupError && (
                  <Text font="xsmall" intent="danger">
                    {targetTargetGroupError}
                  </Text>
                )}

                <Text style={{ '--layout-spacing': 'var(--spacing-medium)' } as React.CSSProperties}>
                  {getString('cf.pipeline.variationMapping.selectVariation')}
                </Text>
                <Select
                  value={variationOptionValue}
                  items={variationOptions}
                  onChange={opt => {
                    setVariationOptionValue(opt)
                    setVariationError(undefined)
                  }}
                />
                {variationError && (
                  <Text font="xsmall" intent="danger">
                    {variationError}
                  </Text>
                )}
              </>
            )}
          </Layout.Vertical>

          <Layout.Horizontal
            spacing="small"
            padding={{ top: 'xlarge', right: 'xxlarge', left: 'xlarge' }}
            style={{ alignItems: 'center' }}
          >
            <Button
              text={submitButtonTitle || getString('done')}
              intent={Intent.PRIMARY}
              disabled={loading || !!error}
              onClick={onDone}
            />
            <Button text={cancelButtonTitle || getString('cancel')} minimal onClick={hideModal} />
            <FlexExpander />
            {loading && <Icon intent={Intent.PRIMARY} name="spinner" size={16} />}
          </Layout.Horizontal>
        </Layout.Vertical>
      </Dialog>
    )
  }

  const [openModal, hideModal] = useModalHook(ModalComponent, [
    environmentIdentifier,
    featureFlagIdentifier,
    targets,
    targetGroups,
    variationIdentifier,
    excludeVariationIdentifiers,
    excludeTargetIdentifiers,
    excludeTargetGroupIdentifiers
  ])

  return <Button onClick={openModal} {...props} />
}
