import React, { useState, useEffect } from 'react'
import { FormInput, SelectOption } from '@wings-software/uicore'
import type { CustomRenderProps } from '@wings-software/uicore/dist/components/FormikForm/FormikForm'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import {
  useGetServiceListForProject,
  GetServiceListForProjectQueryParams,
  useGetEnvironmentListForProject,
  GetEnvironmentListForProjectQueryParams
} from 'services/cd-ng'
import { useToaster } from '@common/exports'
import {
  ServiceSelectOrCreate,
  ServiceSelectOrCreateProps
} from './components/ServiceSelectOrCreate/ServiceSelectOrCreate'
import {
  EnvironmentSelectOrCreate,
  EnvironmentSelectOrCreateProps
} from './components/EnvironmentSelectOrCreate/EnvironmentSelectOrCreate'
import css from './HarnessServiceAndEnvironment.module.scss'

export function useGetHarnessServices() {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { showError, clear } = useToaster()
  const [serviceOptions, setServiceOptions] = useState<SelectOption[]>([])
  const { error, loading, data } = useGetServiceListForProject({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    } as GetServiceListForProjectQueryParams
  })

  useEffect(() => {
    if (loading) {
      setServiceOptions([{ label: getString('loading'), value: '' }])
    } else if (error) {
      clear()
      showError(error?.message, 7000)
      setServiceOptions([])
    } else if (data?.data?.content) {
      const options = []
      for (const service of data.data.content) {
        if (service?.identifier && service.name) {
          options.push({
            label: service.name,
            value: service.identifier
          })
        }
      }
      setServiceOptions(options)
    }
  }, [loading, error, data])

  return { serviceOptions, setServiceOptions }
}

export function useGetHarnessEnvironments() {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { showError, clear } = useToaster()
  const [environmentOptions, setEnvironmentOptions] = useState<SelectOption[]>([])
  const { error, loading, data } = useGetEnvironmentListForProject({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    } as GetEnvironmentListForProjectQueryParams
  })

  useEffect(() => {
    if (loading) {
      setEnvironmentOptions([{ label: getString('loading'), value: '' }])
    } else if (error) {
      clear()
      showError(error?.message, 7000)
      setEnvironmentOptions([])
    } else if (data?.data?.content) {
      const options = []
      for (const service of data.data.content) {
        if (service?.identifier && service.name) {
          options.push({
            label: service.name,
            value: service.identifier
          })
        }
      }
      setEnvironmentOptions(options)
    }
  }, [loading, error, data])

  return { environmentOptions, setEnvironmentOptions }
}

export function HarnessService(props: ServiceSelectOrCreateProps): JSX.Element {
  return <ServiceSelectOrCreate {...props} className={cx(css.serviceEnvDropdown, props.className)} />
}

export function HarnessEnvironment(props: EnvironmentSelectOrCreateProps): JSX.Element {
  return <EnvironmentSelectOrCreate {...props} className={cx(css.serviceEnvDropdown, props.className)} />
}

export function HarnessServiceAsFormField(props: {
  customRenderProps: Omit<CustomRenderProps, 'render'>
  serviceProps: ServiceSelectOrCreateProps
}): JSX.Element {
  const { customRenderProps, serviceProps } = props

  return (
    <FormInput.CustomRender
      {...customRenderProps}
      key={`${serviceProps.item?.value as string}`}
      render={formikProps => (
        <ServiceSelectOrCreate
          {...serviceProps}
          onSelect={selectedOption => {
            formikProps.setFieldValue(customRenderProps.name, selectedOption)
            serviceProps.onSelect?.(selectedOption)
          }}
        />
      )}
    />
  )
}

export function HarnessEnvironmentAsFormField(props: {
  customRenderProps: Omit<CustomRenderProps, 'render'>
  environmentProps: EnvironmentSelectOrCreateProps
}): JSX.Element {
  const { customRenderProps, environmentProps } = props

  return (
    <FormInput.CustomRender
      {...customRenderProps}
      key={`${environmentProps.item?.value as string}`}
      render={formikProps => (
        <EnvironmentSelectOrCreate
          {...environmentProps}
          onSelect={selectedOption => {
            formikProps.setFieldValue(customRenderProps.name, selectedOption)
            environmentProps.onSelect?.(selectedOption)
          }}
        />
      )}
    />
  )
}
