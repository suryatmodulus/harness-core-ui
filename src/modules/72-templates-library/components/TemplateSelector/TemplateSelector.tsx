import React, { useState } from 'react'
import { noop } from 'lodash-es'
import { useGet } from 'restful-react'
import { Layout, Select, SelectOption, Text } from '@wings-software/uicore'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import templatesMock from '@templates-library/temporary-mock/templates-list.json'
import { TemplatesGridView } from '@templates-library/pages/TemplatesList/TemplatesGridView/TemplatesGridView'

import type { TemplatesPageSummaryResponse } from '@templates-library/temporary-mock/model'
import { TemplateDetails } from '../TemplateDetails/TemplateDetails'

import css from './TemplateSelector.module.scss'

export interface TemplateSelectorProps {
  onSelect: (template: any) => void
  onClose: () => void
  onUseTemplate: (template: any) => void
}

const levelOptions: SelectOption[] = [
  {
    value: 'account',
    label: 'Account'
  },
  {
    value: 'org',
    label: 'Organization'
  },
  {
    value: 'project',
    label: 'Project'
  }
]

export const TemplateSelector: React.FC<TemplateSelectorProps> = (props): JSX.Element => {
  const { onUseTemplate } = props

  const [selectedLevel, setSelectedLevel] = useState(levelOptions[0])

  const { data } = useGet<TemplatesPageSummaryResponse>('', {
    mock: { loading: false, data: templatesMock as TemplatesPageSummaryResponse }
  })

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>()
  return (
    <div className={css.templateSelector}>
      <div className={css.templateSelectorInner}>
        <section className={css.templateList}>
          <div className={css.templateListInner}>
            <Breadcrumbs
              links={[
                {
                  url: '/',
                  label: 'Templates'
                },
                {
                  url: '/',
                  label: 'Step Templates'
                }
              ]}
            />
            <Layout.Horizontal>
              <Select
                items={levelOptions}
                value={selectedLevel}
                onChange={item => setSelectedLevel(item)}
                className={css.levelSelect}
              ></Select>
            </Layout.Horizontal>
            <Layout.Horizontal>
              <Text font={{ weight: 'bold' }}>Templates: 8</Text>
            </Layout.Horizontal>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
              <TemplatesGridView
                data={data}
                gotoPage={noop}
                onSelect={templateId => {
                  setSelectedTemplateId(templateId)
                }}
                gridLayoutClass={css.gridLayout}
                selectedIdentifier={selectedTemplateId}
              />
            </div>
          </div>
        </section>
        <section className={css.templateDetails}>
          <TemplateDetails
            templateIdentifier={selectedTemplateId}
            showActions={true}
            onTemplateSelect={templateIdentifier => {
              onUseTemplate(templateIdentifier)
            }}
          />
        </section>
      </div>
    </div>
  )
}
