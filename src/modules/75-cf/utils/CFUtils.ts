import { useMemo } from 'react'
import { get } from 'lodash-es'
import { Utils } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'
import type { Feature } from 'services/cf'

const LOCALE = 'en'

/**
 * Format a timestamp to short format time (i.e: 7:41 AM)
 * @param timestamp Timestamp
 * @param timeStyle Optional DateTimeFormat's `timeStyle` option.
 */
export function formatTime(timestamp: number, timeStyle = 'short'): string {
  return new Intl.DateTimeFormat(LOCALE, {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore: TS built-in type for DateTimeFormat is not correct
    timeStyle
  }).format(new Date(timestamp))
}

/**
 * Format a timestamp to medium format date (i.e: Jan 1, 2021)
 * @param timestamp Timestamp
 * @param dateStyle Optional DateTimeFormat's `dateStyle` option.
 */
export function formatDate(timestamp: number, dateStyle = 'medium'): string {
  return new Intl.DateTimeFormat(LOCALE, {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore: TS built-in type for DateTimeFormat is not correct
    dateStyle
  }).format(new Date(timestamp))
}

export enum FFDetailPageTab {
  TARGETING = 'targeting',
  ACTIVITY = 'activity'
}

export const CF_LOCAL_STORAGE_ENV_KEY = 'cf_selected_env'
export const DEFAULT_ENV = { label: '', value: '' }
export const CF_DEFAULT_PAGE_SIZE = 15
export const ADIT_LOG_EMPTY_ENTRY_ID = '00000000-0000-0000-0000-000000000000'

export const FeatureFlagActivationStatus = {
  ON: 'on',
  OFF: 'off'
}

export const AuditLogObjectType = {
  FeatureActivation: 'FeatureActivation' as 'FeatureActivation',
  Segment: 'Segment' as 'Segment'
}

export const AuditLogAction = {
  FeatureActivationCreated: 'FeatureActivationCreated',
  SegmentCreated: 'SegmentCreated',
  FeatureActivationPatched: 'FeatureActivationPatched'
}

export const isFeatureFlagOn = (featureFlag: Feature) => {
  return featureFlag.envProperties?.state?.toLocaleLowerCase() === FeatureFlagActivationStatus.ON
}

export const featureFlagHasCustomRules = (featureFlag: Feature) => {
  return featureFlag.envProperties?.rules?.length || featureFlag.envProperties?.variationMap?.length
}

export enum FeatureFlagBucketBy {
  IDENTIFIER = 'identifier',
  NAME = 'name'
}

export const useBucketByItems = () => {
  const { getString } = useStrings()
  const bucketByItems = useMemo(
    () => [
      {
        label: getString('identifier'),
        value: FeatureFlagBucketBy.IDENTIFIER
      },
      {
        label: getString('name'),
        value: FeatureFlagBucketBy.NAME
      }
    ],
    [getString]
  )

  return bucketByItems
}

// This util unescape <strong/> sequences in i18n output to support bold text
// Note: To avoid XSS vulnerability, call replace() with full
// escaped sequences and not single character like `<', '>', etc...
export const unescapeI18nSupportedTags = (str: string) =>
  str.replace(/&lt;strong&gt;/g, '<strong>').replace(/&lt;&#x2F;strong&gt;/g, '</strong>')

// FF Environment SDK Type
export enum EnvironmentSDKKeyType {
  SERVER = 'Server',
  CLIENT = 'Client'
}

export const NO_ENVIRONMENT_IDENTIFIER = '-1'

export const DISABLE_AVATAR_PROPS = {
  onMouseEnter: Utils.stopEvent,
  onClick: Utils.stopEvent,
  onMouseDown: Utils.stopEvent,
  style: { cursor: 'default' }
}

export enum SortOrder {
  ASCENDING = 'ASCENDING',
  DESCENDING = 'DESCENDING'
}

export enum SegmentsSortByField {
  NAME = 'name',
  IDENTIFIER = 'identifier',
  ARCHIVED = 'archived',
  KIND = 'kind',
  MODIFIED_AT = 'modifiedAt'
}

export enum FlagsSortByField {
  NAME = 'name',
  IDENTIFIER = 'identifier',
  ARCHIVED = 'archived',
  KIND = 'kind',
  MODIFIED_AT = 'modifiedAt'
  // TODO: backend needs to support Last Evaluated & Variation, etc..
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getErrorMessage = (error: any): string =>
  get(error, 'data.error', get(error, 'data.message', error?.message))

export const TARGET_PRIMARY_COLOR = '#47D5DF'
export const SEGMENT_PRIMARY_COLOR = '#BDA5F2'

const ABBREV = 'KMB'

function round(n: number, precision: number): number {
  const prec = Math.pow(10, precision)
  return Math.round(n * prec) / prec
}

export function formatNumber(n: number): string {
  let base = Math.floor(Math.log(Math.abs(n)) / Math.log(1000))
  const suffix = ABBREV[Math.min(2, base - 1)]
  base = ABBREV.indexOf(suffix) + 1
  return suffix ? round(n / Math.pow(1000, base), 2) + suffix : '' + n
}

export enum SegmentFlagType {
  DIRECT = 'DIRECT',
  CONDITION = 'CONDITION'
}
