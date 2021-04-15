import React, { useMemo, CSSProperties, useEffect, useState } from 'react'
import { FormInput, SelectOption, MultiTypeInputType, MultiSelectOption } from '@wings-software/uicore'
import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'
import { useParams } from 'react-router-dom'
import type { FormikProps } from 'formik'
import {
  useGetServiceListForProject,
  useGetEnvironmentListForProject,
  EnvironmentResponseDTO,
  ServiceResponseDTO,
  GetEnvironmentListForProjectQueryParams,
  GetServiceListForProjectQueryParams
} from 'services/cd-ng'
import { useToaster } from '@common/exports'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/exports'
import {
  ActivitySourceDTO,
  useListActivitySources,
  useGetMonitoringSources,
  useListBaselineExecutions
} from 'services/cv'
import type { ContinousVerificationFormData } from '@cv/components/PipelineSteps/ContinousVerification/continousVerificationTypes'
import i18n from './VerificationJobForms.i18n'
import css from './VerificationJobFields.module.scss'

interface BaseFieldProps {
  zIndex?: Pick<CSSProperties, 'zIndex'>
  label?: string
  name?: string
  disabled?: boolean
  formik?: FormikProps<ContinousVerificationFormData>
  expressions?: string[]
}

function activityTypeToIconProps(activityType: ActivitySourceDTO['type']): IconProps {
  switch (activityType) {
    case 'HARNESS_CD10':
      return {
        name: 'cd-main',
        size: 15
      }
    case 'KUBERNETES':
      return {
        name: 'service-kubernetes',
        size: 15
      }
    case 'CDNG':
      return {
        name: 'cd-main',
        size: 15
      }
    default:
      return {} as IconProps
  }
}

export function iconNameToActivityType(icon?: IconProps['name']): ActivitySourceDTO['type'] {
  switch (icon) {
    case 'cd-main':
      return 'HARNESS_CD10'
    case 'service-kubernetes':
      return 'KUBERNETES'
  }
}

export const VerificationJobNameFieldNames = {}

export function JobName(): JSX.Element {
  return (
    <FormInput.InputWithIdentifier
      inputName="jobName"
      idLabel="Identifier"
      inputGroupProps={{ placeholder: i18n.placeholders.jobName }}
      inputLabel={i18n.fieldLabels.jobName}
    />
  )
}

export const VerificationSensitivityOptions: SelectOption[] = [
  { label: i18n.verificationSensitivityLabel.high, value: 'HIGH' },
  { label: i18n.verificationSensitivityLabel.medium, value: 'MEDIUM' },
  { label: i18n.verificationSensitivityLabel.low, value: 'LOW' }
]

export const DefaultBaselineOptions: SelectOption[] = [
  { label: i18n.baselineDefaultLabel.lastSuccess, value: 'LAST' }
  // { label: i18n.baselineDefaultLabel.pinBaseline, value: 'PIN' }
]

export function VerificationSensitivity(props: BaseFieldProps): JSX.Element {
  const { zIndex, label, name, expressions, disabled, formik } = props
  const style: CSSProperties = useMemo(() => ({ zIndex: zIndex ?? 10 }), [zIndex]) as CSSProperties
  if (!disabled) {
    return (
      <FormInput.MultiTypeInput
        name={name ? name : 'sensitivity'}
        style={style}
        disabled={disabled}
        label={label ? label : i18n.fieldLabels.sensitivity}
        selectItems={VerificationSensitivityOptions}
        multiTypeInputProps={
          expressions
            ? { expressions }
            : {
                allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
              }
        }
      />
    )
  } else {
    return (
      <FormInput.Select
        name={name ? name : 'sensitivity'}
        label={label ? label : i18n.fieldLabels.sensitivity}
        style={style}
        items={VerificationSensitivityOptions}
        value={(formik?.values as ContinousVerificationFormData).spec?.spec?.sensitivity as SelectOption}
        disabled={true}
      />
    )
  }
}

export function ServiceName(props: BaseFieldProps): JSX.Element {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { data: serviceOptions } = useGetServiceListForProject({
    queryParams: {
      accountId,
      projectIdentifier,
      orgIdentifier
    } as GetServiceListForProjectQueryParams,
    resolve: serviceList =>
      serviceList?.data?.content?.map(({ identifier }: ServiceResponseDTO) => ({
        label: identifier,
        value: identifier
      }))
  })
  const { zIndex } = props
  const style: CSSProperties = useMemo(() => ({ zIndex: zIndex ?? 9 }), [zIndex]) as CSSProperties
  return (
    <FormInput.MultiTypeInput
      name="service"
      style={style}
      label={i18n.fieldLabels.service}
      selectItems={serviceOptions as SelectOption[]}
      multiTypeInputProps={{
        allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
      }}
    />
  )
}

