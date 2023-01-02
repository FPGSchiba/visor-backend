# VISOR-Backend

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

Return: VISOR API Response, with body: `{ "activationToken": "{new-activation-token}"}`

Codes:
 + 400: Org already exists or body is missing
 + 401: Not Authorized
 + 500: Something unexpected happened
 + 200: OK - Org was created

### Activate Org

Route: `/activate-org`

Method: `POST`

body: `{ "token": "{org-activation-token}" }`

Headers: None

Return: VISOR API Response with a body like this: `{ "orgToken": "{org-token}", "userToken": "{user-token}" }` this body can then be used to form a VISOR-Token. (The User-Token here is generated from the `requester` used to register the new Org. This User is automatically the admin for the Org and has all rights on this Org.)

Codes:
 + 400: Org already active or body missing
 + 401: No such activation-token
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

body: `{ "name": "{org-name}", "onlyInactive": true }`
 * The `onlyInactive` setting is used to say if the Org Database should be deleted or not. If this is set to `true` only orgs, that are inactive can be deleted. If this property is not set, it will default to `true`.

Headers: `X-VISOR-API-Key: {admin-token}` (The admin token is only accessible to VISOR Administrators)

Return: VISOR API Response, if the call worked

Codes:
 + 400: Body missing
 + 401: Not Authorized
 + 200: OK - Org deleted

### Get activation Token

Route: `/api/activation-token?name={org-name}`

Method: `GET`

Headers: `X-VISOR-API-Key: {admin-token}` (The admin token is only accessible to VISOR Administrators)

Return: VISOR API Response, with a body holding the activation token

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
`<user-token>-<org-token>`

Here is how these Keys can access the different reports and how user Activity is tracked:
![The Overview of the Backend / Database architecture for VISOR.](/images/VISOR-Backend-Overview.png "VISOR Overview Diagram")

## Development Plans

### Tasks
| Task | Description | State | Owner |
|------|-------------|-------|-------|
| Define structures | Define all Data structures and migration details | Done | FPG Schiba |
| Plan API's | Need to plan all API paths and request and response details | Done | FPG Schiba |
| Plan Authentication | Describe and define the authentication details for the backend | Done | FPG Schiba |
| Implement Admin Authentication | Implement the defined authentication method as an Administrator of VISOR | Done | FPG Schiba |
| Implement Management | Define and implement all paths needed to manage VISOR as a whole. | Done | FPG Schiba |
| Implement Org Activation | Define and Implement how Orgs will be created with their activation token. | Done | FPG Schiba |
| Plan User Management for Orgs | Define the User Management within Orgs, with it the Authentication. | Open | FPG Schiba |
| Implement user Management | Roles, Path Auth and tokens. Implement them all, in order to have a clean API. | Open | FPG Schiba |
| Implement Org Authentication | Define and Implement a authentication for users with orgs | Open | FPG Schiba |
| Plan Reports | Define and plan search quarries for VISOR Reports | Open | FPG Schiba |
| Implement Reports | Implement the planned quarries and Paths and test it with the Overlay | Open | FPG Schiba |
| Changes | Define all paths to changes & reports in order to get a overview of what happens in VISOR | Open | FPG Schiba |
