/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { ExpandingSearchInput } from '@harness/uicore'
import { debounce as _debounce, defaultTo as _defaultTo } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { Service, useSearchRules } from 'services/lw'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import css from './COGatewayList.module.scss'

interface AutostoppingRulesSearchProps {
  onSearch: (params: { data: Service[] | null; error?: any }) => void
}

const AutostoppingRulesSearch: React.FC<AutostoppingRulesSearchProps> = ({ onSearch }) => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()

  const { data, refetch } = useSearchRules({ account_id: accountId, lazy: true })

  const onChange = _debounce(async (val: string) => {
    val = val.trim()
    try {
      await refetch({ queryParams: { accountIdentifier: accountId, value: val } })
      onSearch({ data: _defaultTo(data?.response, []) })
    } catch (e) {
      onSearch({ data: null, error: e })
    }
  }, 1000)

  return <ExpandingSearchInput placeholder={getString('search')} onChange={onChange} className={css.search} />
}

export default AutostoppingRulesSearch
