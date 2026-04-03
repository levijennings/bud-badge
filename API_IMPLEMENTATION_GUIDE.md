# Bud Badge API Implementation Guide

## Overview

Complete production-ready API routes for the Bud Badge multi-tenant SaaS platform built with Next.js 14 App Router, Supabase, and Stripe.

## Files Created

### Core Libraries

#### `src/lib/validations.ts`
Zod schemas for request validation:
- **Organization schemas**: `orgCreateSchema`, `orgUpdateSchema`
- **Member schemas**: `memberInviteSchema`, `memberUpdateSchema`
- **Profile schema**: `profileUpdateSchema`
- **Training schemas**: `trainingProgressSchema`, `quizAttemptSchema`
- **Compliance schema**: `complianceRecordSchema`
- **Billing schema**: `billingCheckoutSchema`
- **Pagination schema**: `paginationSchema`

All schemas include type exports for TypeScript.

#### `src/lib/api-helpers.ts`
Shared utilities for all API routes:
- `createSuccessResponse(data, message?, status?)` - Format successful responses
- `createErrorResponse(error, code, status?, details?)` - Format error responses
- `requireAuth(request)` - Authenticate user from request
- `getUserProfile(userId)` - Get user profile data
- `getUserOrganization(userId)` - Get user's org with role
- `requireOrgMember(request, orgId)` - Require organization membership
- `requireOrgRole(request, orgId, requiredRoles)` - Check specific roles (owner/manager)
- `parsePagination(searchParams)` - Parse and validate pagination
- `calculateModuleScore(answers, correctAnswers)` - Auto-grade quizzes

Response format:
```typescript
{
  success: true,
  data: T,
  message?: string
}
// or
{
  success: false,
  error: string,
  code: string,
  details?: any
}
```

### API Routes

#### Organizations Management

##### `POST /api/organizations`
Create new organization.

**Request:**
```json
{
  "name": "Green Leaf Dispensary",
  "slug": "green-leaf",
  "state": "CO",
  "city": "Denver",
  "plan": "starter",
  "license_number": "LIC123"
}
```

**Response:** (201)
```json
{
  "success": true,
  "data": { Organization object },
  "message": "Organization created successfully"
}
```

**Auth:** Requires authenticated user
**Notes:**
- User becomes owner of new org
- Plan determines max_employees (starter=10, professional=50, enterprise=999999)
- Slug must be unique

##### `GET /api/organizations`
Get authenticated user's organization.

**Response:** (200)
```json
{
  "success": true,
  "data": {
    ...Organization,
    "current_member_count": 5,
    "user_role": "owner"
  }
}
```

**Auth:** Requires authenticated user

##### `GET /api/organizations/[orgId]`
Get organization details (with stats).

**Response:** (200)
```json
{
  "success": true,
  "data": {
    ...Organization,
    "member_count": 5,
    "avg_completion": 65
  }
}
```

**Auth:** Requires org membership
**Access:** Any role

##### `PATCH /api/organizations/[orgId]`
Update organization (owner only).

**Request:**
```json
{
  "name": "Updated Name",
  "city": "Boulder",
  "license_number": "LIC456"
}
```

**Response:** (200)

**Auth:** Requires owner role
**Notes:** Cannot update slug or plan via API

#### Organization Members

##### `GET /api/organizations/[orgId]/members`
List organization members with pagination.

**Query Parameters:**
- `page` (1-based, default: 1)
- `limit` (default: 10, max: 100)
- `search` (optional, searches email and name)

