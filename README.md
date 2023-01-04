# VISOR-Backend

## VISOR Format

```
{
    "name": "Test"
}
```
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
 + 500: Something unexpected happened
 + 200: OK - Org activated

### List Orgs

Route: `/api/orgs`

Method: `GET`

Headers: `X-VISOR-API-Key: {admin-token}` (The admin token is only accessible to VISOR Administrators)

Return: VISOR API Response with a list of org-names & org-ids

Codes:
 + 400: Body missing
 + 401: Not Authorized
 + 500: Something unexpected happened
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
 + 500: Something unexpected happened
 + 200: OK - Org deleted

### Get activation Token

Route: `/api/activation-token?name={org-name}`

Method: `GET`

Headers: `X-VISOR-API-Key: {admin-token}` (The admin token is only accessible to VISOR Administrators)

Return: VISOR API Response, with a body holding the activation token

Codes:
 + 400: Body missing
 + 401: Not Authorized
 + 500: Something unexpected happened
 + 200: OK - Information returned

### Create User

Route: `/users/create`

Method: `POST`

body: `{ "handle": "{user-handle}", "role": "{user-role}" }`
 * The role can be 3 things: `Admin`, `Editor` and `Contributor`. Those 3 roles have all different Rights, please refer to the Rights section in this Document.

Headers: `X-VISOR-API-Key: {VISOR-key}` (Only Users with the role: `Admin` will have access)

Return: VISOR API Response, with a body holding the user key

Codes:
 + 400: Body missing
 + 401: Not Authorized
 + 500: Something unexpected happened
 + 200: OK - Information returned

### List Users

Route: `/users/list`

Method: `GET`

Headers: `X-VISOR-API-Key: {VISOR-key}` (Only Users with the role: `Admin` will have access)

Return: VISOR API Response, with a body holding the list of users (`{ "handle": "{user-handle}", "role": "{user-role}", "token": "{user-key}" }`)

Codes:
 + 401: Not Authorized
 + 500: Something unexpected happened
 + 200: OK - Information returned

### Get specific user

Route: `/users/get?handle={handle}`

Method: `GET`

Headers: `X-VISOR-API-Key: {VISOR-key}` (Only Users with the role: `Admin` will have access)

Return: VISOR API Response, with a body holding the user information

Codes:
 + 401: Not Authorized
 + 404: User not found
 + 500: Something unexpected happened
 + 200: OK - Information returned

### Edit user

Route: `/users/update`

Method: `POST`

body: `{ "handle": "{user-handle}", "update": { "role": "{user-role}" }}`
 * The Edit method can only be used to change the Users role. The Handle cannot be changed and the `user-key` depends on the Handle. Please delete and recreate users if handle changes.

Headers: `X-VISOR-API-Key: {VISOR-key}` (Only Users with the role: `Admin` will have access)

Return: VISOR API Response

Codes:
 + 400: Body missing
 + 401: Not Authorized
 + 500: Something unexpected happened
 + 200: OK - Information returned

### Delete User

Route: `/users/delete`

Method: `POST`

body: `{ "token": "{user-key}", "reason": "{some-reason}" }`
 * reason here is optional, but it would be nice for admins to know why a user was deleted.

Headers: `X-VISOR-API-Key: {VISOR-key}` (Only Users with the role: `Admin` will have access)

Return: VISOR API Response

Codes:
 + 400: Parameter missing
 + 401: Not Authorized
 + 404: User not found
 + 500: Something unexpected happened
 + 200: OK - Information returned

### Get VISORs

Route: `/visor/list`

TODO: Define search parameters

Method: `GET`

Headers: `X-VISOR-API-Key: {VISOR-key}`

Return: VISOR API Response, with a body: TBD (small VISOR list)

Codes:
 + 401: Not Authorized
 + 500: Something unexpected happened
 + 200: OK - Information returned

### Get specific VISOR

Route: `/visor/get?name={visor-name}`

