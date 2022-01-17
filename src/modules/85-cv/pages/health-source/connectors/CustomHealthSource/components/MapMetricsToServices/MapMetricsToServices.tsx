/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useState } from 'react'
import { SelectOption, Container } from '@wings-software/uicore'
import type { CustomHealthMetricDefinition } from 'services/cv'
import { useStrings } from 'framework/strings'
import { NameId } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import GroupName from '@cv/components/GroupName/GroupName'
import { initializeGroupNames } from './MapMetricsToServices.utils'
import { CustomHealthSourceFieldNames } from '../../CustomHealthSource.constants'
import type { MapMetricsToServicesInterface } from './MapMetricsToServices.types'
import css from './MapMetricsToServices.module.scss'

export default function MapMetricsToServices({
  formikProps,
  mappedMetrics,
  selectedMetric
}: MapMetricsToServicesInterface): JSX.Element {
  const { getString } = useStrings()
  const {
    sourceData: { existingMetricDetails }
  } = useContext(SetupSourceTabsContext)

  const [groupNames, setPrometheusGroupName] = useState<SelectOption[]>(initializeGroupNames(mappedMetrics, getString))

  const metricDefinitions = existingMetricDetails?.spec?.metricDefinitions
  const currentSelectedMetricDetail = metricDefinitions?.find(
    (metricDefinition: CustomHealthMetricDefinition) =>
      metricDefinition.metricName === mappedMetrics.get(selectedMetric || '')?.metricName
  )

  return (
    <Container className={css.main}>
      <NameId
        nameLabel={getString('cv.monitoringSources.metricNameLabel')}
        identifierProps={{
          inputName: CustomHealthSourceFieldNames.METRIC_NAME,
          idName: CustomHealthSourceFieldNames.METRIC_IDENTIFIER,
          isIdentifierEditable: Boolean(!currentSelectedMetricDetail?.identifier)
        }}
      />
      <GroupName
        groupNames={groupNames}
        onChange={formikProps.setFieldValue}
        item={formikProps.values?.groupName}
        setGroupNames={setPrometheusGroupName}
        label={getString('cv.monitoringSources.prometheus.groupName')}
        title={getString('cv.customHealthSource.addGroupNameTitle')}
        fieldName={CustomHealthSourceFieldNames.GROUP_NAME}
      />
    </Container>
  )
}
