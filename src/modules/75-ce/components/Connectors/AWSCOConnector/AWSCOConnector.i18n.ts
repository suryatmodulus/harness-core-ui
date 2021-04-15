export default {
  title: 'AWS Cloud Provider',
  overview: {
    title: 'AWS Cloud Provider Overview',
    reqirementLabel: 'Adding an AWS account for',
    label: 'Name of the connector',
    placeholder: 'My AWS Connector 1',
    submitText: 'Continue',
    featureSelection: 'Pick the features you want to use the connector for Continuous Efficiency',
    permission: {
      billing: {
        label: 'Cost Visibility-Billing',
        description: 'To visualise cloud costs, utilization and events'
      },
      events: {
        label: 'Cost Visibility-Events',
        description: 'To visualise cloud costs, utilization and events'
      },
      optimization: {
        label: 'Cost Optimization',
        description: 'Cut costs by scaling down in non-working hours'
      }
    },
    validation: {
      name: 'Connector name is a required field',
      identifier: {
        required: 'Identifier is required',
        format: 'Identifier can only contain alphanumerics, _ and $'
      }
    }
  },
  crossAccountRole: {
    title: 'AWS Connection Details',
    instructionLabel: 'Follow these instructions to Create a Cross-account Role',
    text: 'Create Cross-Account Role using AWS CloudFormation Template and Provide IAM ARN',
    requirementExplanation:
      'Harness uses the secure cross-account role to access your AWS account. The role includes a restricted policy to access the cost and usage reports and resources for the sole purpose of cost analysis. Harness will never modify any of your workloads. Cross-Account IAM ARN is the Output of CloudFormation Stack',
    arn: 'Cross-Account Role ARN',
    externalID: 'External ID',
    validation: {
      arnRequired: 'Role ARN is required',
      extIDRequired: 'External ID is required'
    },
    submitText: 'Save & Continue',
    templateLaunchText: 'Launch Template in AWS Console'
  },
  testConnection: {
    title: 'Test Connection',
    auth: {
      valid: 'Validating AWS Cloud Provider authentication and permissions'
    },
    cur: {
      valid: 'Verifying the CUR report and S3 bucket name'
    },
    crossARN: {
      valid: 'Validating the Cross-account role ARN'
    },
    finish: 'Finish',
    cancel: 'Cancel'
  },
  visibility: {
    title: 'Visibility',
    description: 'Cost Insights, Anomaly detection, Creating budget and perspectives for the Cloud'
  },
  event: {
    title: 'Event Correlation',
    description:
      'Cost insights, Service insights,Creating budgets and perspectives, Anomaly detection and alerts, utilised/wasted resouces in ECS Clusters'
  },
  optimization: {
    title: 'Optimization',
    description:
      'Detection of orphaned resources, recommendations to save costs, Scaling/tearing down, turning off in non-work hours, reserving instances'
  },
  cost: 'COST'
}