**Response:** (200)
```json
{
  "success": true,
  "data": {
    "members": [
      {
        "id": "member_id",
        "org_id": "org_id",
        "user_id": "user_id",
        "role": "owner",
        "profiles": {
          "display_name": "John Doe",
          "email": "john@example.com"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

**Auth:** Requires org membership
**Access:** Any role

##### `POST /api/organizations/[orgId]/members`
Invite member to organization.

**Request:**
```json
{
  "email": "new@example.com",
  "role": "budtender"
}
```

**Response:** (201)

**Auth:** Requires manager or owner role
**Notes:**
- User with email must already exist in Auth
- Checks org capacity against max_employees
- Increments organization employee_count

##### `PATCH /api/organizations/[orgId]/members/[memberId]`
Update member role.

**Request:**
```json
{
  "role": "manager"
}
```

**Response:** (200)

**Auth:** Requires manager or owner role
**Notes:** Prevents removing last owner from organization

##### `DELETE /api/organizations/[orgId]/members/[memberId]`
Remove member from organization.

**Response:** (200)
```json
{
  "success": true,
  "data": null,
  "message": "Member removed successfully"
}
```

**Auth:** Requires manager or owner role
**Notes:**
- Prevents removing last owner
- Decrements organization employee_count

#### Training Modules

##### `GET /api/training/modules`
List training modules with filtering.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10, max: 100)
- `search` (searches title and description)
- `category` (compliance, product_knowledge, customer_service, safety)
- `difficulty` (beginner, intermediate, advanced)

**Response:** (200)
```json
{
  "success": true,
  "data": {
    "modules": [
      {
        "id": "module_id",
        "title": "Compliance 101",
        "description": "...",
        "category": "compliance",
        "difficulty": "beginner",
        "duration_minutes": 45,
        "passing_score": 80,
        "state_requirements": ["CO"],
        "user_completed": false
      }
    ],
    "pagination": { ... },
    "plan_restrictions": false
  }
}
```

**Auth:** Requires authentication
**Notes:**
- Starter plan: restricted from premium modules
- Premium modules include IDs with 'advanced_compliance' or 'custom_training'

##### `GET /api/training/modules/[moduleId]`
Get module details with content blocks and quiz.

**Response:** (200)
```json
{
  "success": true,
  "data": {
    "id": "module_id",
    "title": "Compliance 101",
    "description": "...",
    "content_blocks": [
      {
        "id": "block_id",
        "type": "text",
        "content": "...",
        "order": 1
      }
    ],
    "quiz": {
      "questions": [
        {
          "id": "q_id",
          "question": "What is...",
          "options": ["A", "B", "C", "D"],
          "explanation": "..."
        }
      ]
    },
    "user_progress": {
      "progress_pct": 50,
      "status": "in_progress"
    }
  }
}
```

**Auth:** Requires authentication
**Access:** Plan-based restrictions apply

#### Training Progress

##### `GET /api/training/progress`
Get user's training progress across all modules.

**Response:** (200)
```json
{
  "success": true,
  "data": {
    "progress": [
      {
        "id": "progress_id",
        "module_id": "module_id",
        "progress_pct": 75,
        "status": "in_progress",
        "training_modules": {
          "title": "Module Title",
          "category": "compliance"
        }
      }
    ],
    "statistics": {
      "total_modules": 10,
      "completed_modules": 3,
      "in_progress_modules": 2,
      "average_progress": 45,
      "completion_rate": 30
    }
  }
}
```

**Auth:** Requires authentication

##### `POST /api/training/progress`
Create or update training progress.

**Request:**
```json
{
  "module_id": "uuid",
  "progress_pct": 50,
  "status": "in_progress"
}
```

**Response:** (201 or 200)

**Auth:** Requires authentication
**Notes:**
- Creates new progress if doesn't exist
- Updates existing progress otherwise

##### `PATCH /api/training/progress`
Update existing training progress.

**Request:** Same as POST

**Response:** (200)

**Auth:** Requires authentication
**Notes:** Returns 404 if progress doesn't exist

#### Quiz Attempts

##### `POST /api/training/quiz/[quizId]/attempt`
Submit quiz attempt with auto-grading.

**Request:**
```json
{
  "quiz_id": "uuid",
  "answers": [
    {
      "question_id": "q_id",
      "selected_answer": 2
    }
  ],
  "time_taken_seconds": 1200
}
```

**Response:** (200)
```json
{
  "success": true,
  "data": {
    "attempt": {
      "id": "attempt_id",
      "score": 8,
      "percentage": 80,
      "passed": true
    },
    "passed": true,
    "score": 8,
    "percentage": 80,
    "passing_score": 80,
    "certification": {
      "id": "cert_id",
      "user_id": "user_id",
      "module_id": "module_id",
      "score": 80,
      "passed": true,
      "expires_at": "2025-04-03T..."
    }
  }
}
```

**Auth:** Requires authentication
**Auto-Actions:**
- Updates training_progress (sets status=completed, progress_pct=100)
- Creates certification if score >= passing_score
- Compliance modules get 1-year expiration

#### Certifications

##### `GET /api/certifications`
Get user's or organization's certifications.

**Query Parameters:**
- `scope` (user or organization, default: user)
- `page`, `limit` for pagination

**Response:** (200)
```json
{
  "success": true,
  "data": {
    "certifications": [
      {
        "id": "cert_id",
        "user_id": "user_id",
        "module_id": "module_id",
        "score": 85,
        "passed": true,
        "completed_at": "2024-04-03T...",
        "expires_at": "2025-04-03T...",
        "is_expired": false,
        "training_modules": {
          "title": "Module Title",
          "category": "compliance"
        }
      }
    ],
    "pagination": { ... }
  }
}
```

**Auth:** Requires authentication
**Notes:**
- scope=organization requires manager or owner role
- is_expired calculated by comparing expires_at to current time

#### Compliance

##### `GET /api/compliance?org_id=orgId`
Get organization compliance status.

**Response:** (200)
```json
{
  "success": true,
  "data": {
    "compliance_status": "compliant",
    "summary": {
      "total_records": 10,
      "non_compliant": 0,
      "warnings": 1,
      "compliant": 9
    },
    "certification_stats": {
      "expired": 2,
      "expiring_soon": 3
    },
    "records": [...]
  }
}
```

**Auth:** Requires org membership
**Access:** Any role

##### `POST /api/compliance?org_id=orgId`
Create compliance record.

**Request:**
```json
{
  "type": "annual_inspection",
  "status": "compliant",
  "details": "Passed all requirements"
}
```

**Response:** (201)

**Auth:** Requires manager or owner role

#### Billing

##### `GET /api/billing`
Get current subscription and plan details.

**Response:** (200)
```json
{
  "success": true,
  "data": {
    "plan": "professional",
    "stripe_customer_id": "cus_123",
    "subscription": {
      "id": "sub_123",
      "status": "active",
      "plan": "professional",
      "current_period_start": "2024-04-03T...",
      "current_period_end": "2024-05-03T...",
      "cancel_at_period_end": false
    },
    "plan_details": {
      "name": "Professional",
      "price": 149,
      "interval": "month",
      "features": [...]
    },
    "limits": {
      "max_employees": 50,
      "current_employees": 5
    }
  }
}
```

**Auth:** Requires authentication

##### `POST /api/billing`
Create Stripe checkout session.

**Request:**
```json
{
  "plan": "professional"
}
```

**Response:** (200)
```json
{
  "success": true,
  "data": {
    "session_id": "cs_123",
    "session_url": "https://checkout.stripe.com/..."
  }
}
```

**Auth:** Requires owner role
**Notes:**
- Enterprise plan requires contacting sales
- Creates Stripe customer if doesn't exist
- Requires STRIPE_PRICE_ID_STARTER and STRIPE_PRICE_ID_PROFESSIONAL env vars

##### `POST /api/billing/webhook`
Stripe webhook handler (no auth required).

**Handles:**
- `customer.subscription.created` - Update subscription tracking
- `customer.subscription.updated` - Update subscription status
- `customer.subscription.deleted` - Downgrade to starter plan
- `invoice.payment_succeeded` - Log payment
- `invoice.payment_failed` - Log failure
- `customer.deleted` - Clear Stripe customer ID

**Auth:** Stripe signature verification

#### Dashboard

##### `GET /api/dashboard/stats?org_id=orgId`
Get comprehensive organization dashboard statistics.

**Response:** (200)
```json
{
  "success": true,
  "data": {
    "organization": {
      "id": "org_id",
      "name": "Green Leaf",
      "plan": "professional"
    },
    "employees": {
      "total": 5,
      "max": 50,
      "utilization": 10
    },
    "training": {
      "average_completion": 65,
      "modules_in_progress": 3,
      "modules_completed": 8
    },
    "certifications": {
      "active": 15,
      "expired": 2,
      "total": 17
    },
    "compliance": {
      "status": "compliant",
      "records": 10
    },
    "category_breakdown": [
      {
        "category": "compliance",
        "total": 5,
        "completed": 3,
        "completion_rate": 60
      }
    ],
    "recent_activity": [
      {
        "id": "activity_id",
        "user_name": "John Doe",
        "module_title": "Compliance 101",
        "score": 85,
        "passed": true,
        "timestamp": "2024-04-03T..."
      }
    ]
  }
}
```

**Auth:** Requires manager or owner role

## Key Features

### Multi-Tenant Architecture
- All routes enforce org_id validation
- Users can only access their organization's data
- Role-based access control (owner/manager/budtender)

### Error Handling
Consistent error response format with HTTP status codes:
- 200: Success
- 201: Created
- 400: Validation Error
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict (duplicate, capacity exceeded)
- 500: Server Error

### Pagination
All list endpoints support:
- `page` (1-based indexing)
- `limit` (capped at 100)
- `total` and `pages` in response

### Plan-Based Feature Restrictions
- Starter: Limited modules, 10 employees
- Professional: All modules, 50 employees
- Enterprise: Unlimited features

### Auto-Grading
Quiz submission automatically:
- Calculates score against correct answers
- Creates certifications if passed
- Sets compliance module expiration to 1 year
- Updates training progress

### Webhook Integration
Stripe webhooks handle:
- Subscription lifecycle management
- Plan downgrades on cancellation
- Payment success/failure logging

## Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_STARTER=
STRIPE_PRICE_ID_PROFESSIONAL=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Tables Referenced

- `organizations` - Org details, plan, Stripe IDs
- `profiles` - User profiles (email, name)
- `org_members` - User-org memberships with roles
- `training_modules` - Module metadata, content, quiz
- `content_blocks` - Module lesson content
- `quiz_questions` - Quiz questions with correct answers
- `training_progress` - User progress per module
- `quiz_attempts` - Quiz submission records
- `certifications` - User certifications with expiry
- `compliance_records` - Org compliance checks

## Testing Recommendations

1. **Authentication**: Test requireAuth, requireOrgMember, requireOrgRole
2. **Validation**: Submit invalid data to each endpoint
3. **Authorization**: Test cross-org access attempts
4. **Pagination**: Test page=999, limit=-1, search with special chars
5. **Capacity**: Exceed org employee limits
6. **Quiz Grading**: Test 0%, 50%, 100% scores
7. **Stripe**: Test webhook signature verification
8. **Concurrency**: Multiple users updating progress simultaneously

## Production Checklist

- [ ] Set all environment variables
- [ ] Configure Stripe webhook endpoint: /api/billing/webhook
- [ ] Create Stripe products and prices
- [ ] Set up database indexes on frequently queried columns
- [ ] Enable CORS if frontend on different domain
- [ ] Set up rate limiting on POST/PATCH/DELETE endpoints
- [ ] Configure Supabase RLS policies for multi-tenancy
- [ ] Set up monitoring/logging for all endpoints
- [ ] Test all webhook scenarios
- [ ] Document any custom modifications

## Code Organization

All routes follow consistent patterns:
1. Input validation with Zod
2. Authentication/Authorization checks
3. Database operations with error handling
4. Response formatting with helper functions
5. Comprehensive logging for debugging

Routes are fully self-contained and ready for production deployment.
