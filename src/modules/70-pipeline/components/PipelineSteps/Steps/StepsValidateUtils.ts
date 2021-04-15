import * as yup from 'yup'
import type { StringSchema, Lazy, ArraySchema, Schema } from 'yup'
import type { FormikErrors } from 'formik'
import { getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import { get, set, uniq, uniqBy, isEmpty } from 'lodash-es'
import type { UseStringsReturn } from 'framework/strings/String'
import { StringUtils } from '@common/exports'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type { ExecutionWrapperConfig, StepElementConfig } from 'services/cd-ng'
import type { StringKeys } from 'framework/exports'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

export enum Types {
  Text,
  List,
  Map,
  Identifier,
  Name,
  OutputVariables,
  LimitMemory,
  LimitCPU,
  Timeout
}

interface Field {
  name: string
  type: Types | Types[]
  label?: string
  isRequired?: boolean
  isInputSet?: boolean
  isActive?: boolean
}

interface SchemaField {
  name: string
  validationRule: Schema<any>
  isActive?: boolean
}

type Dependencies = { [key: string]: any }

interface GenerateSchemaDependencies extends Dependencies {
  getString: UseStringsReturn['getString']
}

const validIdRegex = /^(?![0-9])[0-9a-zA-Z_]*$/
const validNameRegex = /^[0-9a-zA-Z_-\s]*$/

function generateSchemaForIdentifier({
  initialValues,
  steps,
  serviceDependencies,
  getString
}: GenerateSchemaDependencies): StringSchema {
  return yup
    .string()
    .trim()
    .matches(validIdRegex, getString('validation.validStepIdRegex'))
    .notOneOf(StringUtils.illegalIdentifiers, getString('validation.illegalIdentifier'))
    .test('isStepIdUnique', getString('validation.uniqueStepAndServiceDependenciesId'), identifier => {
      if (isEmpty(initialValues) || (isEmpty(steps) && isEmpty(serviceDependencies))) return true

      const stepsAndDependencies: StepElementConfig[] = [...serviceDependencies]

      // TODO: Add support for stepGroup
      steps.forEach(({ step, parallel }: ExecutionWrapperConfig) => {
        if (parallel) {
          // TODO: Fix typings
          ;(parallel as any).forEach(({ step: parallelStep }: { step: StepElementConfig }) => {
            stepsAndDependencies.push(parallelStep)
          })
        } else {
          stepsAndDependencies.push(step as StepElementConfig)
        }
      })

      const currentStepIndex = stepsAndDependencies.findIndex(step => {
        return step?.identifier === initialValues.identifier
      })

      return stepsAndDependencies.every((step, index: number) => {
        // Skip ID validation for the currently opened step (if it was already added)
        if (currentStepIndex === index) return true

        return step?.identifier !== identifier
      })
    })
}

function generateSchemaForName({ getString }: GenerateSchemaDependencies): StringSchema {
  return yup.string().matches(validNameRegex, getString('validation.validStepNameRegex'))
}

function generateSchemaForList(
  { label, isRequired, isInputSet }: Field,
  { getString }: GenerateSchemaDependencies
): Lazy {
  if (isInputSet) {
    let schema = yup.array().test('valuesShouldBeUnique', getString('validation.uniqueValues'), list => {
      if (!list) return true
      return uniq(list).length === list.length
    })

    if (isRequired && label) {
      schema = schema
        .ensure()
        .compact()
        .min(1, getString('fieldRequired', { field: getString(label as StringKeys) }))
    }

    return schema
  } else {
    return yup.lazy(value => {
      if (Array.isArray(value)) {
        let schema = yup.array().test('valuesShouldBeUnique', getString('validation.uniqueValues'), list => {
          if (!list) return true

          return uniqBy(list, 'value').length === list.length
        })

        if (Array.isArray(value) && isRequired && label) {
          schema = schema
            .ensure()
            .compact((val: any) => !val?.value)
            .min(1, getString('fieldRequired', { field: getString(label as StringKeys) }))
        }

        return schema
      } else {
        return yup.string()
      }
    })
  }
}

function generateSchemaForMap(
  { label, isRequired, isInputSet }: Field,
  { getString }: GenerateSchemaDependencies
): Lazy {
  if (isInputSet) {
    // We can't add validation for key uniqueness and key's value
    return yup.mixed().test('validKeys', getString('validation.validKeyRegex'), map => {
      if (!map) return true
      return Object.keys(map).every(key => validIdRegex.test(key))
    })
  } else {
    return yup.lazy(value => {
      if (Array.isArray(value)) {
        let schema = yup
          .array()
          .of(
            yup.object().shape(
              {
                key: yup.string().when('value', {
                  is: val => val?.length,
                  then: yup
                    .string()
                    .matches(validIdRegex, getString('validation.validKeyRegex'))
                    .required(getString('validation.keyRequired'))
                }),
                value: yup.string().when('key', {
                  is: val => val?.length,
                  then: yup.string().required(getString('validation.valueRequired'))
                })
              },
              [['key', 'value']]
            )
          )
          .test('keysShouldBeUnique', getString('validation.uniqueKeys'), map => {
            if (!map) return true

            return uniqBy(map, 'key').length === map.length
          })

        if (Array.isArray(value) && isRequired && label) {
          schema = schema
            .ensure()
            .compact((val: any) => !val?.value)
            .min(1, getString('fieldRequired', { field: getString(label as StringKeys) }))
        }

        return schema
      } else {
        return yup.string()
      }
    })
  }
}

function generateSchemaForOutputVariables(
  { isInputSet }: Field,
  { getString }: GenerateSchemaDependencies
): ArraySchema<any> | Lazy {
  if (isInputSet) {
    return yup
      .array()
      .of(yup.string().matches(validIdRegex, getString('validation.validOutputVariableRegex')))
      .test('valuesShouldBeUnique', getString('validation.uniqueValues'), outputVariables => {
        if (!outputVariables) return true

        return uniq(outputVariables).length === outputVariables.length
      })
  } else {
    return yup.lazy(value =>
      Array.isArray(value)
        ? yup
            .array()
            .of(
              yup.object().shape({
                value: yup.lazy(val =>
                  getMultiTypeFromValue(val as string) === MultiTypeInputType.FIXED
                    ? yup.string().matches(validIdRegex, getString('validation.validOutputVariableRegex'))
                    : yup.string()
                )
              })
            )
            .test('valuesShouldBeUnique', getString('validation.uniqueValues'), outputVariables => {
              if (!outputVariables) return true

              return uniqBy(outputVariables, 'value').length === outputVariables.length
            })
        : yup.string()
    )
  }
}

function generateSchemaForLimitMemory({ getString, isRequired = false }: GenerateSchemaDependencies): Lazy {
  return yup.lazy(value => {
    if (isRequired) {
      return getMultiTypeFromValue(value as string) === MultiTypeInputType.FIXED
        ? yup
            .string()
            .required()
            // ^$ in the end is to pass empty string because otherwise it will fail
            // .matches(/^\d+$|^\d+(E|P|T|G|M|K|Ei|Pi|Ti|Gi|Mi|Ki)$|^$/, getString('validation.matchPattern'))
            .matches(/^\d+(\.\d+)?$|^\d+(\.\d+)?(G|M|Gi|Mi)$|^$/, getString('validation.matchPattern'))
        : yup.string().required()
    }
    return getMultiTypeFromValue(value as string) === MultiTypeInputType.FIXED
      ? yup
          .string()
          // ^$ in the end is to pass empty string because otherwise it will fail
          // .matches(/^\d+$|^\d+(E|P|T|G|M|K|Ei|Pi|Ti|Gi|Mi|Ki)$|^$/, getString('validation.matchPattern'))
          .matches(/^\d+(\.\d+)?$|^\d+(\.\d+)?(G|M|Gi|Mi)$|^$/, getString('validation.matchPattern'))
      : yup.string()
  })
}

function generateSchemaForLimitCPU({ getString }: GenerateSchemaDependencies): Lazy {
  return yup.lazy(value =>
    getMultiTypeFromValue(value as string) === MultiTypeInputType.FIXED
      ? // ^$ in the end is to pass empty string because otherwise it will fail
        yup.string().matches(/^\d+(\.\d+)?$|^\d+m$|^$/, getString('validation.matchPattern'))
      : yup.string()
  )
}

export function generateSchemaFields(
  fields: Field[],
  { initialValues, steps, serviceDependencies, getString }: GenerateSchemaDependencies
): SchemaField[] {
  return fields.map(field => {
    const { name, type, label, isRequired, isActive } = field

    let validationRule

    if (type === Types.List) {
      validationRule = generateSchemaForList(field, { getString })
    }

    if (type === Types.Map) {
      validationRule = generateSchemaForMap(field, { getString })
    }

    if (type === Types.Identifier) {
      validationRule = generateSchemaForIdentifier({ initialValues, steps, serviceDependencies, getString })
    }

    if (type === Types.Name) {
      validationRule = generateSchemaForName({ getString })
    }

    if (type === Types.OutputVariables) {
      validationRule = generateSchemaForOutputVariables(field, { getString })
    }

    if (type === Types.LimitMemory) {
      validationRule = generateSchemaForLimitMemory({ getString })
    }

    if (type === Types.LimitCPU) {
      validationRule = generateSchemaForLimitCPU({ getString })
    }

    if (type === Types.Timeout) {
      validationRule = getDurationValidationSchema()
    }

    if ((type === Types.Identifier || type === Types.Name || type === Types.Text) && isRequired && label) {
      if (validationRule) {
        validationRule = (validationRule as any).required(
          getString('fieldRequired', { field: getString(label as StringKeys) })
        )
      } else {
        validationRule = yup.string().required(getString('fieldRequired', { field: getString(label as StringKeys) }))
      }
    }

    return {
      name,
      validationRule,
      isActive
    }
  })
}

export function validate(values: any, config: Field[], dependencies: GenerateSchemaDependencies): FormikErrors<any> {
  const errors = {}
  const schemaFields = generateSchemaFields(config, dependencies)
  schemaFields.forEach(({ name, validationRule, isActive = true }) => {
    if (!isActive) return

    try {
      if (dependencies.type === StepType.Dependency && name === 'spec.limitMemory') {
        const cpuVal = get(values, 'spec.limitCPU')
        if (cpuVal) {
          generateSchemaForLimitMemory({ getString: dependencies.getString, isRequired: true }).validateSync(
            get(values, name)
          )
        }
      } else {
        validationRule.validateSync(get(values, name))
      }
    } catch (error) {
      set(errors, name, error.message)
    }
  })

  return errors
}

export function validateInputSet(
  values: any,
  template: any,
  config: Field[],
  dependencies: GenerateSchemaDependencies
): FormikErrors<any> {
  const configWithActiveState = config.map(field => {
    return {
      ...field,
      isInputSet: true,
      isActive: !!get(template, field.name)
    }
  })

  return validate(values, configWithActiveState, dependencies)
}
