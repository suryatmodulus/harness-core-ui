import React from 'react'
import { Color, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { FetchPlansQuery } from 'services/common/services'
import CIPlansPanel from './CIPlansPanel'
import CIFeatureComparison from './CIFeatureComparison'
import css from './CIPlans.module.scss'
import planCss from './Plan.module.scss'
interface CIPlansProps {
  ciSaasPlans?: NonNullable<FetchPlansQuery['pricing']>['ciSaasPlans']
  ciSaasFeatureCaption?: NonNullable<FetchPlansQuery['pricing']>['ciSaasFeatureCaption']
  ciSaasFeatureGroup?: NonNullable<FetchPlansQuery['pricing']>['ciSaasFeatureGroup']
}

const CIPlans: React.FC<CIPlansProps> = ({ ciSaasPlans, ciSaasFeatureCaption, ciSaasFeatureGroup }) => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical className={css.ciPlans} spacing="large">
      <CIPlansPanel ciSaasPlans={ciSaasPlans} />
      <CIFeatureComparison featureCaption={ciSaasFeatureCaption} featureGroup={ciSaasFeatureGroup} />
      <a
        target="_blank"
        href="http://harness-next.herokuapp.com/pricing"
        rel="noreferrer"
        className={planCss.centerText}
      >
        <Text color={Color.PRIMARY_6}>{getString('common.plans.faq')}</Text>
      </a>
    </Layout.Vertical>
  )
}

export default CIPlans
