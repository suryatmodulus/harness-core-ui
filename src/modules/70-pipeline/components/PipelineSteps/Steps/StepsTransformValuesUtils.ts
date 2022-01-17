/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@wings-software/uicore'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { get, set, isEmpty, isObjectLike, isPlainObject, isBoolean } from 'lodash-es'
import { getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import type {
  MapType,
  MultiTypeConnectorRef,
  MultiTypeSelectOption,
  MultiTypeListUIType,
  MultiTypeMapUIType
} from './StepsTypes'

export enum Types {
  Text,
  Map,
  List,
  OutputVariables,
  ArchiveFormat,
  Pull,
  BuildTool,
  Language,
  ConnectorRef,
  ReportPaths,
  LimitMemory,
  LimitCPU,
  Provisioner,
  Boolean,
  ImagePullPolicy,
  Shell
}

interface Field {
  name: string
  type: Types
}

type Dependencies = { [key: string]: any }

export function removeEmptyKeys<T>(object: { [key: string]: any }): T {
  Object.keys(object).forEach(key => {
    // We should skip this check for boolean in order not to remove a key with a value "false"
    if (((isObjectLike(object[key]) && isEmpty(object[key])) || !object[key]) && !isBoolean(object[key])) {
      delete object[key]
      return
    }

    if (isPlainObject(object[key])) {
      removeEmptyKeys(object[key])

      if (isEmpty(object[key])) {
        delete object[key]
      }
    }
  })

  return object as T
}

export function getInitialValuesInCorrectFormat<T, U>(
  initialValues: T,
  fields: Field[],
  {
    archiveFormatOptions,
    pullOptions,
    buildToolOptions,
    languageOptions,
    imagePullPolicyOptions,
    shellOptions
  }: Dependencies = {}
): U {
  const values = {}

  fields.forEach(({ name, type }) => {
    const value = get(initialValues, name)

    if (type === Types.Text || type === Types.ConnectorRef || type === Types.Boolean) {
      set(values, name, value)
    }

    if (type === Types.Map) {
      const map =
        typeof value === 'string'
          ? value
          : Object.keys(value || {}).map(key => ({
              id: uuid('', nameSpace()),
              key: key,
              value: value[key]
            }))

      set(values, name, map)
    }

    if (type === Types.List) {
      const list =
        typeof value === 'string'
          ? value
          : value?.map((_value: string) => ({
              id: uuid('', nameSpace()),
              value: _value
            })) || []

      set(values, name, list)
    }

    if (type === Types.OutputVariables) {
      const list =
        typeof value === 'string'
          ? value
          : value?.map((_value: { name: string }) => ({
              id: uuid('', nameSpace()),
              value: _value.name
            })) || []

      set(values, name, list)
    }

    if (type === Types.ArchiveFormat) {
      const archiveFormat =
        getMultiTypeFromValue(value) === MultiTypeInputType.FIXED
          ? archiveFormatOptions?.find((option: SelectOption) => option.value === value) || archiveFormatOptions[0]
          : value

      set(values, name, archiveFormat)
    }

    if (type === Types.Pull) {
      const pull =
        getMultiTypeFromValue(value) === MultiTypeInputType.FIXED
          ? pullOptions?.find((option: SelectOption) => option.value === value) || pullOptions[0]
          : value

      set(values, name, pull)
    }

    if (type === Types.BuildTool) {
      const buildTool =
        getMultiTypeFromValue(value) === MultiTypeInputType.FIXED
          ? buildToolOptions?.find((option: SelectOption) => option.value === value)
          : value

      set(values, name, buildTool)
    }

    if (type === Types.ImagePullPolicy) {
      const imagePullPolicy =
        getMultiTypeFromValue(value) === MultiTypeInputType.FIXED
          ? imagePullPolicyOptions?.find((option: SelectOption) => option.value === value)
          : value

      set(values, name, imagePullPolicy)
    }

    if (type === Types.Shell) {
      const shell =
        getMultiTypeFromValue(value) === MultiTypeInputType.FIXED
          ? shellOptions?.find((option: SelectOption) => option.value === value)
          : value

      set(values, name, shell)
    }

    if (type === Types.Language) {
      const language =
        getMultiTypeFromValue(value) === MultiTypeInputType.FIXED
          ? languageOptions?.find((option: SelectOption) => option.value === value)
          : value

      set(values, name, language)
    }

    if (type === Types.LimitMemory) {
      const _value = get(initialValues, 'spec.resources.limits.memory')
      set(values, 'spec.limitMemory', _value)
    }

    if (type === Types.ReportPaths) {
      const _value = get(initialValues, 'spec.reports.spec.paths')

      const list =
        typeof _value === 'string'
          ? _value
          : _value?.map((val: string) => ({
              id: uuid('', nameSpace()),
              value: val
            })) || []

      set(values, 'spec.reportPaths', list)
    }

    if (type === Types.LimitCPU) {
      const _value = get(initialValues, 'spec.resources.limits.cpu')
      set(values, 'spec.limitCPU', _value)
    }

    if (type === Types.Provisioner) {
      const provisioner = get(initialValues, 'provisioner')
      set(values, 'provisioner.stage.spec.execution', provisioner)
    }
  })

  return values as U
}

export function getFormValuesInCorrectFormat<T, U>(formValues: T, fields: Field[]): U {
  const values = {}

  fields.forEach(({ name, type }) => {
    if (type === Types.Text || type === Types.Boolean) {
      const value = get(formValues, name)
      set(values, name, value)
    }

    if (type === Types.Map) {
      const value = get(formValues, name) as MultiTypeMapUIType

      const map: MapType = {}
      if (Array.isArray(value)) {
        value.forEach(mapValue => {
          if (mapValue.key) {
            map[mapValue.key] = mapValue.value
          }
        })
      }

      set(values, name, typeof value === 'string' ? value : map)
    }

    if (type === Types.List) {
      const value = get(formValues, name) as MultiTypeListUIType

      const list =
        typeof value === 'string'
          ? value
          : value?.filter(listValue => !!listValue.value).map(listValue => listValue.value)
      set(values, name, list)
    }

    if (type === Types.OutputVariables) {
      const value = get(formValues, name) as MultiTypeListUIType

      const list =
        typeof value === 'string'
          ? value
          : value
              ?.filter(listValue => !!listValue.value)
              .map(listValue => ({
                name: listValue.value
              }))
      set(values, name, list)
    }

    if (type === Types.ConnectorRef) {
      const value = get(formValues, name) as MultiTypeConnectorRef

      const connectorRef = typeof value === 'string' ? value : value?.value
      set(values, name, connectorRef)
    }
    // Set Select field values
    if (
      type === Types.ArchiveFormat ||
      type === Types.Pull ||
      type === Types.BuildTool ||
      type === Types.Language ||
      type === Types.Shell ||
      type === Types.ImagePullPolicy
    ) {
      const value = get(formValues, name) as MultiTypeSelectOption

      const pull = typeof value === 'string' ? value : value?.value
      set(values, name, pull)
    }

    if (type === Types.ReportPaths) {
      const _value = get(formValues, 'spec.reportPaths') as MultiTypeListUIType

      const list =
        typeof _value === 'string'
          ? _value
          : _value?.filter(listValue => !!listValue.value).map(listValue => listValue.value)

      if (!isEmpty(list)) {
        set(values, 'spec.reports.type', 'JUnit')
      }

      set(values, 'spec.reports.spec.paths', list)
    }

    if (type === Types.LimitMemory) {
      const _value = get(formValues, 'spec.limitMemory')
      set(values, 'spec.resources.limits.memory', _value)
    }

    if (type === Types.LimitCPU) {
      const _value = get(formValues, 'spec.limitCPU')
      set(values, 'spec.resources.limits.cpu', _value)
    }

    if (type === Types.Provisioner) {
      const _value = get(formValues, 'provisioner.stage.spec.execution')
      set(values, 'provisioner', _value)
    }
  })

  return removeEmptyKeys<U>(values)
}
