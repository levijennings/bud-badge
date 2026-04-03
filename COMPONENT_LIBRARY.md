# Bud Badge Component Library - Complete Guide

## Overview

A comprehensive, production-ready UI component library for Bud Badge - a Next.js 14 PWA designed for dispensary team training and compliance management.

**Location**: `/src/components/`

## Features

✓ 20 production-ready components
✓ Full TypeScript support with generics
✓ WCAG 2.1 AA accessibility compliance
✓ Dark and light theme variants
✓ Tailwind CSS with brand green (#15803D)
✓ Lucide React icons integration
✓ Mobile-responsive design
✓ Comprehensive error handling
✓ Toast notification system
✓ Modal dialogs with keyboard support

## Quick Start

### Installation

All components are in `/src/components/` and ready to import:

```tsx
import { Button, Input, Card } from '@/components/ui';
import { ModuleCard, QuizQuestion } from '@/components/training';
import { Header, Sidebar, Footer } from '@/components/layout';
```

### Basic Example

```tsx
import { Button, Card, CardContent } from '@/components/ui';

export default function Dashboard() {
  return (
    <Card variant="default">
      <CardContent>
        <h1>Welcome to Bud Badge</h1>
        <Button variant="primary">Get Started</Button>
      </CardContent>
    </Card>
  );
}
```

## Component Categories

### UI Components (11)

Foundational building blocks for interfaces.

1. **Button** - Action triggers with multiple variants
2. **Input** - Text input with validation and variants
3. **Select** - Dropdown menu component
4. **Card** - Container with header, content, footer
5. **Badge** - Status and role indicators
6. **Modal** - Dialog with customizable content
7. **Toast** - Notification system with context provider
8. **Skeleton** - Loading placeholders (line, circle, card)
9. **ProgressBar** - Linear and ring progress indicators
10. **Avatar** - User profile images with role dots
11. **EmptyState** - Placeholder with icon and action

### Training Components (5)

Specialized for training and compliance workflows.

1. **ModuleCard** - Training module with progress tracking
2. **ModuleList** - Grid of modules with category filters
3. **QuizQuestion** - Interactive multiple-choice questions
4. **CertificateCard** - Achievement display with validity status
5. **ComplianceStatus** - Compliance overview with requirements

### Dashboard Components (2)

Data visualization and employee management.

1. **StatsCard** - KPI metric with trend indicator
2. **EmployeeRow** - Team member row with actions

### Layout Components (3)

Page structure and navigation.

1. **Header** - Top navigation with user menu and org switcher
2. **Sidebar** - Collapsible navigation sidebar
3. **Footer** - Page footer with links

## Component Details

### UI/Button

```tsx
import { Button } from '@/components/ui';

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Delete</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// States
<Button disabled>Disabled</Button>
<Button loading>Loading...</Button>

// With icon
import { ChevronRight } from 'lucide-react';
<Button icon={<ChevronRight />} iconPosition="right">
  Continue
</Button>

// Full width
<Button fullWidth>Submit Form</Button>
```

### UI/Input

```tsx
import { Input } from '@/components/ui';

// Default
<Input
  label="Email Address"
  type="email"
  placeholder="user@example.com"
  helperText="We'll never share your email"
/>

// With error
<Input
  label="Password"
  type="password"
  error="Password must be at least 8 characters"
/>

// Search variant
<Input
  variant="search"
  placeholder="Search modules..."
/>

// Password with toggle
<Input
  variant="password"
  label="Password"
/>
```

### UI/Card

```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui';

// Light variant
<Card variant="default">
  <CardHeader>
    <h2>Title</h2>
  </CardHeader>
  <CardContent>
    <p>Content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Dark variant (for dispensary dashboard)
<Card variant="dark">
  <CardContent>Dark themed content</CardContent>
</Card>

// Interactive selected state
<Card interactive selected={isSelected} onClick={handleClick}>
  <CardContent>Clickable card</CardContent>
</Card>
```

### UI/Badge

```tsx
import { Badge } from '@/components/ui';

// Status badges
<Badge variant="success">Compliant</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Non-Compliant</Badge>
<Badge variant="info">Information</Badge>
<Badge variant="neutral">Neutral</Badge>

// Role badges
<Badge variant="owner">Owner</Badge>
<Badge variant="manager">Manager</Badge>
<Badge variant="budtender">Budtender</Badge>

// Sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
```

### UI/Modal

```tsx
import { Modal, ModalBody, ModalFooter } from '@/components/ui';
import { Button } from '@/components/ui';

const [open, setOpen] = useState(false);

<Modal
  open={open}
  onClose={() => setOpen(false)}
  title="Confirm Action"
  size="md"
  closeOnEscape={true}
  closeOnBackdropClick={true}
>
  <ModalBody>
    Are you sure you want to proceed?
  </ModalBody>
  <ModalFooter>
    <Button variant="secondary" onClick={() => setOpen(false)}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleConfirm}>
      Confirm
    </Button>
  </ModalFooter>
</Modal>
```

### UI/Toast

```tsx
import { ToastProvider, useToast } from '@/components/ui';

// In your app root
<ToastProvider>
  <YourApp />
</ToastProvider>

// In components
const { addToast } = useToast();

// Success
addToast('Module completed!', 'success');

// Error with longer duration
addToast('Failed to save', 'error', { duration: 6000 });

// With action
addToast('Changes made', 'info', {
  action: {
    label: 'Undo',
    onClick: handleUndo,
  },
});
```

### Training/ModuleCard

```tsx
import { ModuleCard } from '@/components/training';

<ModuleCard
  id="mod-compliance-101"
  title="Cannabis Compliance 101"
  category="Compliance"
  difficulty="beginner"
  duration={45}
  progress={65}
  started={true}
  completed={false}
  isPremium={false}
  hasAccess={true}
  onPress={(id) => navigate(`/training/${id}`)}
/>
```

### Training/ModuleList

```tsx
import { ModuleList } from '@/components/training';

<ModuleList
  modules={trainingModules}
  categories={['Compliance', 'Product Knowledge', 'Sales']}
  onModulePress={(id) => openModule(id)}
  loading={false}
/>
```

### Training/QuizQuestion

```tsx
import { QuizQuestion } from '@/components/training';

const [selected, setSelected] = useState<string>();
const [submitted, setSubmitted] = useState<string>();

<QuizQuestion
  questionNumber={3}
  totalQuestions={10}
  question="What is the maximum purchase amount?"
  options={[
    { id: '1', text: '1 ounce' },
    { id: '2', text: '2 ounces' },
    { id: '3', text: '4 ounces' },
  ]}
  selectedAnswerId={selected}
  submittedAnswerId={submitted}
  correctAnswerId="1"
  onSelectAnswer={setSelected}
  onSubmit={() => setSubmitted(selected)}
  showFeedback={true}
  feedback="Correct! The daily limit is 1 ounce."
/>
```

### Training/CertificateCard

```tsx
import { CertificateCard } from '@/components/training';

<CertificateCard
  moduleName="Cannabis Compliance 101"
  score={92}
  dateEarned={new Date('2024-01-15')}
  expiryDate={new Date('2025-01-15')}
  certificateNumber="CERT-2024-00156"
  isExpired={false}
  onDownload={() => downloadCertificate()}
  onShare={() => shareCertificate()}
/>
```

### Dashboard/StatsCard

```tsx
import { StatsCard } from '@/components/dashboard';
import { Users, TrendingUp } from 'lucide-react';

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatsCard
    label="Total Employees"
    value="24"
    icon={<Users className="w-6 h-6" />}
    trend={{ direction: 'up', percentage: 12, label: 'vs last month' }}
  />

  <StatsCard
    label="Completion Rate"
    value="87%"
    trend={{ direction: 'down', percentage: 3, label: 'vs last month' }}
    loading={false}
  />
</div>
```

### Layout/Header

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
    id: 'user-123',
    name: 'Sarah Manager',
    email: 'sarah@greenleaf.com',
    initials: 'SM',
    role: 'manager',
  }}
  organizations={[
    { id: 'org-1', name: 'Green Leaf Dispensary' },
    { id: 'org-2', name: 'Purple Haze Collective' },
  ]}
  activeOrgId="org-1"
  onOrgChange={(orgId) => switchOrganization(orgId)}
  onLogout={() => handleLogout()}
  onSettings={() => openSettings()}
