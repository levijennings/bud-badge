# Bud Badge Component Library

Production-ready UI component library for Bud Badge, a Next.js 14 PWA with Tailwind CSS and Lucide React icons.

## Design System

- **Primary Color**: Professional Green (#15803D)
- **Font**: Outfit
- **Dark Theme**: Optimized for dispensary-facing views
- **Icons**: Lucide React
- **Styling**: Tailwind CSS
- **Architecture**: Multi-tenant SaaS (dispensary managers + budtenders)

## Directory Structure

```
src/components/
├── ui/                    # Core UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Modal.tsx
│   ├── Toast.tsx
│   ├── Skeleton.tsx
│   ├── ProgressBar.tsx
│   ├── Avatar.tsx
│   ├── EmptyState.tsx
│   └── index.ts
├── training/              # Training & compliance components
│   ├── ModuleCard.tsx
│   ├── ModuleList.tsx
│   ├── QuizQuestion.tsx
│   ├── CertificateCard.tsx
│   ├── ComplianceStatus.tsx
│   └── index.ts
├── dashboard/             # Dashboard components
│   ├── StatsCard.tsx
│   ├── EmployeeRow.tsx
│   └── index.ts
├── layout/                # Layout components
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── Footer.tsx
│   └── index.ts
├── index.ts               # Main exports
└── README.md              # This file
```

## UI Components

### Button
```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md" loading={false}>
  Click Me
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean
- `disabled`: boolean
- `icon`: React.ReactNode
- `iconPosition`: 'left' | 'right'
- `fullWidth`: boolean

### Input
```tsx
import { Input } from '@/components/ui';

<Input
  label="Email"
  type="email"
  placeholder="user@example.com"
  variant="default"
  error={errorMessage}
  helperText="We'll never share your email"
/>
```

**Props:**
- `label`: string (optional)
- `error`: string (optional)
- `helperText`: string (optional)
- `variant`: 'default' | 'search' | 'password'
- `disabled`: boolean

### Select
```tsx
import { Select } from '@/components/ui';

<Select
  label="Role"
  placeholder="Select a role"
  options={[
    { value: 'owner', label: 'Owner' },
    { value: 'manager', label: 'Manager' },
    { value: 'budtender', label: 'Budtender' },
  ]}
/>
```

**Props:**
- `label`: string (optional)
- `error`: string (optional)
- `placeholder`: string (optional)
- `options`: Array<{ value: string; label: string }>
- `disabled`: boolean

### Card
```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui';

<Card variant="default" interactive selected={false}>
  <CardHeader>Title</CardHeader>
  <CardContent>Content here</CardContent>
  <CardFooter>Action buttons</CardFooter>
</Card>
```

**Props:**
- `variant`: 'default' | 'dark'
- `interactive`: boolean
- `selected`: boolean

### Badge
```tsx
import { Badge } from '@/components/ui';

<Badge variant="success" size="md">Compliant</Badge>
```

**Variants:**
- Status: 'success', 'warning', 'error', 'info', 'neutral'
- Roles: 'owner', 'manager', 'budtender'

### Modal
```tsx
import { Modal, ModalBody, ModalFooter } from '@/components/ui';

<Modal open={isOpen} onClose={onClose} title="Confirm Action">
  <ModalBody>Are you sure?</ModalBody>
  <ModalFooter>
    <Button onClick={onClose} variant="secondary">Cancel</Button>
    <Button onClick={handleConfirm}>Confirm</Button>
  </ModalFooter>
</Modal>
```

**Props:**
- `open`: boolean
- `onClose`: () => void
- `title`: string (optional)
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `closeOnEscape`: boolean
- `closeOnBackdropClick`: boolean

### Toast
```tsx
import { ToastProvider, useToast } from '@/components/ui';

// Wrap app with provider
<ToastProvider>
  <App />
</ToastProvider>

// Use in components
const { addToast } = useToast();
addToast('Success!', 'success');
addToast('Error occurred', 'error', { duration: 6000 });
```

**Toast Variants:** 'success' | 'error' | 'warning' | 'info'

### Skeleton
```tsx
import { Skeleton, SkeletonCircle, CardSkeleton } from '@/components/ui';

<Skeleton variant="light" height="1.5rem" width="60%" />
<SkeletonCircle variant="light" size="lg" />
<CardSkeleton variant="dark" lines={3} />
```

### ProgressBar
```tsx
import { ProgressBar, ProgressRing } from '@/components/ui';

<ProgressBar percentage={75} status="in-progress" showLabel />
<ProgressRing percentage={60} size={120} label="Training" />
```

### Avatar
```tsx
import { Avatar, AvatarGroup } from '@/components/ui';

<Avatar src="image.jpg" initials="JD" alt="John Doe" role="manager" size="md" />
<AvatarGroup avatars={userList} size="md" max={5} />
```

### EmptyState
```tsx
import { EmptyState } from '@/components/ui';
import { Package } from 'lucide-react';

<EmptyState
  icon={Package}
  title="No modules yet"
  description="Start creating training modules"
  action={{
    label: 'Create Module',
    onClick: handleCreate,
  }}
/>
```

## Training Components

### ModuleCard
```tsx
import { ModuleCard } from '@/components/training';

<ModuleCard
  id="mod-1"
  title="Cannabis Compliance 101"
  category="Compliance"
  difficulty="beginner"
  duration={30}
  progress={65}
  started={true}
  completed={false}
  isPremium={false}
  hasAccess={true}
  onPress={handlePress}
/>
```

### ModuleList
```tsx
import { ModuleList } from '@/components/training';

<ModuleList
  modules={modulesArray}
  categories={['Compliance', 'Product', 'Sales']}
  onModulePress={handlePress}
/>
```

### QuizQuestion
```tsx
import { QuizQuestion } from '@/components/training';

<QuizQuestion
  questionNumber={1}
  totalQuestions={10}
  question="What is the legal age?"
  options={[
    { id: '1', text: '18' },
    { id: '2', text: '21' },
  ]}
  onSelectAnswer={setAnswer}
  onSubmit={handleSubmit}
  correctAnswerId="2"
/>
```

### CertificateCard
```tsx
import { CertificateCard } from '@/components/training';

<CertificateCard
  moduleName="Cannabis Compliance 101"
  score={95}
  dateEarned={new Date()}
  expiryDate={new Date(2025, 12, 31)}
  certificateNumber="CERT-2024-001"
  isExpired={false}
  onDownload={handleDownload}
  onShare={handleShare}
/>
```

### ComplianceStatus
```tsx
import { ComplianceStatus } from '@/components/training';

<ComplianceStatus
  overallStatus="compliant"
  requirements={requirementsArray}
  actionItems={actionItemsArray}
  onViewDetails={handleViewDetails}
/>
```

## Dashboard Components

### StatsCard
```tsx
import { StatsCard } from '@/components/dashboard';
import { Users } from 'lucide-react';

<StatsCard
  label="Total Employees"
  value="24"
  icon={<Users className="w-6 h-6" />}
  trend={{
    direction: 'up',
    percentage: 12,
    label: 'vs last month',
  }}
/>
```

### EmployeeRow
```tsx
import { EmployeeRow } from '@/components/dashboard';

<EmployeeRow
  id="emp-1"
  name="John Doe"
  initials="JD"
  role="manager"
  trainingProgress={65}
  trainingStatus="in-progress"
  completedModules={3}
  totalModules={5}
  lastActivity={new Date()}
  complianceStatus="compliant"
  onRowPress={handlePress}
  actions={[
    {
      label: 'Edit',
      onClick: handleEdit,
    },
    {
      label: 'Remove',
      onClick: handleRemove,
      variant: 'danger',
    },
  ]}
/>
```

## Layout Components

### Header
```tsx
import { Header } from '@/components/layout';

<Header
  organizationName="Green Leaf Dispensary"
  navLinks={[
    { label: 'Dashboard', href: '/dashboard', active: true },
    { label: 'Training', href: '/training' },
    { label: 'Team', href: '/team' },
    { label: 'Compliance', href: '/compliance' },
  ]}
  user={{
    id: '1',
    name: 'John Manager',
    email: 'john@example.com',
    initials: 'JM',
    role: 'manager',
  }}
  organizations={[
    { id: '1', name: 'Green Leaf Dispensary' },
    { id: '2', name: 'Purple Haze Dispensary' },
  ]}
  activeOrgId="1"
  onOrgChange={handleOrgChange}
  onLogout={handleLogout}
  onSettings={handleSettings}
/>
```

### Sidebar
```tsx
import { Sidebar } from '@/components/layout';
import { Home, Book, Users, AlertCircle } from 'lucide-react';

<Sidebar
  sections={[
    {
      title: 'MAIN',
      links: [
        { id: '1', label: 'Dashboard', href: '/dashboard', icon: <Home />, active: true },
        { id: '2', label: 'Training', href: '/training', icon: <Book /> },
      ],
    },
    {
      title: 'MANAGEMENT',
      links: [
        { id: '3', label: 'Team', href: '/team', icon: <Users />, badge: 5 },
        { id: '4', label: 'Compliance', href: '/compliance', icon: <AlertCircle /> },
      ],
    },
  ]}
  collapsed={false}
  onCollapsedChange={handleCollapse}
/>
```

### Footer
```tsx
import { Footer } from '@/components/layout';

<Footer
  companyName="Bud Badge"
  sections={[
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '/features' },
        { label: 'Pricing', href: '/pricing' },
      ],
    },
  ]}
