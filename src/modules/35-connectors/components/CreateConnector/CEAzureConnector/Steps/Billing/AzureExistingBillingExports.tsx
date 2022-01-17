/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Table } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { CEAzureConnector } from 'services/cd-ng'
import css from '../../CreateCeAzureConnector_new.module.scss'

interface Props {
  existingBillingExports: CEAzureConnector[]
}

const ExistingBillingExports = (props: Props) => {
  const { getString } = useStrings()
  return (
    <Container className={css.existingBeTable}>
      <Table
        data={props.existingBillingExports}
        bpTableProps={{ bordered: false, condensed: true, striped: true }}
        columns={[
          {
            accessor: 'tenantId',
            Header: getString('connectors.ceAzure.existingExports.tenantId')
          },
          {
            accessor: 'billingExportSpec.storageAccountName',
            Header: getString('connectors.ceAzure.billing.storageAccountName')
          },
          {
            accessor: 'billingExportSpec.containerName',
            Header: getString('connectors.ceAzure.billing.containerName')
          },
          {
            accessor: 'billingExportSpec.directoryName',
            Header: getString('connectors.ceAzure.billing.directoryName')
          },
          {
            accessor: 'billingExportSpec.reportName',
            Header: getString('connectors.ceAzure.billing.reportName')
          },
          {
            accessor: 'billingExportSpec.subscriptionId',
            Header: getString('connectors.ceAzure.existingExports.subscriptionId')
          }
        ]}
      />
    </Container>
  )
}

export default ExistingBillingExports
