#!/bin/bash
set +e

PR_MESSAGE=`echo "${ghprbPullTitle}" | grep -iE '(feat|fix|chore|refactor): \[(ART|BT|CCE|CCM|CDC|CDNG|CDP|CE|CI|CV|CVNG|DEL|DOC|DX|ER|FFM|OPS|PIP|PL|SEC|SWAT|GTM|ONP|PIE|LWG)-[0-9]+]:'`
echo "PR message is : ${PR_MESSAGE}"

if [ -z "$PR_MESSAGE" ]
then
    echo The PR title \"${ghprbPullTitle}\"
    echo "does not match the expectations"
    echo 'Make sure that your message starts with [ART|BT|CCE|CCM|CDC|CDNG|CDP|CE|CI|CV|CVNG|DEL|DOC|DX|ER|FFM|OPS|PIP|PL|SEC|SWAT|GTM|ONP|ART|PIE|LWG-<number>]: <description>'
    exit 1
fi