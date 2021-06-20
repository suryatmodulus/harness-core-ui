import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Color, Container, Layout, Text } from '@wings-software/uicore'
import { IOptionProps, Radio } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { DelegateSelectors, useToaster } from '@common/components'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type { AccountPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import useCreateDelegateModal from '@delegates/modals/DelegateModal/useCreateDelegateModal'
import {
  DelegateGroupDetails,
  useGetDelegatesUpTheHierarchy,
  useGetDelegatesStatusV2,
  RestResponseDelegateStatus,
  RestResponseDelegateGroupListing,
  DelegateInner
} from 'services/portal'
import {
  DelegateSelectorTable,
  DelegateSelectorTableProps
} from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelector/DelegateSelectorTable'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacButton from '@rbac/components/Button/Button'
import css from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelector/DelegateSelector.module.scss'

export enum DelegateOptions {
  DelegateOptionsAny = 'DelegateOptions.DelegateOptionsAny',
  DelegateOptionsSelective = 'DelegateOptions.DelegateOptionsSelective'
}

export enum DelegatesFoundState {
  ActivelyConnected = 'DelegatesFoundState.ActivelyConnected',
  NotConnected = 'DelegatesFoundState.NotConnected',
  NotFound = 'DelegatesFoundState.NotFound'
}

export interface DelegateSelectorProps extends ProjectPathProps {
  mode: DelegateOptions
  setMode: (mode: DelegateOptions) => void
  delegateSelectors: Array<string>
  setDelegateSelectors: (delegateSelectors: Array<string>) => void
  setDelegatesFound: (delegatesFound: DelegatesFoundState) => void
  delegateSelectorMandatory: boolean
}

export interface DelegateInnerCustom extends DelegateInner {
  checked: boolean
}

export interface DelegateGroupDetailsCustom extends DelegateGroupDetails {
  checked: boolean
}

const DELEGATE_POLLING_INTERVAL_IN_MS = 5000

const NullRenderer = () => <></>

interface CustomRadioGroupProps {
  items: (IOptionProps & { checked: boolean; CustomComponent?: React.ReactElement })[]
  onClick: (mode: DelegateOptions) => void
}

const shouldDelegateBeChecked = (delegateSelectors: Array<string>, tags: Array<string> = []) => {
  if (!delegateSelectors?.length) {
    return false
  }
  const delegateSelectorsMap = delegateSelectors.reduce((acc: Record<string, boolean>, delegateSelector) => {
    acc[delegateSelector] = false
    return acc
  }, {})
  for (const tag of tags) {
    delete delegateSelectorsMap[tag]
  }
  return !Object.keys(delegateSelectorsMap).length
}

const CustomRadioGroup: React.FC<CustomRadioGroupProps> = props => {
  const { items, onClick } = props
  return (
    <Container>
      {items.map((item, index) => {
        const { CustomComponent = NullRenderer } = item
        return (
          <Layout.Horizontal
            margin={index === items.length - 1 ? { bottom: 'small' } : { bottom: 'medium' }}
            flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
            key={index}
          >
            <Radio
              label={item.label}
              value={item.value}
              color={Color.GREY_800}
              className={css.radio}
              checked={item.checked}
              disabled={item.disabled}
              onClick={() => onClick(item.value as DelegateOptions)}
            />
            {CustomComponent}
          </Layout.Horizontal>
        )
      })}
    </Container>
  )
}

export const DelegateSelector: React.FC<DelegateSelectorProps> = props => {
  const {
    mode,
    setMode,
    delegateSelectors = [],
    setDelegateSelectors,
    setDelegatesFound,
    delegateSelectorMandatory = false
  } = props
  const [formattedData, setFormattedData] = useState<DelegateGroupDetailsCustom[]>([])
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { orgIdentifier, projectIdentifier } = props
  const { CDNG_ENABLED, NG_SHOW_DELEGATE, NG_CG_TASK_ASSIGNMENT_ISOLATION } = useFeatureFlags()

  const scope = { projectIdentifier, orgIdentifier }

  const getDelegates = NG_CG_TASK_ASSIGNMENT_ISOLATION ? useGetDelegatesUpTheHierarchy : useGetDelegatesStatusV2
  const queryParams = NG_CG_TASK_ASSIGNMENT_ISOLATION
    ? {
        accountId,
        orgId: orgIdentifier,
        projectId: projectIdentifier
      }
    : {
        accountId
      }

  const { data: apiData, loading, error, refetch } = getDelegates({
    queryParams
  })

  const [data, setData] = useState(apiData)
  const { openDelegateModal } = useCreateDelegateModal({
    onClose: refetch
  })
  const { showError } = useToaster()

  const getParsedData = (): (DelegateInnerCustom | DelegateGroupDetailsCustom)[] => {
    if (NG_CG_TASK_ASSIGNMENT_ISOLATION) {
      return ((data as RestResponseDelegateGroupListing)?.resource?.delegateGroupDetails || []).map(
        delegateGroupDetails => ({
          ...delegateGroupDetails,
          checked: shouldDelegateBeChecked(
            delegateSelectors,
            Object.keys(delegateGroupDetails?.groupImplicitSelectors || {})
          )
        })
      )
    } else {
      return ((data as RestResponseDelegateStatus)?.resource?.delegates || []).map(delegate => ({
        ...delegate,
        checked: shouldDelegateBeChecked(delegateSelectors, [
          ...(delegate.tags || []),
          ...Object.keys(delegate?.implicitSelectors || {})
        ])
      }))
    }
  }

  // used to set data only if no error occurs
  // previous data should persist in data state even if api fails while polling
  useEffect(() => {
    if (apiData) {
      setData(apiData)
    }
  }, [apiData])

  // show error in toast if error occurs while polling
  useEffect(() => {
    if (error && data) {
      showError(
        getString('connectors.delegate.couldNotFetch', {
          pollingInterval: `${DELEGATE_POLLING_INTERVAL_IN_MS / 1000} ${getString('common.seconds')}`
        }),
        DELEGATE_POLLING_INTERVAL_IN_MS
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  // polling logic
  useEffect(() => {
    let id: NodeJS.Timeout
    if (!loading) {
      id = setTimeout(() => refetch(), DELEGATE_POLLING_INTERVAL_IN_MS)
    }
    return () => clearTimeout(id)
  }, [data, loading, refetch])

  useEffect(() => {
    const parsedData = getParsedData()

    parsedData.sort((parsedDataItemA, parsedDataItemB) => {
      const [checkedA, checkedB] = [parsedDataItemA.checked, parsedDataItemB.checked]
      if (checkedA && !checkedB) {
        return -1
      }
      if (checkedB && !checkedA) {
        return 1
      }
      return 0
    })

    setFormattedData(parsedData)
  }, [delegateSelectors, data])

  useEffect(() => {
    const totalChecked = formattedData.filter(item => item.checked).length
    const isAtleastOneActive = formattedData.filter(item => item.checked && item.activelyConnected).length > 0
    const isSaveButtonDisabled = mode === DelegateOptions.DelegateOptionsSelective && delegateSelectors.length === 0
    if (
      !loading &&
      !isSaveButtonDisabled &&
      (!formattedData.length || (mode === DelegateOptions.DelegateOptionsSelective && !totalChecked))
    ) {
      setDelegatesFound(DelegatesFoundState.NotFound)
    } else {
      setDelegatesFound(
        totalChecked && !isAtleastOneActive ? DelegatesFoundState.NotConnected : DelegatesFoundState.ActivelyConnected
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, formattedData])

  const DelegateSelectorCountComponent = useMemo(() => {
    const count = formattedData.filter(item => item.checked).length
    const total = formattedData.length
    if (!total) {
      return <></>
    }
    return (
      <Text data-name="delegateMatchingText">{`${count}/${total} ${getString(
        'connectors.delegate.matchingDelegates'
      )}`}</Text>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formattedData])

  const DelegateSelectorsCustomComponent = useMemo(
    () => (
      <DelegateSelectors
        className={css.formInput}
        fill
        allowNewTag={false}
        placeholder={getString('connectors.delegate.delegateselectionPlaceholder')}
        selectedItems={delegateSelectors}
        onChange={selectors => {
          setDelegateSelectors(selectors as Array<string>)
          if (selectors.length) {
            setMode(DelegateOptions.DelegateOptionsSelective)
          }
        }}
        pollingInterval={DELEGATE_POLLING_INTERVAL_IN_MS}
        {...scope}
      ></DelegateSelectors>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [delegateSelectors]
  )

  const CustomComponent = useMemo(() => {
    return (
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} margin={{ bottom: 'small' }}>
        {DelegateSelectorsCustomComponent}
        {DelegateSelectorCountComponent}
      </Layout.Horizontal>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formattedData])

  const options: CustomRadioGroupProps['items'] = useMemo(
    () => [
      {
        label: getString('connectors.delegate.delegateSelectorAny'),
        value: DelegateOptions.DelegateOptionsAny,
        checked: mode === DelegateOptions.DelegateOptionsAny,
        disabled: delegateSelectorMandatory
      },
      {
        label: getString('connectors.delegate.delegateSelectorSelective'),
        value: DelegateOptions.DelegateOptionsSelective,
        checked: mode === DelegateOptions.DelegateOptionsSelective
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, formattedData]
  )
  const delegateSelectorTableProps: DelegateSelectorTableProps = {
    data: data ? formattedData : data,
    loading,
    error,
    refetch,
    showMatchesSelectorColumn: mode === DelegateOptions.DelegateOptionsSelective
  }

  const permissionRequestNewDelegate = {
    resourceScope: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    permission: PermissionIdentifier.UPDATE_DELEGATE,
    resource: {
      resourceType: ResourceType.DELEGATE
    }
  }

  return (
    <Layout.Vertical className={css.delegateSelectorContainer}>
      <Text color={Color.GREY_800} margin={{ top: 'xlarge', bottom: 'medium' }}>
        {getString('connectors.delegate.configure')}
      </Text>
      <CustomRadioGroup items={options} onClick={newMode => setMode(newMode)} />
      {CustomComponent}
      <Layout.Horizontal flex={{ justifyContent: 'space-between' }} margin={{ bottom: 'medium' }}>
        <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.BLACK}>
          {getString('connectors.delegate.testDelegateConnectivity')}
        </Text>
        {CDNG_ENABLED && NG_SHOW_DELEGATE && NG_CG_TASK_ASSIGNMENT_ISOLATION ? (
          <RbacButton
            icon="plus"
            withoutBoxShadow
            font={{ weight: 'semi-bold' }}
            iconProps={{ margin: { right: 'xsmall' } }}
            permission={permissionRequestNewDelegate}
            onClick={() => openDelegateModal()}
            data-name="installNewDelegateButton"
          >
            {getString('connectors.testConnectionStep.installNewDelegate')}
          </RbacButton>
        ) : (
          <></>
        )}
      </Layout.Horizontal>
      <DelegateSelectorTable {...delegateSelectorTableProps} />
    </Layout.Vertical>
  )
}
