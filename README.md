# VISOR-Backend
## VISOR Format
```
{
    "reportName": "somename",
    "approved": false,
    "published": "false",
    "visorLocation": {
        "system": "some-system",
        "stellarObject": "some-planet",
        "planetLevelObject": "some-moon", // Optional
        "poiType": "some-poi-type",
        "jurisdiction": "UEE"
    },
    "reportMeta": {
        "rsiHandle": "FPG Schiba",
        "visorCode": 5,
        "visorCodeJustification": "something", //Optional
        "scVersion": "3.17.4",
        "date": "some-date", // Format: YYYY-DD-MM HH:MM:SS
        "followupTrailblazers": false,
        "followupDiscovery": false,
        "followupJustification": "something" //Optional
    },
    "locationDetails": {
        "classification": "something",
        "surroundings": "something",
        "trade": "", //optional
        "services": "", //optional
        "hostiles": "", //optional
        "defenses": "", //optional
        "occupants": "", //optional
        "lethalForce": "", //optional
        "remainingOccupants": "", //optional
        "zones": {
            "noFly": false,
            "armistice": false,
            "other": "" //optional
        }
    },
    "navigation": {
        "om1": 12.12,
        "om2": 123.12,
        "om3": 123.12,
        "om4": 123.12,
        "om5": 123.65,
        "om6": 13.123,
        "straightLineOms": [ // Optional
            {
                "om": "om1|om2|om3|om4|om5|om6",
                "distance": 123.123
            }
        ],
        "refuelingGroundPoi": { // Optional
            "name": "somename",
            "distance": 123.12,
            "bearing": 123.12 //optional
        },
        "spaceStation": { // Optional
            "name": "somename",
            "distance": 1278.12
        }
    },
    "fuelConsumptions": [ // Optional
        {
            "ship": "someship",
            "drive": "somedrive",
            "fuelConsumption": 1234.123,
            "pointA": {
                "name": "somename",
                "distance": 1234.12
            },
            "pointB": {
                "name": "somename",
                "distance": 123.12
            }
        }
    ],
    "virs": { // Optional
        "temperatureMeasures": [ // optional
            12.23,
            72.5
        ],
        "breathable": false,
        "externalPressure": 1234.1, // optional
        "composition": "somecomp", // optional
        "pads": { // optional
            "ground": 12,
            "ship": 12
        },
        "surfaceElevation": 1236, //optional
        "radiation": 1234, //optional
        "gravity": 123.123, //optional
        "consoles": {
            "trading": false,
            "mining": false,
            "finePayment": false,
            "security": false,
            "weaponSales": {
                "personal": false,
                "ship": false
            },
            "shipComponents": false,
            "shipRental": false,
            "landing": false,
            "habitation": false,
            "fuel": {
                "hydrogen": false,
                "quantanium": false
            },
            "repair": false,
            "rearm": false
        }
    },
    "keywords": [ // Optional
        "someWord"
    ]
}
```
## API
All details to the requests and responses for those requests.

### API Resopnse

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

### Activate Org

Route: `/activate-org`

Method: `POST`

body: `{ "token": "{org-activation-token}" }`

Headers: None

Return: VISOR API Response with data like this: `{ "orgToken": "{org-token}", "userToken": "{user-token}" }` this body can then be used to form a VISOR-Token. (The User-Token here is generated from the `requester` used to register the new Org. This User is automatically the admin for the Org and has all rights on this Org.)

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

Return: VISOR API Response, with data holding the activation token

Codes:
 + 400: Body missing
 + 401: Not Authorized
 + 500: Something unexpected happened
 + 200: OK - Information returned

### Get current User

Route: `/user`

Method: `GET`

Headers: 
* `X-VISOR-User-Key: {VISOR-user-key}`
* `X-VISOR-Org-Key: {VISOR-org-key}` 

Return: VISOR API Response, with data holding the user info: `{"handle": "{user-handle}", "role": "{user-role}", "orgName": "{org-name}"}`

Codes:
 + 401: Not Authorized
 + 500: Something unexpected happened
 + 200: OK - Information returned

### Create User

Route: `/users/create`

Method: `POST`

