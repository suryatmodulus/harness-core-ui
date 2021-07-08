import React from 'react'
import { useGet } from 'restful-react'
import { Color, HarnessDocTooltip, Layout, OverlaySpinner, Select, SelectOption, Text } from '@wings-software/uicore'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import type { TemplatesPageSummaryResponse } from '@templates-library/temporary-mock/model'
import { TemplatesListHeader } from '@templates-library/pages/TemplatesList/TeplatesListHeader/TemplatesListHeader'
import { TemplatesGridView } from '@templates-library/pages/TemplatesList/TemplatesGridView/TemplatesGridView'
import templatesMock from '@templates-library/temporary-mock/templates-list.json'
import { Sort, SortFields } from '@templates-library/pages/TemplatesList/TemplatesListUtils'

import css from './TemplatesList.module.scss'

export default function TemplatesList(): React.ReactElement {
  const { getString } = useStrings()
  // TODO: remove mock
  const { data, loading, error, refetch } = useGet<TemplatesPageSummaryResponse>('', {
    mock: { loading: false, data: templatesMock as TemplatesPageSummaryResponse }
  })

  const contentLength = data?.content?.length || 0

  // TODO: implement
  const setPage = (_no: number) => undefined
  const setSort = (_sort: string[]) => undefined
  //const [sort, setSort] = React.useState<string[]>([SortFields.LastUpdatedAt, Sort.DESC])

  const sortOptions: SelectOption[] = [
    {
      label: getString('recentActivity'),
      value: SortFields.RecentActivity
    },
    {
      label: getString('lastUpdatedSort'),
      value: SortFields.LastUpdatedAt
    },
    {
      label: getString('AZ09'),
      value: SortFields.AZ09
    },

    {
      label: getString('ZA90'),
      value: SortFields.ZA90
    }
  ]

  // Set Default to LastUpdated
  const [selectedSort, setSelectedSort] = React.useState<SelectOption>(sortOptions[1])
  return (
    <>
      <div className={css.pageheader}>
        <div className="ng-tooltip-native">
          <h2 data-tooltip-id="templatesPageHeading"> {getString('common.templates')}</h2>
          <HarnessDocTooltip tooltipId="pipelinesPageHeading" useStandAlone={true} />
        </div>
      </div>
      <Page.Body
        className={css.pageBody}
        error={(error?.data as Error)?.message || error?.message}
        retryOnError={() => refetch()}
      >
        <TemplatesListHeader />

        {!!data?.content?.length && (
          <Layout.Horizontal
            spacing="large"
            margin={{ left: 'large', top: 'large', bottom: 'large', right: 'large' }}
            className={css.topHeaderFields}
          >
            <Text color={Color.GREY_800} iconProps={{ size: 14 }}>
              {getString('total')}: {data?.totalElements}
            </Text>
            <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
              <Text>Sort by</Text>
              <Select
                items={sortOptions}
                value={selectedSort}
                className={css.sortSelector}
                onChange={item => {
                  if (item.value === SortFields.AZ09) {
                    setSort([SortFields.Name, Sort.ASC])
                  } else if (item.value === SortFields.ZA90) {
                    setSort([SortFields.Name, Sort.DESC])
                  } else if (item.value === SortFields.LastUpdatedAt) {
                    setSort([SortFields.LastUpdatedAt, Sort.DESC])
                  } else if (item.value === SortFields.RecentActivity) {
                    setSort([SortFields.RecentActivity, Sort.DESC])
                  }
                  setPage(0)
                  setSelectedSort(item)
                }}
              />
            </Layout.Horizontal>
          </Layout.Horizontal>
        )}

        {loading ? (
          <OverlaySpinner show={true} className={css.loading}>
            <div />
          </OverlaySpinner>
        ) : !contentLength ? (
          <div className={css.noTemplatesSection}>No entry found</div>
        ) : (
          <React.Fragment>
            <TemplatesGridView gotoPage={/* istanbul ignore next */ pageNumber => setPage(pageNumber)} data={data} />
          </React.Fragment>
        )}
      </Page.Body>
    </>
  )
}
