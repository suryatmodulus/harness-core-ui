/*
 * Copyright 2020 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const { camel } = require("case");

module.exports = ({ componentName, verb, route, description, genericsTypes, paramsInPath, paramsTypes }, basePath) => {
    const propsType = type =>
        `${type}UsingFetchProps<${genericsTypes}>${paramsInPath.length ? ` & {${paramsTypes}}` : ""}`;

    if (verb === "get") {
        return `${description}export const ${camel(componentName)}Promise = (${
            paramsInPath.length ? `{${paramsInPath.join(", ")}, ...props}` : "props"
            }: ${propsType(
                "Get",
            )}, signal?: RequestInit["signal"]) => getUsingFetch<${genericsTypes}>(${basePath}, \`${route}\`, props, signal);\n\n`
    }
    else {
        return `${description}export const ${camel(componentName)}Promise = (${
            paramsInPath.length ? `{${paramsInPath.join(", ")}, ...props}` : "props"
            }: ${propsType(
                "Mutate",
            )}, signal?: RequestInit["signal"]) => mutateUsingFetch<${genericsTypes}>("${verb.toUpperCase()}", ${basePath}, \`${route}\`, props, signal);\n\n`;
    }
}
