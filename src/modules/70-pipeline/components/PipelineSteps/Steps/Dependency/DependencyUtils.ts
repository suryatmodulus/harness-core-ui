import { isEmpty } from 'lodash-es'
import type { DependencyData, DependencyDataUI } from './Dependency'

export function convertToUIModel(data: DependencyData): DependencyDataUI {
  const environment = Object.keys(data.spec.environment || {}).map(key => ({
    key: key,
    value: data.spec.environment![key]
  }))

  return {
    identifier: data.identifier,
    name: data.name,
    spec: {
      image: data.spec.image,
      connectorRef: data.spec.connectorRef,
      environment: environment,
      entrypoint: data.spec.entrypoint || [],
      args: data.spec.args || [],
      limitMemory: data.spec?.resources?.limit?.memory, //?.match(/\d+/g)?.join(''),
      limitMemoryUnits: 'Mi', //?.match(/[A-Za-z]+$/)?.join('') || LimitMemoryUnits.Mi,
      limitCPU: data.spec?.resources?.limit?.cpu
    }
  }
}

export function convertFromUIModel(data: DependencyDataUI): DependencyData {
  const environment: { [key: string]: string } = {}
  data.spec.environment.forEach((pair: { key: string; value: string }) => {
    // skip empty
    if (pair.key) {
      environment[pair.key] = pair.value
    }
  })

  let connectorRef
  if (data.spec.connectorRef) {
    connectorRef = data.spec.connectorRef?.value || data.spec.connectorRef
  }

  const schemaValues: DependencyData = {
    identifier: data.identifier,
    name: data.name,
    spec: {
      image: data.spec.image,
      ...(connectorRef && { connectorRef }),
      ...(!isEmpty(environment) && { environment }),
      ...(!isEmpty(data.spec.entrypoint) && { entrypoint: data.spec.entrypoint }),
      ...(!isEmpty(data.spec.args) && { args: data.spec.args }),
      ...((!isEmpty(data.spec.limitMemory) || !isEmpty(data.spec.limitCPU)) && {
        ...((data.spec.limitMemory || data.spec.limitCPU) && {
          resources: {
            limit: {
              ...(data.spec.limitMemory && { memory: parseInt(data.spec.limitMemory, 10) }),
              ...(data.spec.limitCPU && { cpu: parseInt(data.spec.limitCPU, 10) })
            }
          }
        })
      })
    }
  }

  // TODO: TBD
  //if (data.spec.limitMemory && data.spec.limitMemoryUnits) {
  //  schemaValues.spec.resources.limit.memory = data.spec.limitMemory + data.spec.limitMemoryUnits
  //}

  return schemaValues
}