export function Duration(props: BaseFieldProps): JSX.Element {
  const selectProps = useMemo(
    () => ({
      items: [
        { label: '5 min', value: '5m' },
        { label: '10 min', value: '10m' },
        { label: '15 min', value: '15m' },
        { label: '30 min', value: '30m' }
      ]
    }),
    []
  )
  const { zIndex, label, name, expressions, disabled, formik } = props
  const style: CSSProperties = useMemo(() => ({ zIndex: zIndex ?? 8 }), [zIndex]) as CSSProperties
  if (!disabled) {
    return (
      <FormInput.MultiTypeInput
        name={name ? name : 'duration'}
        style={style}
        disabled={disabled}
        label={label ? label : i18n.fieldLabels.duration}
        selectItems={selectProps.items}
        multiTypeInputProps={
          expressions
            ? { expressions }
            : {
                allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
              }
        }
      />
    )
  } else {
    return (
      <FormInput.Select
        name={name ? name : 'duration'}
        style={style}
        label={label ? label : i18n.fieldLabels.duration}
        items={selectProps.items}
        value={(formik?.values as ContinousVerificationFormData).spec?.spec?.duration as SelectOption}
        disabled={true}
      />
    )
  }
}

export function EnvironmentName(props: BaseFieldProps): JSX.Element {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { data: environmentOptions } = useGetEnvironmentListForProject({
    queryParams: {
      accountId,
      projectIdentifier,
      orgIdentifier
    } as GetEnvironmentListForProjectQueryParams,
    resolve: envList =>
      envList?.data.content?.map(({ identifier }: EnvironmentResponseDTO) => ({
        label: identifier,
        value: identifier
      })) || []
  })
  const { zIndex } = props
  const style: CSSProperties = useMemo(() => ({ zIndex: zIndex ?? 7 }), [zIndex]) as CSSProperties
  return (
    <FormInput.MultiTypeInput
      name="environment"
      style={style}
      label={i18n.fieldLabels.environment}
      selectItems={environmentOptions as SelectOption[]}
      multiTypeInputProps={{
        allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
      }}
    />
  )
}

export function TrafficSplit(props: BaseFieldProps): JSX.Element {
  const selectProps = useMemo(
    () => ({
      items: [
        { label: '5%', value: 5 },
        { label: '10%', value: 10 },
        { label: '15%', value: 15 }
      ]
    }),
    []
  )
  const { zIndex, label, name, expressions, disabled, formik } = props
  const style: CSSProperties = useMemo(() => ({ zIndex: zIndex ?? 6 }), [zIndex]) as CSSProperties
  if (!disabled) {
    return (
      <FormInput.MultiTypeInput
        name={name ? name : 'trafficSplit'}
        style={style}
        label={label ? label : i18n.fieldLabels.trafficSplit}
        selectItems={selectProps.items}
        multiTypeInputProps={
          expressions
            ? { expressions }
            : {
                allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
              }
        }
      />
    )
  } else {
    return (
      <FormInput.Select
        name={name ? name : 'trafficSplit'}
        label={label ? label : i18n.fieldLabels.trafficSplit}
        style={style}
        items={selectProps.items}
        value={(formik?.values as ContinousVerificationFormData).spec?.spec?.trafficsplit as SelectOption}
        disabled={true}
      />
    )
  }
}

export function Baseline(props: BaseFieldProps): JSX.Element {
  const selectProps = useMemo(
    () => ({
      items: [
        { label: i18n.baselineDefaultLabel.lastSuccess, value: 'LAST' },
        { label: i18n.baselineDefaultLabel.pinBaseline, value: 'PIN' }
      ]
    }),
    []
  )
  const { zIndex } = props
  const style: CSSProperties = useMemo(() => ({ zIndex: zIndex ?? 5 }), [zIndex]) as CSSProperties
  return (
    <FormInput.MultiTypeInput
      name="baseline"
      style={style}
      label={i18n.fieldLabels.baseline}
      selectItems={selectProps.items}
      multiTypeInputProps={{
        allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
      }}
    />
  )
}