body: `{ "handle": "{user-handle}", "role": "{user-role}" }`
 * The role can be 3 things: `Admin`, `Editor` and `Contributor`. Those 3 roles have all different Rights, please refer to the Rights section in this Document.

Headers: 
* `X-VISOR-User-Key: {VISOR-user-key}` (Only Users with the role: `Admin` will have access)
* `X-VISOR-Org-Key: {VISOR-org-key}` 

Return: VISOR API Response, with data holding the user key: `{"userKey": "{new-user-key}"}`

Codes:
 + 400: Body missing
 + 401: Not Authorized
 + 500: Something unexpected happened
 + 200: OK - Information returned

### List Users

Route: `/users/list?length={number}&from={number}&to={number}`

Params:
 * (Optional) `length`: A number which defines the maximal length of the return array
 * (Optional) `from`: A number to say from which user on will be returned
 * (Optional) `to`: A number to say to which user in the array will be returned NOTE: `to` and `from` need to be together

Method: `GET`

Headers: 
* `X-VISOR-User-Key: {VISOR-user-key}` (Only Users with the role: `Admin` will have access)
* `X-VISOR-Org-Key: {VISOR-org-key}` 

Return: VISOR API Response, with data holding the list of users (`{ "handle": "{user-handle}", "role": "{user-role}", "token": "{user-key}" }`) and the information how many users there are: `count`.

Codes:
 + 401: Not Authorized
 + 500: Something unexpected happened
 + 200: OK - Information returned

### Get specific user

Route: `/users/get?handle={handle}`

Method: `GET`

Headers: 
* `X-VISOR-User-Key: {VISOR-user-key}` (Only Users with the role: `Admin` will have access)
* `X-VISOR-Org-Key: {VISOR-org-key}` 

Return: VISOR API Response, with data holding the user information

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

Headers: 
* `X-VISOR-User-Key: {VISOR-user-key}` (Only Users with the role: `Admin` will have access)
* `X-VISOR-Org-Key: {VISOR-org-key}` 

Return: VISOR API Response

Codes:
 + 400: Body missing
 + 401: Not Authorized
 + 500: Something unexpected happened
 + 200: OK - Information returned

### Delete User

Route: `/users/delete`

Method: `POST`

body: `{ "token": "{user-key}", "reason": "{some-reason}" }`
 * reason here is optional, but it would be nice for admins to know why a user was deleted.

Headers: 
* `X-VISOR-User-Key: {VISOR-user-key}` (Only Users with the role: `Admin` will have access)
* `X-VISOR-Org-Key: {VISOR-org-key}` 

Return: VISOR API Response

Codes:
 + 400: Parameter missing
 + 401: Not Authorized
 + 404: User not found
 + 500: Something unexpected happened
 + 200: OK - Information returned

### Get VISORs

Route: `/visor/list?name={report-name}&location={location-filter}&meta={meta-filter}&approved={boolean}&published={boolean}&keyword={keyword}&length={length}&from={from}&to={to}`
* Note: All params here are optional (Those within the location filter as well), please be gentle with filters atm.
* Note 2: `from` and `to` need to be together and `length` can be separate, but if `from` and `to` are given, there needs to be a `length`

location-filter:
```
{
    "system": "{system-name}",
    "stellarObject": "{stellar-object-name}",
    "planetLevelObject": "{planet-level-object-name}",
    "poiType": "{poi-type}",
    "jurisdiction": "{jurisdiction}"
}
```
* names: The corresponding Name for a object ot a system. Does not have to be in the Database.
* `poiType`: Free Text of a poiType
* `jurisdiction`: Free Text of a jurisdiction

meta-filter: 
```
{
    "followupTrailblazers": "{boolean}", // Important: Do " symbols here.
    "followupDiscovery": "{boolean}", // Important: Do " symbols here.
    "visorCode": "{visor-code}",
    "scVersion": "{sc-version}",
    "rsiHandle": "{rsi-handle}"
}
```
* Followups are booleans, whether the VISORs should have followups checked or unchecked.
* `visorCode` is a number, which specifies, which VISOR Code the VISOR uses
* `scVersion` is a string which filters VISORs with this Version
* `rsiHandle` is a string which filters the RSI Handle of a Person, that created or updated this report.

Method: `GET`

