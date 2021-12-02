import type { FilterDataInterface } from '@common/components/Filter/Constants'
import type { AuditFilterProperties } from 'services/audit'
import type { FilterDTO } from 'services/cd-ng'

class RequestUtil {
  static getValidFilterArguments(formData: Record<string, any>): AuditFilterProperties {
    return {
      actions: formData?.action,
      modules: formData?.module
    }
  }

  // static createRequestBodyPayload = ({
  //   isUpdate,
  //   data,
  //   projectIdentifier,
  //   orgIdentifier
  // }: {
  //   isUpdate: boolean
  //   data: FilterDataInterface<AuditFilterProperties, FilterDTO>
  //   projectIdentifier: string
  //   orgIdentifier: string
  // }): FilterDTO => {
  //   const {
  //     metadata: { name: _name, filterVisibility, identifier },
  //     formValues
  //   } = data

  //   const {
  //     actions: []
  //   } = RequestUtil.getValidFilterArguments(formValues)

  //   return {
  //     name: _name,
  //     identifier: isUpdate ? identifier : StringUtils.getIdentifierFromName(_name),
  //     projectIdentifier,
  //     orgIdentifier,
  //     filterVisibility: filterVisibility,
  //     filterProperties: {
  //       filterType: 'Connector',
  //       connectorNames: typeof _connectorNames === 'string' ? [_connectorNames] : _connectorNames,
  //       connectorIdentifiers:
  //         typeof _connectorIdentifiers === 'string' ? [_connectorIdentifiers] : _connectorIdentifiers,
  //       description: _description,
  //       types: _types,
  //       connectivityStatuses: _connectivityStatuses,
  //       tags: _tags
  //     } as ConnectorFilterProperties
  //   }
  // }
}

export default RequestUtil
