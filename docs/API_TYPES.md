# API types

Types follow the current Django REST Framework serializers, including snake_case keys,
nullable fields and numeric membership IDs. UUIDs, dates, timestamps and decimal amounts
stay strings in JSON. A date alias documents its format; it does not validate input.

Import Kanban types from `@/modules/module/types`; for example, use `Task` for responses,
`CreateTaskRequest` for creation and `UpdateTaskRequest` for PATCH. Writes use relation
keys such as `status` and `assignee`; responses expose `status_id` and `assignee_id`.
`ITasks` remains available from `@/shared/types` for compatibility.

Other API domains export their types through their module barrels. Existing auth,
payments, notifications and AI types remain in their respective `types` barrels.
`PaginatedResponse<T>` describes DRF paginated endpoints; endpoints returning plain
arrays should use `T[]`.

Database-only models without public serializers (custom fields, saved views, dependencies
and calendar credentials) are deliberately not presented as API responses.
User preferences now use `GET/PATCH /users/me/settings/`; see
[`PROFILE_INTEGRATION.md`](PROFILE_INTEGRATION.md) for the coordinated backend contract.
Never expose password hashes, verification tokens or provider credentials in client types.
