import React, { useMemo } from 'react'
import { IconName, Select, SelectOption } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import classNames from 'classnames'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetAllHealthSourcesForServiceAndEnvironment } from 'services/cv'
import { getIconBySourceType } from '@cv/pages/health-source/HealthSourceTable/HealthSourceTable.utils'
import type { HealthSourceDropDownProps } from './HealthSourceDropDown.types'
import css from './HealthSourceDropDown.module.scss'

export function HealthSourceDropDown(props: HealthSourceDropDownProps): JSX.Element {
  const { onChange, serviceIdentifier, environmentIdentifier, className } = props
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const { data, error, loading } = useGetAllHealthSourcesForServiceAndEnvironment({
    queryParams: { accountId, projectIdentifier, orgIdentifier, serviceIdentifier, environmentIdentifier }
  })

  const healthSources: SelectOption[] = useMemo(() => {
    if (loading) {
      return [{ value: '', label: getString('loading') }]
    }
    if (error) {
      return []
    }

    const options = []
    for (const source of data?.resource || []) {
      if (source.identifier && source.name) {
        options.push({
          label: source.name,
          value: source.identifier as string,
          icon: { name: getIconBySourceType(source?.type as string) as IconName }
        })
      }
    }

    if (options.length > 1) {
      options.unshift({ label: getString('all'), value: 'all' })
    }

    return options
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.resource, error, loading])

  return (
    <Select
      items={healthSources}
      className={classNames(css.maxDropDownWidth, className)}
      defaultSelectedItem={healthSources?.[0]}
      key={healthSources?.[0]?.value as string}
      inputProps={{ placeholder: getString('pipeline.verification.healthSourcePlaceholder') }}
      onChange={item => {
        onChange(item?.value === 'all' ? '' : (item.value as string))
      }}
    />
  )
}