Headers: 
* `X-VISOR-User-Key: {VISOR-user-key}`
* `X-VISOR-Org-Key: {VISOR-org-key}` 

Return: VISOR API Response, with data:
```
{
    "count": {number},
    "reports": [
        "id": "{visor-id}",
        "reportName": "{visor-name}",
        "published": {boolean}
        "approved": {boolean},
        "visorLocation": {
            "system": "{system-name}",
            "stellarObject": "{stellar-object-name}",
            "planetLevelObject": "{planet-level-object-name}", // Optional
            "poiType": "{poi-type}",
            "jurisdiction": "{jurisdiction}"
        },
        "reportMeta": {
            "rsiHandle": "{rsi-handle}",
            "visorCode": "{visor-code}",
            "visorCodeJustification": "{justification}", // Optional
            "scVersion": "{version}",
            "date": "{date}",
            "followupTrailblazers": {boolean},
            "followupDiscovery": {boolean},
            "followupJustification": "{justification}" // Optional
        },
        keywords: [ // Optional
            "someWord"
        ]
    ]
}
```

Codes:
 + 401: Not Authorized
 + 500: Something unexpected happened
 + 200: OK - Information returned

### Get specific VISOR

Route: `/visor/get?id={visor-id}`

TODO: Define return field parameters

Method: `GET`

Headers: 
* `X-VISOR-User-Key: {VISOR-user-key}`
* `X-VISOR-Org-Key: {VISOR-org-key}` 

Return: VISOR API Response, with data: look at the VISOR template

Codes:
 + 401: Not Authorized
 + 404: VISOR not found
 + 500: Something unexpected happened
 + 200: OK - Information returned

### Create VISOR

Route: `/visor/create`

Method: `POST`

Body: Look at a default VISOR report

Headers: 
* `X-VISOR-User-Key: {VISOR-user-key}`
* `X-VISOR-Org-Key: {VISOR-org-key}` 

Return: VISOR API Response

Codes:
 + 400: Parameter missing
 + 401: Not Authorized
 + 500: Something unexpected happened
 + 200: OK - Information returned

### Update VISOR

Route: `/visor/update?id={visor-id}`
* Note Overwrites the VISOR with the body provided

Method: `POST`

body: Look at a default VISOR report

Headers: 
* `X-VISOR-User-Key: {VISOR-user-key}`
* `X-VISOR-Org-Key: {VISOR-org-key}` 

Return: VISOR API Response, with data: `{"id": "{created-visor-id}"}`

Codes:
 + 400: Parameter missing
 + 401: Not Authorized
 + 404: VISOR not found
 + 500: Something unexpected happened
 + 200: OK - Information returned

### Upload VISOR Image

Route: `/visor/image?id={visor-id}`

Method: `POST`

Body: form with a image file.

Headers: 
* `X-VISOR-User-Key: {VISOR-user-key}`
* `X-VISOR-Org-Key: {VISOR-org-key}` 

Return: VISOR API Response with data: `{ "image": { "name": "{image-name}", "description": "{image-description}", "url": "{image-link}" } }`

Codes:
 + 400: Parameter missing
 + 401: Not Authorized
 + 404: VISOR not found
 + 500: Something unexpected happened
 + 200: OK - Information returned

### Get array of Image Links for VISOR
Route: `/visor/images?id={visor-id}`

Method: `GET`

Headers: 
* `X-VISOR-User-Key: {VISOR-user-key}`
* `X-VISOR-Org-Key: {VISOR-org-key}` 

Return: VISOR API Response with data: `{ "images": [ {"url": "{image-link}" "description": "{image-description}"}, "name": "{image-name}" ] }`

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

body: `{ "id": "{visor-id}", "approverHandle": "{approver-handle}", "approveReason". "{some-reason}" }`
 * If no `approverHandle` is given, the user handle from the request auth is used.
 * Note: `approveReason` is only needed for the changes functionality.

Headers: 
* `X-VISOR-User-Key: {VISOR-user-key}`
* `X-VISOR-Org-Key: {VISOR-org-key}` 

Return: VISOR API Response

Codes:
 + 400: Parameter missing
 + 401: Not Authorized
 + 404: VISOR not found
 + 500: Something unexpected happened
 + 200: OK - Information returned

### Delete VISOR

