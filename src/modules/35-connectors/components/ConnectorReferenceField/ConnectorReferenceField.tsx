import React from 'react'
import { FormGroup, IFormGroupProps, Intent } from '@blueprintjs/core'
import {
  Layout,
  Icon,
  Color,
  Button,
  Tag,
  Text,
  getMultiTypeFromValue,
  MultiTypeInputType
} from '@wings-software/uicore'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import {
  Failure,
  ConnectorInfoDTO,
  getConnectorListPromise,
  ConnectorConfigDTO,
  GetConnectorListQueryParams,
  ConnectorResponse,
  getConnectorListV2Promise,
  ConnectorFilterProperties,
  useGetConnector,
  EntityGitDetails
} from 'services/cd-ng'
import {
  EntityReferenceResponse,
  getIdentifierFromValue,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import { getIconByType } from '@connectors/pages/connectors/utils/ConnectorUtils'
import useCreateConnectorModal, {
  UseCreateConnectorModalReturn
} from '@connectors/modals/ConnectorModal/useCreateConnectorModal'
import useCreateConnectorMultiTypeModal from '@connectors/modals/ConnectorModal/useCreateConnectorMultiTypeModal'
import { Scope } from '@common/interfaces/SecretsInterface'
import { String, useStrings } from 'framework/strings'
import { ReferenceSelect, ReferenceSelectProps } from '@common/components/ReferenceSelect/ReferenceSelect'
import type { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { ResourceScope } from '@rbac/interfaces/ResourceScope'
import type { IGitContextFormProps } from '@common/components/GitContextForm/GitContextForm'
import css from './ConnectorReferenceField.module.scss'

interface AdditionalParams {
  projectIdentifier?: string
  orgIdentifier?: string
}

const getAdditionalParams = ({
  scope,
  projectIdentifier,
  orgIdentifier
}: {
  scope?: string
  projectIdentifier?: string
  orgIdentifier?: string
}): AdditionalParams => {
  const additionalParams: AdditionalParams = {}

  if (scope === Scope.PROJECT) {
    additionalParams.projectIdentifier = projectIdentifier
  }

  if (scope === Scope.PROJECT || scope === Scope.ORG) {
    additionalParams.orgIdentifier = orgIdentifier
  }

  return additionalParams
}
export interface ConnectorSelectedValue {
  label: string
  value: string
  scope: Scope
  live: boolean
  connector: ConnectorInfoDTO & { gitDetails?: IGitContextFormProps }
}
export interface InlineSelectionInterface {
  selected: boolean
  inlineModalClosed: boolean
}
export interface ConnectorReferenceFieldProps extends Omit<IFormGroupProps, 'label'> {
  accountIdentifier: string
  name: string
  placeholder: string
  label: string | React.ReactElement
  projectIdentifier?: string
  selected?: ConnectorSelectedValue | string
  onChange?: (connector: ConnectorReferenceDTO, scope: Scope) => void
  orgIdentifier?: string
  gitScope?: GitFilterScope
  defaultScope?: Scope
  width?: number
  type?: ConnectorInfoDTO['type'] | ConnectorInfoDTO['type'][]
  category?: GetConnectorListQueryParams['category']
  error?: string
}

export interface ConnectorReferenceDTO extends ConnectorInfoDTO {
  status: ConnectorResponse['status']
  gitDetails?: EntityGitDetails
  harnessManaged?: boolean
}
export function getEditRenderer(
  selected: ConnectorSelectedValue,
  openConnectorModal: UseCreateConnectorModalReturn['openConnectorModal'],
  type: ConnectorInfoDTO['type'],
  canUpdate = true
): JSX.Element {
  return (
    <Layout.Horizontal spacing="small" style={{ justifyContent: 'space-between', width: '100%' }}>
      <div>
        <Text font={{ size: 'small' }}>
          <String stringID="thisConnectorIsSavedAs" />
        </Text>
        <Text font={{ weight: 'bold' }}>{selected?.value}</Text>
      </div>
      {canUpdate ? (
        <Button
          minimal
          icon="edit"
          onClick={e => {
            e.stopPropagation()
            openConnectorModal(true, type, {
              connectorInfo: selected?.connector,
              gitDetails: selected?.connector?.gitDetails
            })
          }}
          style={{
            color: 'var(--primary-7)'
          }}
        />
      ) : (
        <></>
      )}
    </Layout.Horizontal>
  )
}
export function getSelectedRenderer(selected: ConnectorSelectedValue): JSX.Element {
  return (
    <Layout.Horizontal spacing="small" flex={{ distribution: 'space-between' }} className={css.selectWrapper}>
      <Text tooltip={selected?.label} className={css.label} color={Color.GREY_800}>
        {selected?.label}
      </Text>

      <div className={css.rightStatus}>
        <Icon
          className={cx(css.status, { [css.redStatus]: !selected?.live }, { [css.greenStatus]: selected?.live })}
          data-testid={`crf-status`}
          name="full-circle"
          size={6}
          style={{ paddingRight: 'var(--spacing-xsmall)' }}
        />
        <Tag minimal className={css.tag}>
          {getScopeFromValue(selected?.value || '')}
        </Tag>
      </div>
    </Layout.Horizontal>
  )
}

interface GetReferenceFieldMethodProps extends ConnectorReferenceFieldProps {
  getString(key: string, vars?: Record<string, any>): string
  openConnectorModal: UseCreateConnectorModalReturn['openConnectorModal']
  type: ConnectorInfoDTO['type'] | ConnectorInfoDTO['type'][]
}

interface RecordRenderProps {
  item: EntityReferenceResponse<ConnectorReferenceDTO>
  resourceScope: ResourceScope
  openConnectorModal: GetReferenceFieldMethodProps['openConnectorModal']
  type: ConnectorInfoDTO['type'] | ConnectorInfoDTO['type'][]
  checked?: boolean
}

const RecordRender: React.FC<RecordRenderProps> = props => {
  const { item, resourceScope, openConnectorModal, type, checked } = props
  const [canUpdate] = usePermission(
    {
      resource: {
        resourceType: ResourceType.CONNECTOR,
        resourceIdentifier: item.identifier || ''
      },
      permissions: [PermissionIdentifier.UPDATE_CONNECTOR],
      resourceScope
    },
    []
  )
  return (
    <>
      <div className={css.item}>
        <Layout.Horizontal spacing="small" margin={{ right: 'small' }} className={css.connectorInfo}>
          <Icon name={getIconByType(item.record.type)} size={30}></Icon>
          <div className={css.connectorNameId}>
            <Text lineClamp={1} font={{ weight: 'bold' }}>
              {item.record.name}
            </Text>
            <Text lineClamp={1} font={{ size: 'small', weight: 'light' }} color={Color.GREY_450}>
              {item.identifier}
            </Text>
          </div>
        </Layout.Horizontal>
        <Layout.Horizontal spacing="xsmall">
          {canUpdate && !item.record.harnessManaged ? (
            <Button
              minimal
              icon="edit"
              className={css.editBtn}
              onClick={e => {
                e.stopPropagation()
                openConnectorModal(true, item.record?.type || type, {
                  connectorInfo: item.record,
                  gitDetails: { ...item.record?.gitDetails, getDefaultFromOtherRepo: false }
                })
              }}
              style={{
                color: 'var(--primary-4)'
              }}
            />
          ) : (
            <></>
          )}
          <Icon
            className={css.status}
            name="full-circle"
            size={6}
            color={item.record.status?.status === 'SUCCESS' ? Color.GREEN_500 : Color.RED_500}
          />
        </Layout.Horizontal>
      </div>
      {item.record.gitDetails?.repoIdentifier && (
        <Layout.Vertical margin={{ left: 'xsmall' }} spacing="small" className={css.gitInfo}>
          <Layout.Horizontal spacing="xsmall">
            <Icon name="repository" size={12}></Icon>
            <Text
              lineClamp={1}
              font={{ size: 'small', weight: 'light' }}
              color={Color.GREY_450}
              className={css.gitText}
            >
              {item.record.gitDetails.repoIdentifier}
            </Text>
          </Layout.Horizontal>
          <Layout.Horizontal spacing="xsmall">
            <Icon size={12} name="git-new-branch"></Icon>
            <Text
              lineClamp={1}
              font={{ size: 'small', weight: 'light' }}
              color={Color.GREY_450}
              className={css.gitText}
            >
              {item.record.gitDetails.branch}
            </Text>
          </Layout.Horizontal>
        </Layout.Vertical>
      )}
      <Icon className={cx(css.iconCheck, { [css.iconChecked]: checked })} name="pipeline-approval" />
    </>
  )
}

export function getReferenceFieldProps({
  defaultScope,
  gitScope,
  accountIdentifier,
  projectIdentifier,
  orgIdentifier,
  type = 'K8sCluster',
  category,
  name,
  width,
  selected,
  placeholder,
  getString,
  openConnectorModal
}: GetReferenceFieldMethodProps): Omit<ReferenceSelectProps<ConnectorReferenceDTO>, 'onChange'> {
  return {
    name,
    width,
    selectAnReferenceLabel: getString('selectAnExistingConnector'),
    selected: selected as ConnectorSelectedValue,
    placeholder,
    defaultScope,
    createNewLabel: getString('newConnector'),
    recordClassName: css.listItem,
    isNewConnectorLabelVisible: true,
    fetchRecords: (scope, search = '', done) => {
      const additionalParams = getAdditionalParams({ scope, projectIdentifier, orgIdentifier })
      const gitFilterParams =
        gitScope?.repo && gitScope?.branch
          ? {
              repoIdentifier: gitScope.repo,
              branch: gitScope.branch,
              getDefaultFromOtherRepo: gitScope.getDefaultFromOtherRepo ?? true
            }
          : {}
      const request = Array.isArray(type)
        ? getConnectorListV2Promise({
            queryParams: {
              accountIdentifier,
              searchTerm: search,
              ...additionalParams,
              ...gitFilterParams
            },
            body: {
              ...(!category && { types: type }),
              category,
              filterType: 'Connector',
              projectIdentifier: scope === Scope.PROJECT ? [projectIdentifier as string] : undefined,
              orgIdentifier: scope === Scope.PROJECT || scope === Scope.ORG ? [orgIdentifier as string] : undefined
            } as ConnectorFilterProperties
          })
        : getConnectorListPromise({
            queryParams: {
              accountIdentifier,
              // If we also pass "type" along with "category", "category" will be ignored
              ...(!category && { type }),
              ...gitFilterParams,
              category,
              searchTerm: search,
              projectIdentifier: scope === Scope.PROJECT ? projectIdentifier : undefined,
              orgIdentifier: scope === Scope.PROJECT || scope === Scope.ORG ? orgIdentifier : undefined
            }
          })

      return request
        .then(responseData => {
          if (responseData?.data?.content) {
            const connectors = responseData.data.content
            const response: EntityReferenceResponse<ConnectorReferenceDTO>[] = []
            connectors.forEach(connector => {
              response.push({
                name: connector.connector?.name || '',
                identifier: connector.connector?.identifier || '',
                record: {
                  ...connector.connector,
                  status: connector.status,
                  gitDetails: connector.gitDetails?.objectId ? connector.gitDetails : undefined,
                  harnessManaged: connector.harnessManaged
                } as ConnectorReferenceDTO
              })
            })
            done(response)
          } else {
            done([])
          }
        })
        .catch((err: Failure) => {
          throw err.message
        })
    },
    projectIdentifier,
    orgIdentifier,
    noRecordsText: getString('noConnectorFound'),
    recordRender: function recordRender({ item, selectedScope, selected: checked }) {
      const recordRenderProps: RecordRenderProps = {
        item,
        resourceScope: {
          accountIdentifier,
          orgIdentifier: selectedScope === Scope.ORG || selectedScope === Scope.PROJECT ? orgIdentifier : undefined,
          projectIdentifier: selectedScope === Scope.PROJECT ? projectIdentifier : undefined
        },
        openConnectorModal,
        type,
        checked
      }
      return <RecordRender {...recordRenderProps} />
    }
  }
}

export const ConnectorReferenceField: React.FC<ConnectorReferenceFieldProps> = props => {
  const {
    defaultScope,
    gitScope,
    accountIdentifier,
    projectIdentifier,
    orgIdentifier,
    type = 'K8sCluster',
    name,
    selected,
    label,
    width = 400,
    placeholder,
    category,
    error,
    disabled,
    ...rest
  } = props

  const [inlineSelection, setInlineSelection] = React.useState<InlineSelectionInterface>({
    selected: false,
    inlineModalClosed: false
  })
  const { openConnectorModal } = useCreateConnectorModal({
    onSuccess: (data?: ConnectorConfigDTO) => {
      if (data) {
        props.onChange?.({ ...data.connector, status: data.status }, Scope.PROJECT)
        setInlineSelection({
          selected: true,
          inlineModalClosed: false
        })
      }
    },
    onClose: () => {
      setInlineSelection({
        selected: inlineSelection.selected,
        inlineModalClosed: true
      })
    }
  })

  const { openConnectorMultiTypeModal } = useCreateConnectorMultiTypeModal({
    types: Array.isArray(type) ? type : [type],
    onSuccess: (data?: ConnectorConfigDTO) => {
      if (data) {
        props.onChange?.({ ...data.connector, status: data.status }, Scope.PROJECT)
        setInlineSelection({
          selected: true,
          inlineModalClosed: false
        })
      }
    },
    onClose: () => {
      setInlineSelection({
        selected: inlineSelection.selected,
        inlineModalClosed: true
      })
    }
  })

  const [canUpdate] = usePermission(
    {
      resource: {
        resourceType: ResourceType.CONNECTOR
      },
      permissions: [PermissionIdentifier.UPDATE_CONNECTOR]
    },
    []
  )

  const [selectedValue, setSelectedValue] = React.useState(selected)

  const scopeFromSelected = typeof selected === 'string' && getScopeFromValue(selected || '')
  const selectedRef = typeof selected === 'string' && getIdentifierFromValue(selected || '')
  const { data: connectorData, loading, refetch } = useGetConnector({
    identifier: selectedRef as string,
    queryParams: {
      accountIdentifier,
      orgIdentifier: scopeFromSelected === Scope.ORG || scopeFromSelected === Scope.PROJECT ? orgIdentifier : undefined,
      projectIdentifier: scopeFromSelected === Scope.PROJECT ? projectIdentifier : undefined,
      ...(!isEmpty(gitScope?.repo) && !isEmpty(gitScope?.branch)
        ? {
            branch: gitScope?.branch,
            repoIdentifier: gitScope?.repo,
            getDefaultFromOtherRepo: true
          }
        : {})
    },
    lazy: true
  })

  React.useEffect(() => {
    if (
      typeof selected == 'string' &&
      getMultiTypeFromValue(selected) === MultiTypeInputType.FIXED &&
      selected.length > 0
    ) {
      refetch()
    } else {
      setSelectedValue(selected)
    }
  }, [selected])

  React.useEffect(() => {
    if (
      typeof selected === 'string' &&
      getMultiTypeFromValue(selected) === MultiTypeInputType.FIXED &&
      connectorData &&
      connectorData?.data?.connector?.name &&
      !loading
    ) {
      const scope = getScopeFromValue(selected || '')
      const value = {
        label: connectorData?.data?.connector?.name,
        value:
          scope === Scope.ORG || scope === Scope.ACCOUNT
            ? `${scope}.${connectorData?.data?.connector?.identifier}`
            : connectorData?.data?.connector?.identifier,
        scope: scope,
        live: connectorData?.data?.status?.status === 'SUCCESS',
        connector: connectorData?.data?.connector
      }
      setSelectedValue(value)
    }
  }, [
    connectorData?.data?.connector?.name,
    loading,
    selected,
    defaultScope,
    connectorData,
    connectorData?.data?.connector?.identifier,
    connectorData?.data?.status?.status,
    name
  ])

  const helperText = error ? error : undefined
  const intent = error ? Intent.DANGER : Intent.NONE
  const { getString } = useStrings()

  const placeHolderLocal = loading ? getString('loading') : placeholder
  const optionalReferenceSelectProps: Pick<
    ReferenceSelectProps<ConnectorConfigDTO>,
    'createNewHandler' | 'editRenderer'
  > = {}

  if (typeof type === 'string' && !category) {
    optionalReferenceSelectProps.createNewHandler = () => {
      gitScope && (gitScope.getDefaultFromOtherRepo = true)
      openConnectorModal(false, type, {
        gitDetails: { ...gitScope, getDefaultFromOtherRepo: !!gitScope?.getDefaultFromOtherRepo }
      })
    }
  } else if (Array.isArray(type) && !category) {
    optionalReferenceSelectProps.createNewHandler = () => {
      openConnectorMultiTypeModal({
        gitDetails: { ...gitScope, getDefaultFromOtherRepo: !!gitScope?.getDefaultFromOtherRepo }
      })
    }
  }

  const [canUpdateSelectedConnector] = usePermission(
    {
      resource: {
        resourceType: ResourceType.CONNECTOR,
        resourceIdentifier: (selectedValue as ConnectorSelectedValue)?.connector?.identifier || ''
      },
      permissions: [PermissionIdentifier.UPDATE_CONNECTOR]
    },
    []
  )

  if (typeof type === 'string' && typeof selectedValue === 'object') {
    optionalReferenceSelectProps.editRenderer = getEditRenderer(
      selectedValue as ConnectorSelectedValue,
      openConnectorModal,
      (selectedValue as ConnectorSelectedValue)?.connector?.type || type,
      canUpdateSelectedConnector
    )
  } else if (Array.isArray(type) && typeof selectedValue === 'object') {
    optionalReferenceSelectProps.editRenderer = getEditRenderer(
      selectedValue as ConnectorSelectedValue,
      openConnectorModal,
      (selectedValue as ConnectorSelectedValue)?.connector?.type || type[0],
      canUpdateSelectedConnector
    )
  }

  return (
    <FormGroup {...rest} label={label} helperText={helperText} intent={intent}>
      <ReferenceSelect<ConnectorReferenceDTO>
        onChange={(connector, scope) => {
          props.onChange?.(connector, scope)
        }}
        {...getReferenceFieldProps({
          defaultScope,
          gitScope,
          accountIdentifier,
          projectIdentifier,
          orgIdentifier,
          type,
          name,
          selected: selectedValue,
          width,
          placeholder: placeHolderLocal,
          label,
          getString,
          category,
          openConnectorModal
        })}
        hideModal={inlineSelection.selected && inlineSelection.inlineModalClosed}
        isNewConnectorLabelVisible={canUpdate}
        selectedRenderer={getSelectedRenderer(selectedValue as ConnectorSelectedValue)}
        {...optionalReferenceSelectProps}
        disabled={disabled || loading}
      />
    </FormGroup>
  )
}
