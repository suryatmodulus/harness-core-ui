import React from 'react'
import { Container, Table } from '@wings-software/uicore'
import type { CEAzureConnector } from 'services/cd-ng'
import css from '../../CreateCeAzureConnector.module.scss'

interface Props {
  existingBillingExports: CEAzureConnector[]
}

const ExistingBillingExports = (props: Props) => {
  return (
    <Container className={css.existingBeTable}>
      <Table
        data={props.existingBillingExports}
        bpTableProps={{ bordered: false, condensed: true, striped: true }}
        columns={[
          {
            accessor: 'tenantId',
            Header: 'Tenant ID'
          },
          {
            accessor: 'billingExportSpec.storageAccountName',
            Header: 'Storage Account Name'
          },
          {
            accessor: 'billingExportSpec.containerName',
            Header: 'Container Name'
          },
          {
            accessor: 'billingExportSpec.directoryName',
            Header: 'Directory Name'
          },
          {
            accessor: 'billingExportSpec.reportName',
            Header: 'Report Name'
          },
          {
            accessor: 'billingExportSpec.subscriptionId',
            Header: 'Subscription ID'
          }
        ]}
      />
    </Container>
  )
}

export default ExistingBillingExports
