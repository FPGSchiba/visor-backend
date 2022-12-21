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

### Default

Route: `/`
Method: `GET`
Return: HTML with project name and Version.
Codes:
+ 200: OK - Everything is fine

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
| Plan API's | Need to plan all API paths and request and response details | In Progress | FPG Schiba |
| Plan Authentication | Describe and define the authentication details for the backend | In Progress | FPG Schiba |
| Implement Authentication | Implement the defined authentication method and test it with the Overlay | Open | FPG Schiba |
| Path2 |  | Open | FPG Schiba |


