import React from 'react'
import { Page } from '@common/exports'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useStrings } from 'framework/strings'

const AuditTrailsPage: React.FC = () => {
  const { getString } = useStrings()

  return (
    <>
      <Page.Header title={getString('common.auditTrail')} breadcrumbs={<NGBreadcrumbs />} />
    </>
  )
}

export default AuditTrailsPage
