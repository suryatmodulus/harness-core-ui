import React from 'react'
import {
  ExpressionAndRuntimeTypeProps,
  getMultiTypeFromValue,
  MultiTypeInputValue,
  MultiTypeInputType,
  DataTooltipInterface,
  HarnessDocTooltip,
  Container
} from '@wings-software/uicore'
import { connect, FormikContext } from 'formik'
import { FormGroup, Intent } from '@blueprintjs/core'
import { get } from 'lodash-es'
import useCreateConnectorModal from '@connectors/modals/ConnectorModal/useCreateConnectorModal'
import useCreateConnectorMultiTypeModal from '@connectors/modals/ConnectorModal/useCreateConnectorMultiTypeModal'
import { ConnectorConfigDTO, ConnectorInfoDTO, ConnectorResponse, useGetConnector } from 'services/cd-ng'
import { ConfigureOptions, ConfigureOptionsProps } from '@common/components/ConfigureOptions/ConfigureOptions'
import { Scope } from '@common/interfaces/SecretsInterface'
import { useStrings } from 'framework/strings'
import { errorCheck } from '@common/utils/formikHelpers'
import {
  getIdentifierFromValue,
  getScopeFromDTO,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import {
  MultiTypeReferenceInput,
  MultiTypeReferenceInputProps,
  ReferenceSelectProps
} from '@common/components/ReferenceSelect/ReferenceSelect'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import {
  ConnectorReferenceFieldProps,
  getReferenceFieldProps,
  getEditRenderer,
  getSelectedRenderer,
  InlineSelectionInterface
} from './ConnectorReferenceField'

export interface MultiTypeConnectorFieldConfigureOptionsProps
  extends Omit<ConfigureOptionsProps, 'value' | 'type' | 'variableName'> {
  variableName?: ConfigureOptionsProps['variableName']
}
export interface MultiTypeConnectorFieldProps extends Omit<ConnectorReferenceFieldProps, 'onChange'> {
  onChange?: ExpressionAndRuntimeTypeProps['onChange']
  formik?: FormikContext<any>
  multiTypeProps?: Omit<MultiTypeReferenceInputProps<ConnectorReferenceDTO>, 'name' | 'referenceSelectProps'>
  isNewConnectorLabelVisible?: boolean
  configureOptionsProps?: MultiTypeConnectorFieldConfigureOptionsProps
  enableConfigureOptions?: boolean
  setRefValue?: boolean
  style?: React.CSSProperties
  tooltipProps?: DataTooltipInterface
}
export interface ConnectorReferenceDTO extends ConnectorInfoDTO {
  status: ConnectorResponse['status']
}

export const MultiTypeConnectorField = (props: MultiTypeConnectorFieldProps): React.ReactElement => {
  const {
    defaultScope,
    accountIdentifier,
    projectIdentifier,
    orgIdentifier,
    type = 'K8sCluster',
    category,
    name,
    label,
    setRefValue = false,
    onChange,
    width = 400,
    formik,
    placeholder,
    isNewConnectorLabelVisible = true,
    configureOptionsProps,
    enableConfigureOptions = true,
    style,
    gitScope,
    multiTypeProps = {},
    ...restProps
  } = props
  const hasError = errorCheck(name, formik)
  const {
    intent = hasError ? Intent.DANGER : Intent.NONE,
    helperText = hasError ? get(formik?.errors, name) : null,
    disabled,
    ...rest
  } = restProps
  const selected = get(formik?.values, name, '')
  const mountRef = React.useRef<boolean>(false)
  const [selectedValue, setSelectedValue] = React.useState(selected)
  const [inlineSelection, setInlineSelection] = React.useState<InlineSelectionInterface>({
    selected: false,
    inlineModalClosed: false
  })
  const scopeFromSelected = typeof selectedValue === 'string' ? getScopeFromValue(selectedValue || '') : selected?.scope
  const selectedRef =
    typeof selectedValue === 'string' ? getIdentifierFromValue(selected || '') : selectedValue?.connector?.identifier
  const [multiType, setMultiType] = React.useState<MultiTypeInputType>(MultiTypeInputType.FIXED)
  const { data: connectorData, loading, refetch } = useGetConnector({
    identifier: selectedRef as string,
    queryParams: {
      accountIdentifier,
      orgIdentifier: scopeFromSelected === Scope.ORG || scopeFromSelected === Scope.PROJECT ? orgIdentifier : undefined,
      projectIdentifier: scopeFromSelected === Scope.PROJECT ? projectIdentifier : undefined,
      branch: gitScope?.branch,
      repoIdentifier: gitScope?.repo
    },
    lazy: true
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

  React.useEffect(() => {
    if (
      typeof selected === 'string' &&
      !mountRef.current &&
      multiType === MultiTypeInputType.FIXED &&
      getMultiTypeFromValue(selected) === MultiTypeInputType.FIXED &&
      selected.length > 0
    ) {
      refetch()
      mountRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      if (!setRefValue) {
        formik?.setFieldValue(name, value)
      }
      setSelectedValue(value)
    } else if (getMultiTypeFromValue(selected) !== MultiTypeInputType.FIXED) {
      setSelectedValue(selected)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const { getString } = useStrings()

  function onConnectorCreateSuccess(data?: ConnectorConfigDTO): void {
    if (data) {
      const scope = getScopeFromDTO<ConnectorConfigDTO>(data.connector)
      const val = {
        label: data.connector.name,
        value:
          scope === Scope.ORG || scope === Scope.ACCOUNT
            ? `${scope}.${data.connector.identifier}`
            : data.connector.identifier,
        scope,
        connector: data.connector,
        live: data?.status?.status === 'SUCCESS'
      }
      props.onChange?.(val, MultiTypeInputValue.SELECT_OPTION, MultiTypeInputType.FIXED)
      formik?.setFieldValue(name, val)
      setInlineSelection({
        selected: true,
        inlineModalClosed: false
      })
    }
  }

  const { openConnectorModal } = useCreateConnectorModal({
    onSuccess: onConnectorCreateSuccess,
    onClose: () => {
      setInlineSelection({
        selected: inlineSelection.selected,
        inlineModalClosed: true
      })
    }
  })

  const { openConnectorMultiTypeModal } = useCreateConnectorMultiTypeModal({
    types: Array.isArray(type) ? type : [type],
    onSuccess: onConnectorCreateSuccess
  })

  const placeHolderLocal = loading ? getString('loading') : placeholder
  const isDisabled = loading || disabled

  const optionalReferenceSelectProps: Pick<
    ReferenceSelectProps<ConnectorConfigDTO>,
    'createNewHandler' | 'editRenderer'
  > = {}

  if (typeof type === 'string' && !category) {
    optionalReferenceSelectProps.createNewHandler = () => {
      openConnectorModal(false, type, {
        gitDetails: {
          repoIdentifier: gitScope?.repo,
          branch: gitScope?.branch,
          getDefaultFromOtherRepo: gitScope?.getDefaultFromOtherRepo || true
        }
      })
    }
  } else if (Array.isArray(type) && !category) {
    optionalReferenceSelectProps.createNewHandler = () => {
      openConnectorMultiTypeModal()
    }
  }

  const [canUpdateSelectedConnector] = usePermission(
    {
      resource: {
        resourceType: ResourceType.CONNECTOR,
        resourceIdentifier: selectedValue?.connector?.identifier || ''
      },
      permissions: [PermissionIdentifier.UPDATE_CONNECTOR]
    },
    []
  )

  if (typeof type === 'string' && typeof selectedValue === 'object') {
    optionalReferenceSelectProps.editRenderer = getEditRenderer(
      selectedValue,
      openConnectorModal,
      selectedValue?.connector?.type || type,
      canUpdateSelectedConnector
    )
  } else if (Array.isArray(type) && typeof selectedValue === 'object') {
    optionalReferenceSelectProps.editRenderer = getEditRenderer(
      selectedValue,
      openConnectorModal,
      selectedValue?.connector?.type,
      canUpdateSelectedConnector
    )
  }

  const component = (
    <FormGroup {...rest} labelFor={name} helperText={helperText} intent={intent} style={{ marginBottom: 0 }}>
      <MultiTypeReferenceInput<ConnectorReferenceDTO>
        name={name}
        disabled={isDisabled}
        referenceSelectProps={{
          ...getReferenceFieldProps({
            defaultScope,
            gitScope,
            accountIdentifier,
            projectIdentifier,
            orgIdentifier,
            type,
            category,
            name,
            selected,
            width,
            placeholder: placeHolderLocal,
            label,
            getString,
            openConnectorModal
          }),
          isNewConnectorLabelVisible: canUpdate && isNewConnectorLabelVisible,
          selectedRenderer: getSelectedRenderer(selectedValue),
          ...optionalReferenceSelectProps,
          disabled: isDisabled
        }}
        onChange={(val, valueType, type1) => {
          if (val && type1 === MultiTypeInputType.FIXED) {
            const { record, scope } = (val as unknown) as { record: ConnectorReferenceDTO; scope: Scope }
            const value = {
              label: record.name,
              value:
                scope === Scope.ORG || scope === Scope.ACCOUNT ? `${scope}.${record.identifier}` : record.identifier,
              scope,
              live: record?.status?.status === 'SUCCESS',
              connector: record
            }
            if (setRefValue) {
              formik?.setFieldValue(name, value.value)
            } else {
              formik?.setFieldValue(name, value)
            }
            setSelectedValue(value)
          } else {
            formik?.setFieldValue(name, val || '')
            setSelectedValue(val || '')
          }
          setMultiType(type1)
          onChange?.(val, valueType, type1)
        }}
        value={selectedValue}
        {...multiTypeProps}
      />
    </FormGroup>
  )

  return (
    <div style={style}>
      <Container style={{ marginBottom: 5 }}>
        <HarnessDocTooltip tooltipId={props.tooltipProps?.dataTooltipId} labelText={label} />
      </Container>
      {enableConfigureOptions ? (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {component}
          {getMultiTypeFromValue(selected) === MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              value={selected}
              type={getString('string')}
              variableName={name}
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={val => {
                formik?.setFieldValue(name, val)
                onChange?.(val, MultiTypeInputValue.STRING, MultiTypeInputType.RUNTIME)
              }}
              style={{ marginLeft: 'var(--spacing-medium)' }}
              {...configureOptionsProps}
              isReadonly={props.disabled}
            />
          )}
        </div>
      ) : (
        component
      )}
    </div>
  )
}

export const FormMultiTypeConnectorField = connect(MultiTypeConnectorField)
