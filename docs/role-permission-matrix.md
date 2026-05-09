# Role Permission Matrix for Database Dashboard

## Scope
This matrix documents role-based access for Assignment 7 database sprint workflows.

## Modules and Roles

| Capability | Student | Faculty | Staff | Acadadmin |
|---|---|---|---|---|
| Access Database module | Yes (if module access enabled) | Yes (if module access enabled) | Yes (if module access enabled) | Yes |
| View Issues list | Yes | Yes | Yes | Yes |
| Create Issue | Yes | Yes | Yes | Yes |
| Edit own open Issue | Yes | Yes | Yes | Yes |
| Edit closed Issue | No | No | No | No |
| Support Issue (non-owner) | Yes | Yes | Yes | Yes |
| Support own Issue | No | No | No | No |
| Submit/Update own Feedback | Yes | Yes | Yes | Yes |
| View top feedback entries | Yes | Yes | Yes | Yes |
| Search users (q length >= 3) | Yes | Yes | Yes | Yes |

## Enforcement Points
- Backend issue support owner-block is enforced in globals API and legacy endpoint.
- Closed issue edit block is enforced in backend update handlers.
- Search minimum length is validated in both frontend and backend.
- Role and accessible module payload validation is enforced in frontend auth bootstrap.
