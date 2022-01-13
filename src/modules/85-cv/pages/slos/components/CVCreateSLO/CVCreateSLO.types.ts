import type { FormikProps } from 'formik'
import type {
  ServiceLevelIndicatorDTO,
  ServiceLevelIndicatorSpec,
  ThresholdSLIMetricSpec,
  RatioSLIMetricSpec,
  SLOTarget,
  CalenderSLOTargetSpec,
  WeeklyCalendarSpec
} from 'services/cv'

export enum CreateSLOTabs {
  NAME = 'NAME',
  SLI = 'SLI',
  SLO_TARGET_BUDGET_POLICY = 'SLO_TARGET_BUDGET_POLICY'
}

export enum SLITypes {
  AVAILABILITY = 'Availability',
  LATENCY = 'Latency'
}

export enum SLIMetricTypes {
  THRESHOLD = 'Threshold',
  RATIO = 'Ratio'
}

export enum SLIEventTypes {
  GOOD = 'Good',
  BAD = 'Bad'
}

export enum Comparators {
  LESS = '<',
  GREATER = '>',
  LESS_EQUAL = '<=',
  GREATER_EQUAL = '>='
}

export enum SLIMissingDataTypes {
  GOOD = 'Good',
  BAD = 'Bad',
  IGNORE = 'Ignore'
}

export enum PeriodTypes {
  ROLLING = 'Rolling',
  CALENDAR = 'Calender'
}

export enum PeriodLengthTypes {
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
  QUARTERLY = 'Quarterly'
}

export enum Days {
  MONDAY = 'Mon',
  TUESDAY = 'Tue',
  WEDNESDAY = 'Wed',
  THURSDAY = 'Thu',
  FRIDAY = 'Fri',
  SATURDAY = 'Sat',
  SUNDAY = 'Sun'
}

export const enum SLOFormFields {
  NAME = 'name',
  IDENTIFIER = 'identifier',
  DESCRIPTION = 'description',
  TAGS = 'tags',
  USER_JOURNEY_REF = 'userJourneyRef',
  MONITORED_SERVICE_REF = 'monitoredServiceRef',
  HEALTH_SOURCE_REF = 'healthSourceRef',
  SLI_TYPE = 'SLIType',
  SLI_METRIC_TYPE = 'SLIMetricType',
  EVENT_TYPE = 'eventType',
  VALID_REQUEST_METRIC = 'validRequestMetric',
  GOOD_REQUEST_METRIC = 'goodRequestMetric',
  OBJECTIVE_VALUE = 'objectiveValue',
  OBJECTIVE_COMPARATOR = 'objectiveComparator',
  SLI_MISSING_DATA_TYPE = 'SLIMissingDataType',
  PERIOD_TYPE = 'periodType',
  PERIOD_LENGTH = 'periodLength',
  PERIOD_LENGTH_TYPE = 'periodLengthType',
  DAY_OF_MONTH = 'dayOfMonth',
  DAY_OF_WEEK = 'dayOfWeek',
  SLO_TARGET_PERCENTAGE = 'SLOTargetPercentage'
}

export interface SLIForm {
  [SLOFormFields.SLI_TYPE]: ServiceLevelIndicatorDTO['type']
  [SLOFormFields.SLI_METRIC_TYPE]?: ServiceLevelIndicatorSpec['type']
  [SLOFormFields.EVENT_TYPE]?: RatioSLIMetricSpec['eventType']
  [SLOFormFields.VALID_REQUEST_METRIC]: string
  [SLOFormFields.GOOD_REQUEST_METRIC]?: string
  [SLOFormFields.OBJECTIVE_VALUE]?: number
  [SLOFormFields.OBJECTIVE_COMPARATOR]?: ThresholdSLIMetricSpec['thresholdType']
  [SLOFormFields.SLI_MISSING_DATA_TYPE]: ServiceLevelIndicatorDTO['sliMissingDataType']
  [SLOFormFields.NAME]?: string
  [SLOFormFields.IDENTIFIER]?: string
  [SLOFormFields.HEALTH_SOURCE_REF]?: string
}

export interface SLOForm extends SLIForm {
  [SLOFormFields.NAME]: string
  [SLOFormFields.IDENTIFIER]: string
  [SLOFormFields.DESCRIPTION]?: string
  [SLOFormFields.TAGS]?: { [key: string]: string }
  [SLOFormFields.USER_JOURNEY_REF]: string
  [SLOFormFields.MONITORED_SERVICE_REF]: string
  [SLOFormFields.HEALTH_SOURCE_REF]: string
  [SLOFormFields.PERIOD_TYPE]?: SLOTarget['type']
  [SLOFormFields.PERIOD_LENGTH]?: string
  [SLOFormFields.PERIOD_LENGTH_TYPE]?: CalenderSLOTargetSpec['type']
  [SLOFormFields.DAY_OF_MONTH]?: string
  [SLOFormFields.DAY_OF_WEEK]?: WeeklyCalendarSpec['dayOfWeek']
  [SLOFormFields.SLO_TARGET_PERCENTAGE]: number
}

export interface NavButtonsProps {
  formikProps: FormikProps<SLOForm>
  loading?: boolean
}

export interface SLONameProps {
  children: JSX.Element
  formikProps: FormikProps<SLOForm>
  identifier?: string
}

export interface SLIProps {
  children: JSX.Element
  formikProps: FormikProps<SLOForm>
}

export interface SLOTargetAndBudgetPolicyProps {
  children: JSX.Element
  formikProps: FormikProps<SLOForm>
}
