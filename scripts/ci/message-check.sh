#!/bin/bash
# Copyright 2022 Harness Inc. All rights reserved.
# Use of this source code is governed by the PolyForm Shield 1.0.0 license
# that can be found in the licenses directory at the root of this repository, also available at
# https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.

set +e

PR_MESSAGE=`echo "${ghprbPullTitle}" | grep -iE '(feat|fix|chore|refactor): \[(ART|BT|CCE|CCM|CDB|CDC|CDNG|CDP|CE|CI|COMP|CV|CVNG|DEL|DOC|DX|ER|FFM|OPA|OPS|PIP|PL|SEC|SWAT|GTM|ONP|PIE|LWG|GIT)-[0-9]+]:'`
echo "PR message is : ${PR_MESSAGE}"

if [ -z "$PR_MESSAGE" ]
then
    echo The PR title \"${ghprbPullTitle}\"
    echo "does not match the expectations"
    echo 'Make sure that your message starts with [ART|BT|CCE|CCM|CDB|CDC|CDNG|CDP|CE|CI|COMP|CV|CVNG|DEL|DOC|DX|ER|FFM|OPS|PIP|PL|SEC|SWAT|GTM|ONP|OPA|ART|PIE|LWG|GIT-<number>]: <description>'
    exit 1
fi
