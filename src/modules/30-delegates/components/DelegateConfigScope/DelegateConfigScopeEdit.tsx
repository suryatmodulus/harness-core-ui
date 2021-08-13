import React, { FormEvent, useState, useCallback, useEffect } from 'react'
import { useParams } from 'react-router'
import { Color, Container, Heading, Layout, Checkbox, MultiSelect, MultiSelectOption } from '@wings-software/uicore'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { ScopingRuleDetails } from 'services/portal'
import { useStrings } from 'framework/strings'
import type { GetEnvironmentListForProjectQueryParams, ScopingRuleDetailsNg } from 'services/cd-ng'
import { useGetEnvironmentListForProject } from 'services/cd-ng'
import { EnvironmentType } from '@delegates/constants'

import css from './DelegateConfigScope.module.scss'

const DelegateConfigScopeEdit = ({
  onChange,
  scopingRules = [],
  isPreviewOnly
}: {
  onChange: (data: ScopingRuleDetails[]) => void
  scopingRules?: ScopingRuleDetails[]
  isPreviewOnly?: boolean
}) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()

  const scopingMap: any = {}
  scopingRules.forEach((rule: ScopingRuleDetails) => {
    scopingMap[rule.environmentTypeId || ''] =
      rule?.environmentIds?.map(envId => ({
        label: envId,
        value: envId
      })) || []
  })

  const initialProdChecked = !!scopingMap[EnvironmentType.PROD] || !scopingMap[EnvironmentType.NON_PROD]
  const initialNonprodChecked = !!scopingMap[EnvironmentType.NON_PROD] || !scopingMap[EnvironmentType.PROD]

  const initialProdSelected = scopingMap[EnvironmentType.PROD] || []
  const initialNonprodSelected = scopingMap[EnvironmentType.NON_PROD] || []

  const [nonprodChecked, setNonprodCheck] = useState(initialNonprodChecked)
  const [nonprodSelected, setNonprodSelected] = useState(initialNonprodSelected as MultiSelectOption[])
  const [prodChecked, setProdCheck] = useState(initialProdChecked)
  const [prodSelected, setProdSelected] = useState(initialProdSelected as MultiSelectOption[])

  const [envProdOptions, setEnvironmentProdOptions] = useState([] as MultiSelectOption[])
  const [envNonprodOptions, setEnvironmentNonprodOptions] = useState([] as MultiSelectOption[])

  const { data: environmentsResponse } = useGetEnvironmentListForProject({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    } as GetEnvironmentListForProjectQueryParams
  })

  useEffect(() => {
    if (environmentsResponse?.data?.content?.length) {
      const prodOptions: MultiSelectOption[] = []
      const nonprodOptions: MultiSelectOption[] = []
      environmentsResponse?.data?.content?.forEach(env => {
        const option: MultiSelectOption = {
          label: env.name || '',
          value: env.identifier || ''
        }
        if (env.type === 'Production') {
          prodOptions.push(option)
        } else {
          nonprodOptions.push(option)
        }
      })
      setEnvironmentProdOptions(prodOptions)
      setEnvironmentNonprodOptions(nonprodOptions)
    }
  }, [environmentsResponse])

  const onProdSelectionChange = useCallback((selected: MultiSelectOption[]) => {
    setProdSelected(selected)
  }, [])

  const onNonprodSelectionChange = useCallback((selected: MultiSelectOption[]) => {
    setNonprodSelected(selected)
  }, [])

  const onProdCheckChange = useCallback(
    (event: FormEvent<HTMLInputElement>) => {
      if (!event.currentTarget.checked) {
        setProdSelected([])
      }
      if (!(!event.currentTarget.checked && !nonprodChecked)) setProdCheck(event.currentTarget.checked)
    },
    [nonprodChecked]
  )

  const onNonprodCheckChange = useCallback(
    (event: FormEvent<HTMLInputElement>) => {
      if (!event.currentTarget.checked) {
        setNonprodSelected([])
      }
      if (!(!event.currentTarget.checked && !prodChecked)) setNonprodCheck(event.currentTarget.checked)
    },
    [prodChecked]
  )

  const getScopingRules = () => {
    const newScopingRules: ScopingRuleDetailsNg[] = []
    let isProdAll = false
    let isNonprodAll = false

    if (prodChecked) {
      let environmentIds
      if (prodSelected.length) {
        environmentIds = prodSelected.map(item => item.value as string)
      } else {
        isProdAll = true
      }
      newScopingRules.push({
        environmentTypeId: EnvironmentType.PROD,
        environmentIds
      })
    }
    if (nonprodChecked) {
      let environmentIds
      if (nonprodSelected.length) {
        environmentIds = nonprodSelected.map(item => item.value as string)
      } else {
        isNonprodAll = true
      }
      newScopingRules.push({
        environmentTypeId: EnvironmentType.NON_PROD,
        environmentIds
      })
    }
    return isProdAll && isNonprodAll ? [] : newScopingRules
  }

  useEffect(() => {
    onChange(getScopingRules())
  }, [prodChecked, nonprodChecked, prodSelected, nonprodSelected])

  const envPlaceholder = projectIdentifier
    ? getString('delegates.newDelegateConfigWizard.matchAllEnvs')
    : getString('delegates.newDelegateConfigWizard.specEnvNotPossible')

  return (
    <Container style={{ height: '100%' }}>
      <Heading level={3} color={Color.GREY_600} margin={{ bottom: 'xxlarge' }}>
        {getString('delegates.newDelegateConfigWizard.scopeSubtitle')}
      </Heading>
      <>
        <Layout.Horizontal className={css.envContainer} padding={{ left: 'xxlarge', top: 'large', bottom: 'xxlarge' }}>
          <Checkbox
            label={getString('delegates.newDelegateConfigWizard.nonprodEnv')}
            onChange={onNonprodCheckChange}
            className={css.envCheckbox}
            checked={nonprodChecked}
            disabled={isPreviewOnly}
          />
          <MultiSelect
            disabled={isPreviewOnly || !projectIdentifier || !nonprodChecked}
            allowCreatingNewItems={false}
            items={envNonprodOptions}
            onChange={onNonprodSelectionChange}
            value={nonprodSelected}
            placeholder={envPlaceholder}
          />
        </Layout.Horizontal>
        <Layout.Horizontal className={css.envContainer} padding={{ left: 'xxlarge', top: 'large', bottom: 'xxlarge' }}>
          <Checkbox
            label={getString('delegates.newDelegateConfigWizard.prodEnv')}
            onChange={onProdCheckChange}
            className={css.envCheckbox}
            checked={prodChecked}
            disabled={isPreviewOnly}
          />
          <MultiSelect
            disabled={isPreviewOnly || !projectIdentifier || !prodChecked}
            allowCreatingNewItems={false}
            items={envProdOptions}
            onChange={onProdSelectionChange}
            value={prodSelected}
            placeholder={envPlaceholder}
          />
        </Layout.Horizontal>
      </>
    </Container>
  )
}
export default DelegateConfigScopeEdit
