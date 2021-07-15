# ------ from Commit List => extract JIRA Tickets
# [(CCM|CD|CE|DOC|ER|HAR|LE|PL|SEC|SWAT|UI|DX)-[0-9]+]
VERSION=$(cat package.json | grep version | cut -d: -f2 | cut -d\" -f2 | cut -d. -f1,2).x
echo $VERSION
KEYS=`git log --pretty=oneline --abbrev-commit | awk "1;/Branching to release\//{exit}" | grep -o -iE '(CCM|CE|CD|CDC|CDP|CE|CI|CV|DOC|ER|HAR|LE|PL|SEC|SWAT|UI|DX|DEL|CDNG)-[0-9]+' | sort | uniq`
echo --- List of JIRA ---
echo $KEYS
echo --- End

if [ "${PURPOSE}" = "ui" ]
then
    FIELD_ID="customfield_10645"
elif [ "${PURPOSE}" = "ui-on-prem" ]
then
    FIELD_ID="customfield_10647"
else
   echo "Unknown purpose ${PURPOSE}"
   exit 1
fi
# => add a field to those tickets
for KEY in ${KEYS}
do
    echo Updating JIRA: $KEY
    curl \
       -X PUT \
       --data "{ \"fields\" : { \"${FIELD_ID}\" : \"${VERSION}00\" }}" \
       -H "Content-Type: application/json" \
       https://harness.atlassian.net/rest/api/2/issue/${KEY} \
       --user $JIRA_USERNAME:$JIRA_PASSWORD
done
