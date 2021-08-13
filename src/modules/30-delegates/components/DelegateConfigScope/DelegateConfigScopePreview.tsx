import React from 'react'
import { useParams } from 'react-router'
import { Color, Container, Heading, Layout, Checkbox, MultiSelect } from '@wings-software/uicore'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { ScopingRuleDetails } from 'services/portal'
import { useStrings } from 'framework/strings'
import { EnvironmentType } from '@delegates/constants'

import css from './DelegateConfigScope.module.scss'

const DelegateConfigScopePreview = ({ scopingRules = [] }: { scopingRules?: ScopingRuleDetails[] }) => {
  const { projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()

  const scopingMap: any = {}
  scopingRules.forEach((rule: ScopingRuleDetails) => {
    scopingMap[rule.environmentTypeId || ''] =
      rule?.environmentIds?.map(envId => ({
        label: envId,
        value: envId
      })) || []
  })

  const isProdChecked = !!scopingMap[EnvironmentType.PROD] || !scopingMap[EnvironmentType.NON_PROD]
  const isNonprodChecked = !!scopingMap[EnvironmentType.NON_PROD] || !scopingMap[EnvironmentType.PROD]

  const prodSelected = scopingMap[EnvironmentType.PROD] || []
  const nonprodSelected = scopingMap[EnvironmentType.NON_PROD] || []

  const envPlaceholder = projectIdentifier
    ? getString('delegates.newDelegateConfigWizard.matchAllEnvs')
    : getString('delegates.newDelegateConfigWizard.specEnvNotPossible')

  return (
    <Container style={{ height: '100%' }}>
      <Heading level={3} color={Color.GREY_600} margin={{ bottom: 'xxlarge' }}>
        {getString('delegates.newDelegateConfigWizard.scopeSubtitle')}
      </Heading>
      <Layout.Horizontal className={css.envContainer} padding={{ left: 'xxlarge', top: 'large', bottom: 'xxlarge' }}>
        <Checkbox
          label={getString('delegates.newDelegateConfigWizard.nonprodEnv')}
          className={css.envCheckbox}
          checked={isNonprodChecked}
          disabled={true}
        />
        <MultiSelect
          disabled={true}
          items={[]}
          value={nonprodSelected}
          placeholder={envPlaceholder}
          allowCreatingNewItems={false}
        />
      </Layout.Horizontal>
      <Layout.Horizontal className={css.envContainer} padding={{ left: 'xxlarge', top: 'large', bottom: 'xxlarge' }}>
        <Checkbox
          label={getString('delegates.newDelegateConfigWizard.prodEnv')}
          className={css.envCheckbox}
          checked={isProdChecked}
          disabled={true}
        />
        <MultiSelect
          disabled={true}
          allowCreatingNewItems={false}
          items={[]}
          value={prodSelected}
          placeholder={envPlaceholder}
        />
      </Layout.Horizontal>
    </Container>
  )
}
export default DelegateConfigScopePreview
