import React, { useState } from 'react'
import { Icon, SelectOption, Text, Button, Container, Layout, ButtonVariation, Color } from '@wings-software/uicore'
import { Select } from '@blueprintjs/select'
import { MenuItem } from '@blueprintjs/core'
import cx from 'classnames'
import {
  ListSecretsV2QueryParams,
  Failure,
  listSecretsV2Promise,
  SecretDTOV2,
  SecretTextSpecDTO,
  ResponsePageSecretResponseWrapper,
  ConnectorInfoDTO
} from 'services/cd-ng'
import { EntityReference } from '@common/exports'
import { EntityReferenceResponse, getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import { useStrings } from 'framework/strings'
import useCreateUpdateSecretModal from '@secrets/modals/CreateSecretModal/useCreateUpdateSecretModal'
import SecretEmptyState from '../../pages/secrets/secrets-empty-state.png'
import type { SecretFormData } from '../CreateUpdateSecret/CreateUpdateSecret'
import css from './SecretReference.module.scss'

const CustomSelect = Select.ofType<SelectOption>()
export interface SecretRef extends SecretDTOV2 {
  scope: Scope
}

export interface SecretReferenceProps {
  onSelect: (secret: SecretRef) => void
  accountIdentifier: string
  projectIdentifier?: string
  orgIdentifier?: string
  defaultScope?: Scope
  type?: ListSecretsV2QueryParams['type']
  mock?: ResponsePageSecretResponseWrapper
  connectorTypeContext?: ConnectorInfoDTO['type']
  onCancel?: () => void
  handleInlineSSHSecretCreation?: () => void
}

const fetchRecords = (
  pageIndex: number,
  setPagedSecretData: (data: ResponsePageSecretResponseWrapper) => void,
  scope: Scope,
  search: string | undefined,
  done: (records: EntityReferenceResponse<SecretRef>[]) => void,
  type: ListSecretsV2QueryParams['type'],
  accountIdentifier: string,
  projectIdentifier?: string,
  orgIdentifier?: string,
  mock?: ResponsePageSecretResponseWrapper,
  connectorTypeContext?: ConnectorInfoDTO['type']
): void => {
  const secretManagerTypes: ConnectorInfoDTO['type'][] = [
    'AwsKms',
    'AzureKeyVault',
    'Vault',
    'AwsSecretManager',
    'GcpKms'
  ]
  let sourceCategory: ListSecretsV2QueryParams['source_category'] | undefined
  if (connectorTypeContext && secretManagerTypes.includes(connectorTypeContext)) {
    sourceCategory = 'SECRET_MANAGER'
  }

  listSecretsV2Promise({
    queryParams: {
      accountIdentifier,
      type,
      searchTerm: search?.trim(),
      projectIdentifier: scope === Scope.PROJECT ? projectIdentifier : undefined,
      orgIdentifier: scope === Scope.PROJECT || scope === Scope.ORG ? orgIdentifier : undefined,
      source_category: sourceCategory,
      pageIndex: pageIndex,
      pageSize: 10
    },
    mock
  })
    .then(responseData => {
      if (responseData?.data?.content) {
        const secrets = responseData.data.content
        setPagedSecretData(responseData)
        const response: EntityReferenceResponse<SecretRef>[] = []
        secrets.forEach(secret => {
          response.push({
            name: secret.secret.name || '',
            identifier: secret.secret.identifier || '',
            record: { ...secret.secret, scope }
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
}

const SecretReference: React.FC<SecretReferenceProps> = props => {
  const {
    defaultScope,
    accountIdentifier,
    projectIdentifier,
    orgIdentifier,
    type,
    mock,
    connectorTypeContext,
    handleInlineSSHSecretCreation
  } = props
  const { getString } = useStrings()
  const [pagedSecretData, setPagedSecretData] = useState<ResponsePageSecretResponseWrapper>({})
  const [pageNo, setPageNo] = useState(0)
  const secretTypeOptions: SelectOption[] = [
    {
      label: getString('secrets.secret.labelText'),
      value: 'SecretText'
    },
    {
      label: getString('secrets.secret.labelFile'),
      value: 'SecretFile'
    }
  ]
  const defaultSecretType = secretTypeOptions.findIndex(val => val.value === type)
  const [secretType, setSecretType] = React.useState<SelectOption>(
    secretTypeOptions[defaultSecretType === -1 ? 0 : defaultSecretType]
  )
  const { openCreateSecretModal } = useCreateUpdateSecretModal({
    onSuccess: data => {
      props.onSelect({
        ...data,
        spec: {},
        scope: getScopeFromDTO<SecretFormData>(data)
      })
      //refetch()
    }
  })
  const selectTypeDropdown = (
    <Container flex={{ alignItems: 'baseline' }}>
      <Text margin={{ left: 'medium', right: 'xsmall' }}>{getString('secrets.secret.labelSecretType')}</Text>
      <CustomSelect
        items={secretTypeOptions}
        filterable={false}
        itemRenderer={(item, { handleClick }) => (
          <MenuItem className={css.popoverWidth} key={item.value as string} text={item.label} onClick={handleClick} />
        )}
        onItemSelect={item => {
          setSecretType(item)
        }}
        popoverProps={{ minimal: true, popoverClassName: css.popoverWidth }}
      >
        <Button
          className={css.selectButton}
          width={60}
          inline
          minimal
          rightIcon="chevron-down"
          text={secretType.label}
        />
      </CustomSelect>
    </Container>
  )
  return (
    <Container className={css.secretRefContainer}>
      <Layout.Horizontal className={css.createSecretsBtnLayout}>
        {type !== 'SSHKey' && (
          <Button
            text={
              type === 'SecretText' || secretType.value === 'SecretText'
                ? getString('secrets.secret.newSecretText')
                : getString('secrets.secret.newSecretFile')
            }
            icon="plus"
            onClick={() =>
              openCreateSecretModal(
                type === 'SecretText' || secretType.value === 'SecretText' ? 'SecretText' : 'SecretFile'
              )
            }
            variation={ButtonVariation.SECONDARY}
            margin={{ bottom: 'medium' }}
          />
        )}
        {type === 'SSHKey' && handleInlineSSHSecretCreation && (
          <Button
            text={getString('secrets.secret.newSSHCredential')}
            icon="plus"
            onClick={handleInlineSSHSecretCreation}
            variation={ButtonVariation.SECONDARY}
            margin={{ bottom: 'medium' }}
          />
        )}
      </Layout.Horizontal>
      <EntityReference<SecretRef>
        onSelect={(secret, scope) => {
          secret.scope = scope
          props.onSelect(secret)
        }}
        defaultScope={defaultScope}
        noDataCard={{
          image: SecretEmptyState,
          message: getString('secrets.secret.noSecretsFound'),
          containerClassName: css.noDataCardContainerSecret,
          className: css.noDataCardContainerSecret
        }}
        recordClassName={css.listItem}
        fetchRecords={(page = 0, scope, search, done) => {
          const selectedType = type || (secretType?.value as SecretDTOV2['type'])
          fetchRecords(
            page,
            setPagedSecretData,
            scope,
            search,
            done,
            selectedType,
            accountIdentifier,
            projectIdentifier,
            orgIdentifier,
            mock,
            connectorTypeContext
          )
        }}
        projectIdentifier={projectIdentifier}
        orgIdentifier={orgIdentifier}
        onCancel={props.onCancel}
        noRecordsText={getString('secrets.secret.noSecretsFound')}
        searchInlineComponent={!type ? selectTypeDropdown : undefined}
        renderTabSubHeading
        pagination={{
          itemCount: pagedSecretData?.data?.totalItems || 0,
          pageSize: pagedSecretData?.data?.pageSize || 10,
          pageCount: pagedSecretData?.data?.totalPages || -1,
          pageIndex: pageNo || 0,
          gotoPage: pageIndex => setPageNo(pageIndex)
        }}
        recordRender={({ item, selected }) => (
          <>
            <Layout.Horizontal className={css.item} flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Layout.Horizontal flex={{ alignItems: 'center' }}>
                {item.record.type === 'SecretText' || item.record.type === 'SecretFile' ? (
                  <Icon
                    name={item.record.type === 'SecretText' ? 'text' : 'file'}
                    size={24}
                    className={css.secretIcon}
                  />
                ) : null}
                <Layout.Vertical>
                  <Text lineClamp={1} font={{ weight: 'bold' }} color={Color.BLACK}>
                    {item.record.name}
                  </Text>
                  {item.record.type === 'SecretText' || item.record.type === 'SecretFile' ? (
                    <Text lineClamp={1} font={{ size: 'small', weight: 'light' }} color={Color.GREY_600}>
                      {`${getString('common.ID')}: ${item.identifier}.${
                        (item.record.spec as SecretTextSpecDTO).secretManagerIdentifier
                      }`}
                    </Text>
                  ) : null}
                  {item.record.type === 'SSHKey' ? (
                    <Text lineClamp={1} font={{ size: 'small', weight: 'light' }} color={Color.GREY_600}>
                      {`${getString('common.ID')}: ${item.identifier}`}
                    </Text>
                  ) : null}
                </Layout.Vertical>
              </Layout.Horizontal>
              <Icon className={cx(css.iconCheck, { [css.iconChecked]: selected })} name="pipeline-approval" />
            </Layout.Horizontal>
          </>
        )}
      />
    </Container>
  )
}

export default SecretReference
