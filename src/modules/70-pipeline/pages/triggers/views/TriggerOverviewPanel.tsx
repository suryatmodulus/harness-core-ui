import React from 'react'
import { Layout } from '@wings-software/uicore'
import cx from 'classnames'
import { NameIdDescriptionTags } from '@common/components'
import { useStrings } from 'framework/exports'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import css from './TriggerOverviewPanel.module.scss'

export interface TriggerOverviewPanelPropsInterface {
  formikProps?: any
  isEdit?: boolean
}

const TriggerOverviewPanel: React.FC<TriggerOverviewPanelPropsInterface> = ({
  formikProps,
  isEdit = false
}): JSX.Element => {
  const {
    values: { originalPipeline, pipeline }
  } = formikProps
  const { getString } = useStrings()
  // originalPipeline for new, pipeline for onEdit
  const hasLoadedPipeline = originalPipeline || pipeline
  return (
    <Layout.Vertical className={cx(css.triggerOverviewPanelContainer)} spacing="large" padding="xxlarge">
      {!hasLoadedPipeline && (
        <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
          <PageSpinner />
        </div>
      )}
      <h2>{getString('pipeline-triggers.triggerOverviewPanel.title')}</h2>
      <NameIdDescriptionTags
        className={css.nameIdDescriptionTags}
        formikProps={formikProps}
        identifierProps={{
          isIdentifierEditable: !isEdit
        }}
      />
    </Layout.Vertical>
  )
}
export default TriggerOverviewPanel
