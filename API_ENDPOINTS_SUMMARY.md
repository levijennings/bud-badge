# Bud Badge API Endpoints Summary

## Complete Route Reference

### Organizations (5 routes)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/organizations` | Required | Any | Get user's organization |
| POST | `/api/organizations` | Required | Any | Create new organization |
| GET | `/api/organizations/[orgId]` | Required | Any member | Get org details + stats |
| PATCH | `/api/organizations/[orgId]` | Required | Owner | Update organization |
| GET | `/api/organizations/[orgId]/members` | Required | Any member | List members (paginated) |
| POST | `/api/organizations/[orgId]/members` | Required | Manager+ | Invite member |
| PATCH | `/api/organizations/[orgId]/members/[memberId]` | Required | Manager+ | Update member role |
| DELETE | `/api/organizations/[orgId]/members/[memberId]` | Required | Manager+ | Remove member |

### Training (6 routes)

| Method | Endpoint | Auth | Plan | Description |
|--------|----------|------|------|-------------|
| GET | `/api/training/modules` | Required | Plan-based | List modules (paginated, filterable) |
| GET | `/api/training/modules/[moduleId]` | Required | Plan-based | Get module with content + quiz |
| GET | `/api/training/progress` | Required | Any | Get user's progress |
| POST | `/api/training/progress` | Required | Any | Create/update progress |
| PATCH | `/api/training/progress` | Required | Any | Update progress |
| POST | `/api/training/quiz/[quizId]/attempt` | Required | Any | Submit quiz (auto-grades) |

### Certifications (1 route)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/certifications` | Required | Any (scope-based) | Get certs (user or org) |

### Compliance (2 routes)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/compliance?org_id=X` | Required | Any member | Get org compliance status |
| POST | `/api/compliance?org_id=X` | Required | Manager+ | Create compliance record |

### Billing (3 routes)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/billing` | Required | Get current subscription |
| POST | `/api/billing` | Required (owner) | Create checkout session |
| POST | `/api/billing/webhook` | Stripe sig | Handle Stripe events |

### Dashboard (1 route)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/dashboard/stats?org_id=X` | Required | Manager+ | Get dashboard statistics |

## Quick Start Examples

### Create Organization
```bash
curl -X POST http://localhost:3000/api/organizations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "name": "Green Leaf Dispensary",
    "slug": "green-leaf",
    "state": "CO",
    "city": "Denver",
    "plan": "starter"
  }'
```

### List Members
```bash
curl "http://localhost:3000/api/organizations/{orgId}/members?page=1&limit=10&search=john" \
  -H "Authorization: Bearer {token}"
```

### Submit Quiz
```bash
curl -X POST http://localhost:3000/api/training/quiz/{quizId}/attempt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "quiz_id": "{quizId}",
    "answers": [
      {"question_id": "q1", "selected_answer": 0},
      {"question_id": "q2", "selected_answer": 2}
    ],
    "time_taken_seconds": 600
  }'
```

### Get Dashboard Stats
```bash
curl "http://localhost:3000/api/dashboard/stats?org_id={orgId}" \
  -H "Authorization: Bearer {token}"
```

## Response Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Data retrieved or updated |
| 201 | Created | Resource created (orgs, members, progress) |
| 400 | Bad Request | Invalid input validation |
| 401 | Unauthorized | Missing/invalid authentication |
| 403 | Forbidden | Insufficient permissions/plan |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate slug, capacity exceeded, etc |
| 500 | Server Error | Unexpected server error |

## Common Query Parameters

### Pagination (all list endpoints)
- `page` (integer, 1-based, default: 1)
- `limit` (integer, max 100, default: 10)

### Filtering (modules list)
- `search` (string, searches title/description)
- `category` (enum: compliance, product_knowledge, customer_service, safety)
- `difficulty` (enum: beginner, intermediate, advanced)

## Validation Rules

### Organization
- name: 1-255 chars, required
- slug: lowercase alphanumeric + hyphens, 1-100 chars, unique
- state: 2-letter code, required
- city: 1-255 chars, required
- plan: starter | professional | enterprise

### Member Invite
- email: valid email format, user must exist
- role: owner | manager | budtender

### Training Progress
- module_id: valid UUID
- progress_pct: 0-100
- status: not_started | in_progress | completed

### Quiz Attempt
- quiz_id: valid UUID
- answers[].question_id: valid UUID
- answers[].selected_answer: valid integer (option index)
- time_taken_seconds: positive integer

### Compliance Record
- type: string, 1-255 chars
- status: compliant | warning | non_compliant
- details: string, non-empty

## Role Hierarchy

- **Owner**: Full control, manage billing, add/remove admins
- **Manager**: Manage employees, view reports, create compliance records
- **Budtender**: View training, take courses, view own progress

## Feature Access by Plan

| Feature | Starter | Professional | Enterprise |
|---------|---------|--------------|-----------|
| Max Employees | 10 | 50 | Unlimited |
| Base Modules | ✓ | ✓ | ✓ |
| Premium Modules | ✗ | ✓ | ✓ |
| Custom Training | ✗ | ✓ | ✓ |
| API Access | ✗ | ✓ | ✓ |
| Dedicated Support | ✗ | ✗ | ✓ |

## Error Response Format

```json
{
  "success": false,
  "error": "Descriptive error message",
  "code": "ERROR_CODE",
  "details": {
    "fieldName": ["Specific validation issue"]
  }
}
```

Common error codes:
- UNAUTHORIZED
- FORBIDDEN
- VALIDATION_ERROR
- NOT_FOUND
- CONFLICT
- DATABASE_ERROR
- PLAN_RESTRICTED
- INVALID_ACTION
- INSUFFICIENT_PERMISSIONS

## Webhook Events (Stripe)

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.deleted`

## Multi-Tenant Security

All routes enforce:
1. User must be authenticated
2. User must be member of specified organization
3. Cannot access other orgs' data
4. Role-based restrictions enforced server-side
5. Plan-based feature gates applied

## Performance Considerations

- All list endpoints support pagination (max 100 items)
- Module content loaded on-demand (not in list)
- Quiz attempt auto-saves and auto-grades
- Compliance status calculated from records
- Dashboard stats cached per request (not persisted)

## Future Enhancements

- Bulk import employees
- Advanced reporting/export
- Custom role definitions
- Scheduled compliance checks
- Learning path recommendations
- Integration with LMS systems