/>
```

## Accessibility

All components follow WCAG 2.1 AA standards:
- Semantic HTML
- ARIA labels and descriptions
- Keyboard navigation
- Focus management
- Color contrast ratios
- Screen reader support

## Customization

### Tailwind Configuration

Colors use `bg-green-600` for primary actions (maps to #15803D):

```js
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        green: {
          600: '#15803D', // Primary green
        },
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
    },
  },
}
```

## Contributing

When adding new components:
1. Create fully typed TypeScript files
2. Include comprehensive JSDoc comments
3. Use Tailwind for styling
4. Export from appropriate index.ts
5. Ensure accessibility compliance
6. Test with light and dark variants where applicable

## Component Checklist

- [x] Button
- [x] Input (default, search, password)
- [x] Select
- [x] Card (default, dark variants)
- [x] Badge (status + role variants)
- [x] Modal
- [x] Toast (provider + hook)
- [x] Skeleton (line, circle, card)
- [x] ProgressBar (linear + ring)
- [x] Avatar (single + group)
- [x] EmptyState
- [x] ModuleCard
- [x] ModuleList
- [x] QuizQuestion
- [x] CertificateCard
- [x] ComplianceStatus
- [x] StatsCard
- [x] EmployeeRow
- [x] Header
- [x] Sidebar
- [x] Footer
