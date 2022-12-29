# VISOR-Backend

## Test
**Bold**

*Italic*

`/api/get`

1. ordered list

+ unodered list


> Block quote

## API
All details to the requests and responses for those requests.

### API Response

Is a message that always has 2 Properties:
 1. `code` that depends on the Path called on the API
 2. `message` that depends on the Path called on the API

And in Cases where you request Information, there is a 3rd Property:
 3. `data` this property holds data, that was requested

### Default

Route: `/`

Method: `GET`

Return: HTML with project name and Version.

Codes:
+ 200: OK - Everything is fine

### Create Org

Route: `/api/create-org`

Method: `POST`

Body: `{ "name": "{org-name}", "owner": "{org-owner-name}" }`

Headers: `X-VISOR-API-Key: {admin-token}` (The admin token is only accessible to VISOR Administrators)

Return: VISOR API Response, with body: `{ "creationToken": "{new-creation-token}"}`

Codes:
 + 400: Org already exists or body is missing
 + 401: Not Authorized
 + 500: Something unexpected happened
 + 200: OK - Org was created

### Activate Org

Route: `/activate-org`

Method: `POST`

body: `{ "token": "{org-creation-token}" }`

Headers: None

Return: VISOR API Response

Codes:
 + 400: Org already active or body missing
 + 401: No such creation-token
 + 200: OK - Org activated

### List Orgs

Route: `/api/orgs`

Method: `GET`

Headers: `X-VISOR-API-Key: {admin-token}` (The admin token is only accessible to VISOR Administrators)

Return: VISOR API Response with a list of org-names & org-ids

Codes:
 + 400: Body missing
 + 401: Not Authorized
 + 200: OK - Information returned

### Delete Org (setting with DB or only if not activated)

Route: `/api/delete-org`

Method: `POST`

body: `{ "name": "{org-name}", "only-inactive": true }`
 * The `only-inactive` setting is used to say if the Org Database should be deleted or not. If this is set to `true` only orgs, that are inactive can be deleted. If this property is not set, it will default to `true`.

Headers: `X-VISOR-API-Key: {admin-token}` (The admin token is only accessible to VISOR Administrators)

Return: VISOR API Response, if the call worked

Codes:
 + 400: Body missing
 + 401: Not Authorized
 + 200: OK - Org deleted

### Get creation Token

Route: `/api/creation-token?name={org-name}`

Method: `GET`

Headers: `X-VISOR-API-Key: {admin-token}` (The admin token is only accessible to VISOR Administrators)

Return: VISOR API Response, with a body holding the creation token

Codes:
 + 400: Body missing
 + 401: Not Authorized
 + 200: OK - Information returned

### Get VISORs

TBD

### Created VISOR

TBD

### Update VISOR

TBD

### Create User

TBD

### List Users

TBD

### Get specific user

TBD

### Edit user

TBD

### Reports & Changes

TBD

## Database

TBD: Define Database structures

## Authentication
For every path you need the following header:
`X-VISOR-API-Key`
with a VISOR-API-Key. This API Key is made up of the following parts:
`<user-key>-<org-key>`

Here is how these Keys can access the different reports and how user Activity is tracked:
![The Overview of the Backend / Database architecture for VISOR.](/images/VISOR-Backend-Overview.png "VISOR Overview Diagram")

## Development Plans

### Tasks
| Task | Description | State | Owner |
|------|-------------|-------|-------|
| Define structures | Define all Data structures and migration details | Done | FPG Schiba |
| Plan API's | Need to plan all API paths and request and response details | Done | FPG Schiba |
| Plan Authentication | Describe and define the authentication details for the backend | Done | FPG Schiba |
| Implement Authentication | Implement the defined authentication method and test it with the Overlay | Open | FPG Schiba |
| Changes | Define all paths to changes & reports in order to get a overview of what happens in VISOR | Open | FPG Schiba |