TODO: Define return field parameters

Method: `GET`

Headers: `X-VISOR-API-Key: {VISOR-key}`

Return: VISOR API Response, with a body: look at the VISOR template

Codes:
 + 401: Not Authorized
 + 404: VISOR not found
 + 500: Something unexpected happened
 + 200: OK - Information returned

### Create VISOR

Route: `/visor/create`

Method: `POST`

Body: Look at a default VISOR report

Headers: `X-VISOR-API-Key: {VISOR-key}`

Return: VISOR API Response

Codes:
 + 400: Parameter missing
 + 401: Not Authorized
 + 500: Something unexpected happened
 + 200: OK - Information returned

### Update VISOR

Route: `/visor/update?name={visor-name}`

Method: `POST`

body: Look at a default VISOR report

Headers: `X-VISOR-API-Key: {VISOR-key}`

Return: VISOR API Response

Codes:
 + 400: Parameter missing
 + 401: Not Authorized
 + 404: VISOR not found
 + 500: Something unexpected happened
 + 200: OK - Information returned


### Approve VISOR

Info: Approving a VISOR will lock a report and you cannot edit this version. If you make a change to this report again, the approved sign will disappear.

Route: `/visor/approve`

Method: `POST`

body: `{ "name": "{visor-name}", "approverHandle": "{approver-handle}" }`
 * If no `approverHandle` is given, the user handle from the request auth is used.

Headers: `X-VISOR-API-Key: {VISOR-key}`

Return: VISOR API Response

Codes:
 + 400: Parameter missing
 + 401: Not Authorized
 + 404: VISOR not found
 + 500: Something unexpected happened
 + 200: OK - Information returned

### Delete VISOR

Route: `/visor/delete`

Method: `POST`

body: `{ "name": "{visor-name}", "deletionReason": "{reason}" }`
 * The reason here is used to safe the reason to changes in order to have clarity why reports can't be found

Headers: `X-VISOR-API-Key: {VISOR-key}`

Return: VISOR API Response

Codes:
 + 400: Parameter missing
 + 401: Not Authorized
 + 404: VISOR not found
 + 500: Something unexpected happened
 + 200: OK - Information returned

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

### Rights
| Permission Name | API Path | Method | Admin Right | Contributor Right | Editor Right |
| --------------- | -------- | ------ | ----------- | ------------ | ----------------- |
| `createUser` | `/users/create` | `POST` | Yes | No | No |
| `listUsers` | `/users/list` | `GET` | Yes | No | No |
| `getUser` | `/users/get` | `GET` | Yes | No | No |
| `editUser` | `/users/update` | `POST` | Yes | No | No |
| `deleteUser` | `/users/delete` | `POST` | Yes | No | No |
| `getVISORs` | `/visor/list` | `GET` | Yes | Yes | Yes |
| `createVISOR` | `/visor/create` | `POST` | Yes | Yes | Yes |
| `getVISOR` | `/visor/get` | `GET` | Yes | Yes | Yes |
| `updateVISOR` | `/visor/update` | `POST` | Yes | Yes | Yes |
| `approveVISOR` | `/visor/approve` | `POST` | Yes | Yes | No |
| `deleteVISOR` | `/visor/delete` | `POST` | Yes | Yes | No |



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
| Plan User Management for Orgs | Define the User Management within Orgs, with it the Authentication. | In Progress | FPG Schiba |
| Implement user Management | Roles, Path Auth and tokens. Implement them all, in order to have a clean API. | In Progress | FPG Schiba |
| Implement Org Authentication | Define and Implement a authentication for users with orgs | Open | FPG Schiba |
| Plan Reports | Define and plan search quarries for VISOR Reports | Open | FPG Schiba |
| Implement Reports | Implement the planned quarries and Paths and test it with the Overlay | Open | FPG Schiba |
| Changes | Define all paths to changes & reports in order to get a overview of what happens in VISOR | Open | FPG Schiba |