export function BaselineSelect(props: BaseFieldProps): JSX.Element {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [baselineOption, setBaselineOption] = useState([...DefaultBaselineOptions])
  const { data } = useListBaselineExecutions({
    queryParams: {
      accountId,
      projectIdentifier,
      orgIdentifier
    }
  })

  useEffect(() => {
    if (data?.resource?.length) {
      const options = data.resource.map(item => {
        return {
          label: new Date(item?.createdAt || 0),
          value: item.verificationJobInstanceId
        }
      })
      setBaselineOption(baselineOption.concat(options as any))
    }
  }, [data])

  const { zIndex, label, name, expressions, disabled, formik } = props
  const style: CSSProperties = useMemo(() => ({ zIndex: zIndex ?? 5 }), [zIndex]) as CSSProperties
  if (!disabled) {
    return (
      <FormInput.MultiTypeInput
        name={name ? name : 'baseline'}
        style={style}
        disabled={disabled}
        label={label ? label : i18n.fieldLabels.baseline}
        selectItems={baselineOption}
        multiTypeInputProps={
          expressions
            ? { expressions }
            : {
                allowableTypes: [MultiTypeInputType.FIXED]
              }
        }
      />
    )
  } else {
    return (
      <FormInput.Select
        name={name ? name : 'baseline'}
        style={style}
        label={label ? label : i18n.fieldLabels.baseline}
        items={baselineOption}
        value={(formik?.values as ContinousVerificationFormData).spec?.spec?.baseline as SelectOption}
        disabled={true}
      />
    )
  }
}

// Remove this after old onboarding is removed
export function DataSource(props: BaseFieldProps): JSX.Element {
  const selectProps = useMemo(
    () => ({
      items: [
        { label: 'App Dynamics', value: 'APP_DYNAMICS' },
        { label: 'Splunk', value: 'SPLUNK' }
      ]
    }),
    []
  )
  const { zIndex } = props
  const style: CSSProperties = useMemo(() => ({ zIndex: zIndex ?? 4 }), [zIndex]) as CSSProperties
  return (
    <FormInput.MultiSelectTypeInput
      name="dataSource"
      style={style}
      label={i18n.fieldLabels.monitoringSource}
      selectItems={selectProps.items}
      multiSelectTypeInputProps={{
        multiSelectProps: {
          items: selectProps.items
        },
        allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
      }}
    />
  )
}

export function DataSources(props: BaseFieldProps & { formik: FormikProps<any> }): JSX.Element {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const [monitoringOptions, setMonitoringOptions] = useState([{ label: getString('all'), value: getString('all') }])
  const { data, loading } = useGetMonitoringSources({
    queryParams: {
      accountId,
      projectIdentifier,
      orgIdentifier
    }
  })
  useEffect(() => {
    if (!data?.data?.content?.length) {
      return
    }
    const options: MultiSelectOption[] = []
    for (const option of data.data.content) {
      if (option.monitoringSourceIdentifier && option.monitoringSourceName && option.type) {
        options.push({
          label: `${option.monitoringSourceName} - ${option.type?.toLocaleLowerCase()}`,
          value: option.monitoringSourceIdentifier
        })
      }
    }
    setMonitoringOptions(monitoringOptions.concat(options as any))
    props.formik.setFieldValue('dataSourceOptions', options)
  }, [data])

  const { zIndex } = props
  const style: CSSProperties = useMemo(() => ({ zIndex: zIndex ?? 4 }), [zIndex]) as CSSProperties
  return (
    <FormInput.MultiSelect
      name="dataSource"
      style={style}
      key={monitoringOptions?.[0]?.label}
      label={i18n.fieldLabels.monitoringSource}
      items={loading ? [{ label: getString('loading'), value: getString('loading') }] : monitoringOptions}
    />
  )
}

export const ActivitySource: React.FC<
  BaseFieldProps & { onChange?: (val: SelectOption) => void; getOptions?: (options: SelectOption[]) => void }
> = props => {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { showError } = useToaster()
  const [activityOptions, setActivityOptions] = useState<SelectOption[]>([{ label: getString('loading'), value: '' }])
  const { zIndex, onChange, getOptions } = props
  const { data, error } = useListActivitySources({
    queryParams: {
      accountId,
      projectIdentifier,
      orgIdentifier,
      offset: 0,
      pageSize: 100
    }
  })

  useEffect(() => {
    if (data?.data?.content) {
      const options = data.data.content.map(item => {
        return {
          label: item.name,
          value: item.identifier,
          icon: activityTypeToIconProps(item.type)
        }
      })
      setActivityOptions(options as any)
      getOptions?.(options)
    } else if (error?.message) {
      setActivityOptions([])
      showError(error.message, 7000)
    }
  }, [data, error?.message])

  const style: CSSProperties = useMemo(() => ({ zIndex: zIndex ?? 4 }), [zIndex]) as CSSProperties
  return (
    <FormInput.Select
      name="activitySource"
      style={style}
      className={css.activitySourceSelect}
      onChange={onChange}
      label={getString('changeSource')}
      items={activityOptions}
    />
  )
}