Route: `/visor/delete`

Method: `POST`

body: `{ "id": "{visor-id}", "deletionReason": "{reason}" }`
 * The reason here is used to safe the reason to changes in order to have clarity why reports can't be found

Headers: 
* `X-VISOR-User-Key: {VISOR-user-key}`
* `X-VISOR-Org-Key: {VISOR-org-key}` 

Return: VISOR API Response

Codes:
 + 400: Parameter missing
 + 401: Not Authorized
 + 404: VISOR not found
 + 500: Something unexpected happened
 + 200: OK - Information returned

### Get all Solar Systems

Route: `/data/get-systems`

Method: `GET`

Headers: 
* `X-VISOR-User-Key: {VISOR-user-key}`
* `X-VISOR-Org-Key: {VISOR-org-key}` 

Return: VISOR API Response, with a body holding a list of solar system information

Codes:
 + 401: Not Authorized
 + 500: Something unexpected happened
 + 200: OK - Information returned


### Get all Objects for a solar System

Route: `/data/get-system?id={system-id}`

Method: `GET`

Headers: 
* `X-VISOR-User-Key: {VISOR-user-key}`
* `X-VISOR-Org-Key: {VISOR-org-key}` 

Return: VISOR API Response, with a body holding the information of a complete solar system

Codes:
 + 401: Not Authorized
 + 404: System not found
 + 500: Something unexpected happened
 + 200: OK - Information returned

### Add new solar system

Route: `/data-api/create-system`

Method: `POST`

Body:
```
{
    "name": "{system-name}",
    "stellarObjects": [
        {
            "name": "{stellar-object-name}",
            "type": "{stellar-object-type}",
            "planetLevelObjects": [ // This is optional (not every stellar Objects will have children)
                {
                    "name": "{planet-level-object}",
                    "type": "{planet-level-object}"
                }
            ]
        }
    ]
}
```

Headers: `X-VISOR-API-Key: {admin-token}` (The admin token is only accessible to VISOR Administrators)

Return: VISOR API Response

Codes:
 + 401: Not Authorized
 + 500: Something unexpected happened
 + 200: OK - Information returned

### Add new stellarObject to solar system

Route: `/data-api/add-stellar-object?id={system-id}`
 * meaning of this id is the parent System ID

Method: `POST`

Body:
```
{
    "name": "{stellar-object-name}",
    "type": "{stellar-object-type}",
    "planetLevelObjects": [ // This is optional (not every stellar Objects will have children)
        {
            "name": "{planet-level-object}",
            "type": "{planet-level-object}"
        }
    ]
}
```

Headers: `X-VISOR-API-Key: {admin-token}` (The admin token is only accessible to VISOR Administrators)

Return: VISOR API Response

Codes:
 + 401: Not Authorized
 + 404: System not found
 + 500: Something unexpected happened
 + 200: OK - Information returned

### Add new planetLevelObject to stellarObject

Route: `/data-api/add-planet-object?id={stellar-object-id}`
 * meaning of this id is the parent stellarObject ID

Method: `POST`

Body:
```
{
    "name": "{planet-level-object-name}",
    "type": "{planet-level-object-type}",
}
```

Headers: `X-VISOR-API-Key: {admin-token}` (The admin token is only accessible to VISOR Administrators)

Return: VISOR API Response

Codes:
 + 401: Not Authorized
 + 404: Stellar Object not found
 + 500: Something unexpected happened
 + 200: OK - Information returned

### Delete Solar System

Route: `/data-api/delete-system`

Method: `POST`

Body:
```
{
    "id": "{system-id}"
}
```

Headers: `X-VISOR-API-Key: {admin-token}` (The admin token is only accessible to VISOR Administrators)

Return: VISOR API Response

Codes:
 + 401: Not Authorized
 + 404: System not found
 + 500: Something unexpected happened
 + 200: OK - Information returned

### Delete StellarObject

Route: `/data-api/delete-stellar-object`

Method: `POST`

Body:
```
{
    "stellarID": "{stellar-object-id}",
    "systemID": "{system-id}"
}
```
 * Note here: `{system-id}` must be the parent System of this stellar Object

Headers: `X-VISOR-API-Key: {admin-token}` (The admin token is only accessible to VISOR Administrators)