/>
```

### Layout/Sidebar

```tsx
import { Sidebar } from '@/components/layout';
import { Home, Book, Users, AlertCircle } from 'lucide-react';

<Sidebar
  sections={[
    {
      title: 'Main',
      links: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          href: '/dashboard',
          icon: <Home className="w-5 h-5" />,
          active: true,
        },
        {
          id: 'training',
          label: 'Training',
          href: '/training',
          icon: <Book className="w-5 h-5" />,
        },
      ],
    },
    {
      title: 'Management',
      links: [
        {
          id: 'team',
          label: 'Team',
          href: '/team',
          icon: <Users className="w-5 h-5" />,
          badge: 3,
        },
        {
          id: 'compliance',
          label: 'Compliance',
          href: '/compliance',
          icon: <AlertCircle className="w-5 h-5" />,
        },
      ],
    },
  ]}
  collapsed={false}
  onCollapsedChange={(collapsed) => setSidebarCollapsed(collapsed)}
/>
```

## Styling & Customization

### Tailwind Integration

All components use Tailwind CSS. Configure in `tailwind.config.ts`:

```ts
export default {
  theme: {
    extend: {
      colors: {
        green: {
          600: '#15803D', // Primary brand green
        },
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
    },
  },
}
```

### Dark Theme

Components support dark variants:

```tsx
<Card variant="dark">
  <CardContent className="text-gray-100">
    Dark-themed content
  </CardContent>
</Card>
```

### Custom Styling

Override with Tailwind classes:

```tsx
<Button
  variant="primary"
  className="shadow-xl hover:shadow-2xl"
>
  Enhanced Button
</Button>
```

## Accessibility

All components are built with accessibility as a core principle:

- **ARIA labels** for screen readers
- **Keyboard navigation** (Tab, Enter, Escape)
- **Focus management** with visible indicators
- **Color contrast** WCAG AA compliant
- **Semantic HTML** for proper structure
- **Error messages** with aria-describedby
- **Loading states** with aria-busy

Example:

```tsx
<Input
  id="email"
  aria-label="Email address"
  aria-describedby="email-help"
/>
<p id="email-help" className="text-sm text-gray-500">
  We'll never share your email address
</p>
```

## Type Safety

Full TypeScript support with proper typing:

```tsx
import type { User, TrainingModule, ComplianceStatus } from '@/components/types';

interface DashboardProps {
  user: User;
  modules: TrainingModule[];
  status: ComplianceStatus;
}

export const Dashboard: React.FC<DashboardProps> = ({ ... }) => {
  // Fully typed component
};
```

## Mobile Responsiveness

All components are mobile-first and responsive:

```tsx
// Sidebar hides on mobile
<div className="hidden md:block">
  <Sidebar {...props} />
</div>

// Navigation responds to screen size
<nav className="flex md:flex-row flex-col gap-4">
  {/* Navigation items */}
</nav>
```

## Performance

- **Lazy loading** support for lists
- **Memoization** where appropriate
- **CSS animations** use GPU acceleration
- **Tree-shaking** friendly exports
- **Minimal bundle impact** (Tailwind optimized)

## Common Patterns

### Form with Validation

```tsx
import { Input, Select, Button } from '@/components/ui';

const [formData, setFormData] = useState({
  email: '',
  role: '',
});

const [errors, setErrors] = useState<Record<string, string>>({});

<form onSubmit={handleSubmit}>
  <Input
    label="Email"
    value={formData.email}
    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
    error={errors.email}
  />

  <Select
    label="Role"
    options={[
      { value: 'manager', label: 'Manager' },
      { value: 'budtender', label: 'Budtender' },
    ]}
    error={errors.role}
  />

  <Button type="submit" fullWidth>
    Create User
  </Button>
</form>
```

### Data Table

```tsx
import { EmployeeRow } from '@/components/dashboard';
import { Card, CardContent } from '@/components/ui';

<Card>
  <CardContent className="p-0">
    {employees.map((emp) => (
      <EmployeeRow
        key={emp.id}
        {...emp}
        onRowPress={() => viewEmployee(emp.id)}
        actions={[
          { label: 'Edit', onClick: () => editEmployee(emp.id) },
          { label: 'Remove', onClick: () => removeEmployee(emp.id), variant: 'danger' },
        ]}
      />
    ))}
  </CardContent>
</Card>
```

## File Structure

```
src/components/
├── README.md                  # Component library documentation
├── types.ts                   # Shared type definitions
├── index.ts                   # Main export file
│
├── ui/                        # Core UI components
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
│
├── training/                  # Training-specific components
│   ├── ModuleCard.tsx
│   ├── ModuleList.tsx
│   ├── QuizQuestion.tsx
│   ├── CertificateCard.tsx
│   ├── ComplianceStatus.tsx
│   └── index.ts
│
├── dashboard/                 # Dashboard components
│   ├── StatsCard.tsx
│   ├── EmployeeRow.tsx
│   └── index.ts
│
└── layout/                    # Layout components
    ├── Header.tsx
    ├── Sidebar.tsx
    ├── Footer.tsx
    └── index.ts
```

## Migration Guide

If migrating from another component library:

1. **Update imports**: Change import paths to `/components/`
2. **Check variants**: Map old variant names to new ones
3. **Update props**: Review prop changes in each component
4. **Test accessibility**: Verify keyboard navigation and screen readers
5. **Update Tailwind config**: Ensure brand color is set to #15803D

## Support & Contributing

For issues or suggestions:
1. Check existing component documentation
2. Review component examples
3. Check TypeScript types for prop definitions
4. File issues with reproduction steps

## Version

Current version: 1.0.0
Last updated: 2024
