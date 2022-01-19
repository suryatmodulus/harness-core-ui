const PREFIX_CCM_EVENTS = 'ccm_'

export const CE_AWS_CONNECTOR_CREATION_EVENTS = {
  LOAD_OVERVIEW_STEP: PREFIX_CCM_EVENTS + 'aws_overview_step',
  LOAD_CUR_STEP: PREFIX_CCM_EVENTS + 'aws_cur_step',
  LOAD_CHOOSE_REQUIREMENTS: PREFIX_CCM_EVENTS + 'aws_choose_requirements_step',
  LOAD_CREATE_CROSS_ACCOUNT_ROLE: PREFIX_CCM_EVENTS + 'aws_create_cross_account_role',
  LOAD_CONNECTION_TEST: PREFIX_CCM_EVENTS + 'aws_connection_test',
  CONNECTOR_FINISH_CLICK: PREFIX_CCM_EVENTS + 'aws_connector_finish_click'
}

export const CE_AZURE_CONNECTOR_CREATION_EVENTS = {
  LOAD_OVERVIEW_STEP: PREFIX_CCM_EVENTS + 'azure_overview_step',
  LOAD_AZURE_BILLING_EXPORT: PREFIX_CCM_EVENTS + 'azure_billing_export_step',
  LOAD_CHOOSE_REQUIREMENT: PREFIX_CCM_EVENTS + 'azure_choose_requirement_step',
  LOAD_SERVICE_PRINCIPAL: PREFIX_CCM_EVENTS + 'azure_service_principal_step',
  LOAD_CONNECTION_TEST: PREFIX_CCM_EVENTS + 'azure_connection_test',
  CONNECTOR_FINISH_CLICK: PREFIX_CCM_EVENTS + 'azure_connector_finish_click'
}

export const CE_GCP_CONNECTOR_CREATION_EVENTS = {
  LOAD_OVERVIEW_STEP: PREFIX_CCM_EVENTS + 'gcp_overview_step',
  LOAD_BILLING_EXPORT_SETUP: PREFIX_CCM_EVENTS + 'gcp_setup_billing_export_step',
  LOAD_GRANT_PERMISSIONS: PREFIX_CCM_EVENTS + 'gcp_grant_permissions_step',
  LOAD_CONNECTION_TEST: PREFIX_CCM_EVENTS + 'gcp_connection_test',
  CONNECTOR_FINISH_CLICK: PREFIX_CCM_EVENTS + 'gcp_connector_finish_click'
}