Return: VISOR API Response

Codes:
 + 401: Not Authorized
 + 404: Stellar Object not found
 + 500: Something unexpected happened
 + 200: OK - Information returned

### Delete planet Level object

Route: `/data-api/delete-planet-object`

Method: `POST`

Body:
```
{
    "planetID": "{planet-object-id}",
    "stellarID": "{stellar-object-id}"
}
```
 * Note here: `{stellar-object-id}` has to be the Parent Stellar Object

Headers: `X-VISOR-API-Key: {admin-token}` (The admin token is only accessible to VISOR Administrators)

Return: VISOR API Response

Codes:
 + 401: Not Authorized
 + 404: Planet Level Object not found
 + 500: Something unexpected happened
 + 200: OK - Information returned


### Reports & Changes

TBD


## Authentication

### Organization
For Org-Logins there are 2 Authentication Headers needed:

* `X-VISOR-User-Key`: The Unique User Key of the user, that is making a request to the VISOR API.
* `X-VISOR-Org-Key`: The Unique Org Key for the Organization the user is from.

 > If those keys get lost, please contact a VISOR Administrator or recreate the User in question.

### Admin
For every admin path you need the following header:
`X-VISOR-API-Key` with a VISOR-API-Key. 

 > This VISOR API key is accessible only for VISOR Administrators.

Here is how these Keys can access the different reports and how user Activity is tracked:
![The Overview of the Backend / Database architecture for VISOR.](/images/VISOR-Backend-Overview.png "VISOR Overview Diagram")

## Rights
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
| `uploadImage` | `/visor/image`| `POST` | Yes | Yes | Yes |
| `getImages` | `/visor/images` | `GET` | Yes | Yes | Yes |
| `listSystems` | `/data/get-systems` | `GET` | Yes | Yes | Yes |
| `getSystem` | `/data/get-system` | `GET` | Yes | Yes | Yes |


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
| Plan User Management for Orgs | Define the User Management within Orgs, with it the Authentication. | Done | FPG Schiba |
| Implement user Management | Roles, Path Auth and tokens. Implement them all, in order to have a clean API. | Done | FPG Schiba |
| Implement Org Authentication | Define and Implement a authentication for users with orgs | Done | FPG Schiba |
| Add user Functionality to Overlay | Implement Usermanagement and User authentication to VISOR Overlay | Done | FPG Schiba |
| Implement Static data | Implement data fetching and modifying through the API | Done | FPG Schiba |
| Plan Reports | Define and plan search quarries for VISOR Reports | Done | FPG Schiba |
| Implement Reports | Implement the planned quarries and Paths  | Done | FPG Schiba |
| Implement Images | Implement uploading and saving for Images for Reports | Done | FPG Schiba |
| AWS Pipeline | Create a CI/CD Pipeline within AWS to auto deploy and build new VISOR Versions | Done | FPG Schiba |
| AWS Environment | Create a Environment to run the visor-backend on containing: (DynamoDB, Secrets Manager, S3, Load Balancer, ECR and ECS) | Done | FPG Schiba |
| Overlay | Implement all the features that are now only in the backend into the frontend, until everything works. | In Progress | FPG Schiba |
| Overlay Updates | Implement a CI/CD Pipeline on the visor-overlay to automatically release new updates onto a server which is responsible for updating all clients. | Open | FPG Schiba |
| Overlay stress test | Once all overlay features (With updates) are working, release a alpha version of the overlay and stress test | Open | FPG Schiba |
| Overlay Rollout | Prepare for rollout (autoscaling, alerts & monitoring) rollout clients to all people that want one | Open | FPG Schiba |
| Overlay tool time | Make a tool time with schiba and give a nice overview and tutorial regarding VISOR | Open | FPG Schiba |
| vngd.net Website | Talk with Esdin about a possible integration into the vngd.net website | Open | FPG Schiba & Esdin |
| vngd.net Domain | Make a CNAME record for visor if its ok with Esdin and Space | Open | FPG Schiba |
| Changes | Define all paths to changes & reports in order to get a overview of what happens in VISOR | Open | FPG Schiba |
| VerseGuide | Implement external data source for public POIs and Systems & stellarObjects. | Open and Blocked | FPG Schiba |
