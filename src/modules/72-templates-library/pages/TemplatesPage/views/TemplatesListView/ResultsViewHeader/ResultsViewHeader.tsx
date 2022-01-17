/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Dispatch, SetStateAction } from 'react'
import { Color, Container, DropDown, Layout, SelectOption, Text } from '@wings-software/uicore'
import { Sort, SortFields } from '@templates-library/pages/TemplatesPage/TemplatesPageUtils'
import { useStrings } from 'framework/strings'
import type { PageTemplateSummaryResponse } from 'services/template-ng'

export interface ResultsViewHeaderProps {
  templateData: PageTemplateSummaryResponse
  setSort: Dispatch<SetStateAction<string[]>>
  setPage: Dispatch<SetStateAction<number>>
}

export default function ResultsViewHeader(props: ResultsViewHeaderProps): React.ReactElement {
  const { templateData, setSort, setPage } = props
  const { getString } = useStrings()
  const getSortOptions = React.useCallback(() => {
    return [
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
  }, [])
  const [selectedSort, setSelectedSort] = React.useState<SelectOption>(getSortOptions()[0])
  return (
    <Container>
      <Layout.Horizontal spacing="large" padding={{ top: 'large', bottom: 'large' }} flex={{ alignItems: 'center' }}>
        <Text color={Color.GREY_800} iconProps={{ size: 14 }}>
          {getString('total')}: {templateData?.totalElements}
        </Text>
        <DropDown
          items={getSortOptions()}
          value={selectedSort.value.toString()}
          filterable={false}
          width={180}
          icon={'main-sort'}
          iconProps={{ size: 16, color: Color.GREY_400 }}
          onChange={item => {
            if (item.value === SortFields.AZ09) {
              setSort([SortFields.Name, Sort.ASC])
            } else if (item.value === SortFields.ZA90) {
              setSort([SortFields.Name, Sort.DESC])
            } else if (item.value === SortFields.LastUpdatedAt) {
              setSort([SortFields.LastUpdatedAt, Sort.DESC])
            }
            setPage(0)
            setSelectedSort(item)
          }}
        />
      </Layout.Horizontal>
    </Container>
  )
}
