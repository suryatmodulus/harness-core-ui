/**
 * Please match the config key to the directory under services.
 * This is required for the transform to work
 */
const customGenerator = require('./scripts/swagger-custom-generator.js')

module.exports = {
  portal: {
    output: 'src/services/portal/index.tsx',
    // url: 'https://localhost:9090/api/swagger.json',
    file: 'src/services/portal/swagger.json',
    validation: false,
    transformer: 'scripts/swagger-transform.js',
    customImport: `import { getConfig } from "../config";`,
    customProps: {
      base: `{getConfig("api")}`
    }
  },
  'cd-ng': {
    output: 'src/services/cd-ng/index.tsx',
    transformer: 'scripts/swagger-transform.js',
    customImport: `import { getConfig, getUsingFetch, mutateUsingFetch, GetUsingFetchProps, MutateUsingFetchProps } from "../config";`,
    customProps: {
      base: `{getConfig("ng/api")}`
    },
    customGenerator: arg => customGenerator(arg, "getConfig('ng/api')"),
    ...(process.env.cdng_schema_path
      ? { file: process.env.cdng_schema_path }
      : { url: 'http://localhost:7457/swagger.json' })
  },
  'pipeline-ng': {
    output: 'src/services/pipeline-ng/index.tsx',
    url: 'http://localhost:12001/api/swagger.json',
    transformer: 'scripts/swagger-transform.js',
    customImport: `import { getConfig, getUsingFetch, mutateUsingFetch, GetUsingFetchProps, MutateUsingFetchProps } from "../config";`,
    customProps: {
      base: `{getConfig("pipeline/api")}`
    },
    customGenerator: arg => customGenerator(arg, "getConfig('pipeline/api')")
  },
  logs: {
    output: 'src/services/logs/index.tsx',
    file: 'src/services/logs/swagger.json',
    transformer: 'scripts/swagger-transform.js',
    customImport: `import { getConfig, getUsingFetch, GetUsingFetchProps } from "../config";`,
    customProps: {
      base: `{getConfig("log-service")}`
    },
    customGenerator: arg => customGenerator(arg, "getConfig('log-service')")
  },
  platform: {
    output: 'src/services/platform/index.tsx',
    url: 'http://localhost:9005/api/swagger.json',
    transformer: 'scripts/swagger-transform.js',
    customImport: `import { getConfig, getUsingFetch, mutateUsingFetch, GetUsingFetchProps, MutateUsingFetchProps } from "../config";`,
    customProps: {
      base: `{getConfig("notifications/api")}`
    },
    customGenerator: arg => customGenerator(arg, "getConfig('notifications/api')")
  },
  rbac: {
    output: 'src/services/rbac/index.tsx',
    url: 'http://localhost:9006/api/swagger.json',
    transformer: 'scripts/swagger-transform.js',
    customImport: `import { getConfig, getUsingFetch, mutateUsingFetch, GetUsingFetchProps, MutateUsingFetchProps } from "../config";`,
    customProps: {
      base: `{getConfig("authz/api")}`
    },
    customGenerator: arg => customGenerator(arg, "getConfig('authz/api')")
  },
  ci: {
    output: 'src/services/ci/index.tsx',
    file: 'src/services/ci/swagger.json',
    transformer: 'scripts/swagger-transform.js',
    customImport: `import { getConfig, getUsingFetch, mutateUsingFetch, GetUsingFetchProps, MutateUsingFetchProps } from "../config";`,
    customProps: {
      base: `{getConfig("ci")}`
    },
    customGenerator: arg => customGenerator(arg, "getConfig('ci')")
  },
  'ti-service': {
    output: 'src/services/ti-service/index.tsx',
    file: 'src/services/ti-service/swagger.json',
    transformer: 'scripts/swagger-transform.js',
    customImport: `import { getConfig } from "../config";`,
    customProps: {
      base: `{getConfig("ti-service")}`
    }
  },
  cv: {
    output: 'src/services/cv/index.tsx',
    file: 'src/services/cv/swagger.json',
    transformer: 'scripts/swagger-transform.js',
    customImport: `import { getConfig, getUsingFetch, mutateUsingFetch, GetUsingFetchProps, MutateUsingFetchProps } from "../config";`,
    customProps: {
      base: `{getConfig("cv/api")}`
    },
    customGenerator: arg => customGenerator(arg, "getConfig('cv/api')")
  },
  cf: {
    output: 'src/services/cf/index.tsx',
    url: 'http://127.0.0.1:8085/docs/release/admin-v1.yaml',
    transformer: 'scripts/swagger-transform.js',
    customImport: `import { getConfig } from "../config";`,
    customProps: {
      base: `{getConfig("cf")}`
    }
  },
  lw: {
    output: 'src/services/lw/index.tsx',
    file: 'src/services/lw/swagger.json',
    transformer: 'scripts/swagger-transform.js',
    customImport: `import { getConfig } from "../config";`,
    customProps: {
      base: `{getConfig("lw/api")}`
    }
  }
}
