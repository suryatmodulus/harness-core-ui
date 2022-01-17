/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Table, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { ExistingCURDetails } from './OverviewStep'
import css from '../CreateCeAwsConnector.module.scss'

interface ExistingCURDetailsProps {
  existingCurReports: ExistingCURDetails[]
}

const CostUsageReportExisting: React.FC<ExistingCURDetailsProps> = props => {
  const { getString } = useStrings()

  return (
    <div>
      <Layout.Vertical>
        <Text
          font="small"
          className={css.info}
          color="primary7"
          inline
          icon="info-sign"
          iconProps={{ size: 15, color: 'primary7', margin: { right: 'xsmall' } }}
        >
          {getString('connectors.ceAws.curExising.subHeading')}
        </Text>
        <div className={css.existingCurTable}>
          <Table
            data={props.existingCurReports}
            columns={[
              {
                accessor: 'awsAccountId',
                Header: getString('connectors.ceAws.curExising.accountID'),
                id: 'awsAccountId',
                width: '26%'
              },
              {
                accessor: 'reportName',
                Header: getString('connectors.ceAws.cur.reportName'),
                width: '37%'
              },
              {
                accessor: 's3BucketName',
                Header: getString('connectors.ceAws.cur.bucketName'),
                width: '37%'
              }
            ]}
            bpTableProps={{ bordered: false, condensed: true, striped: true }}
          ></Table>
        </div>
      </Layout.Vertical>
    </div>
  )
}

export default CostUsageReportExisting
