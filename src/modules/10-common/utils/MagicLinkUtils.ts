import { ResourceType } from '@common/interfaces/ResourceType'
import routes from '@common/RouteDefinitions'


// This function is responsible of generating the link of resource detail as per resource type
//All the resource team need to update the Switch case as per the resource detail logic
export const getMagicLink = (resource: ResourceType, props, identifier): string | undefined => {
  switch (resource) {
    case ResourceType.PROJECT:
      return undefined

    case ResourceType.CONNECTOR:

      return getUrlWithParamValue(routes.toProjectResourcesConnectorDetails(props), identifier)

    case ResourceType.SECRET:
      return undefined

    default:
      return undefined
  }
}

const getUrlWithParamValue = (resourceUrl, paramName) => {

  return `${resourceUrl.split('/:')[0]}/${paramName}`
}

