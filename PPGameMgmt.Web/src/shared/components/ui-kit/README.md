# PPGameMgmt UI Component Kit

A comprehensive library of reusable React components built on top of shadcn/ui for the PPGameMgmt application. This library ensures consistent styling and behavior across features.

## Table of Contents

- [Component Categories](#component-categories)
- [Installation](#installation)
- [Usage Examples](#usage-examples)
- [Contributing](#contributing)

## Component Categories

The component library is organized into the following categories:

### Layout Components

- `PageContainer` - Consistent container for pages with configurable width and padding
- `Section` - Content section with title, description and actions
- `CardSection` - Section variant with card styling
- `TabsContainer` - Consistent tabs interface
- `Card` - Enhanced card component with common patterns

### Data Display Components

- `DataTable` - Feature-rich table component with sorting, filtering, and pagination
- `EntityCard` - Display entity information with consistent layout
- `StatusBadge` - Consistent status indicators with color coding
- `Metrics` - Display key metrics and statistics
- `InfoDisplay` - Standardized information display

### Input Components

- `SearchInput` - Search input with clear button and debounced search
- `FilterDropdown` - Dropdown for filtering data with multiple filter groups
- `FormFields` - Form input components with consistent styling and validation
- `DateRangePicker` - Select date ranges
- `ActionButtons` - Standardized action buttons for forms and other UI elements

### Feedback Components

- `LoadingState` - Consistent loading states with various skeleton options
- `ErrorDisplay` - Standardized error display
- `EmptyState` - Consistent empty state display
- `ConfirmationDialog` - Reusable confirmation dialogs
- `Notification` - Toast notifications

### Navigation Components

- `Breadcrumbs` - Consistent breadcrumb navigation
- `Pagination` - Page navigation for data tables
- `TabNavigation` - Tab-based navigation
- `BackButton` - Standard back navigation
- `EntityNavigation` - Navigation between related entities

## Installation

This component library is built into the PPGameMgmt application and relies on shadcn/ui components. No additional installation is required.

## Usage Examples

### Layout Example

```tsx
import { PageContainer, Section, CardSection } from '@/shared/components/ui-kit';

function MyPage() {
  return (
    <PageContainer>
      <Section 
        title="Overview" 
        description="Summary of key information"
        actions={<Button>Add New</Button>}
      >
        <p>Section content goes here</p>
      </Section>
      
      <CardSection
        title="Detailed Information"
        description="More detailed information about this entity"
      >
        <p>Card content goes here</p>
      </CardSection>
    </PageContainer>
  );
}
```

### Data Display Example

```tsx
import { DataTable, StatusBadge, EntityCard } from '@/shared/components/ui-kit';

function PlayersList() {
  const columns = [
    { id: 'name', header: 'Name', accessorKey: 'name' },
    { 
      id: 'status', 
      header: 'Status', 
      cell: ({ row }) => (
        <StatusBadge 
          status={row.status === 'active' ? 'success' : 'error'}
          label={row.status}
        />
      )
    },
    // ...more columns
  ];
  
  return (
    <DataTable
      columns={columns}
      data={players}
      enableSearch
      enableSorting
      onRowClick={handleRowClick}
    />
  );
}

function PlayerCard({ player }) {
  return (
    <EntityCard
      title={player.name}
      subtitle={`ID: ${player.id}`}
      imageSrc={player.avatar}
      badge={<StatusBadge status="success" label="Active" />}
      metadata={[
        { label: 'Email', value: player.email },
        { label: 'Joined', value: formatDate(player.joinedAt) },
      ]}
      onClick={() => navigate(`/players/${player.id}`)}
    />
  );
}
```

### Form Example

```tsx
import { 
  TextField, 
  SelectField, 
  DatePickerField, 
  CheckboxField,
  FormActions 
} from '@/shared/components/ui-kit';
import { useForm } from 'react-hook-form';

function PlayerForm() {
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      role: '',
      birthdate: null,
      isActive: false,
    }
  });
  
  const handleSubmit = (data) => {
    console.log(data);
  };
  
  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <TextField
        name="name"
        label="Name"
        form={form}
        required
      />
      
      <TextField
        name="email"
        label="Email"
        type="email"
        form={form}
      />
      
      <SelectField
        name="role"
        label="Role"
        form={form}
        options={[
          { label: 'Admin', value: 'admin' },
          { label: 'Player', value: 'player' },
        ]}
      />
      
      <DatePickerField
        name="birthdate"
        label="Birth Date"
        form={form}
      />
      
      <CheckboxField
        name="isActive"
        label="Account Active"
        form={form}
      />
      
      <FormActions
        submitLabel="Save Player"
        cancelAction={{
          label: 'Cancel',
          onClick: () => navigate(-1)
        }}
      />
    </form>
  );
}
```

### Feedback Example

```tsx
import { LoadingState, ErrorDisplay, EmptyState } from '@/shared/components/ui-kit';

function MyComponent() {
  const { data, isLoading, error, refetch } = useQuery('myData', fetchData);
  
  if (isLoading) {
    return <LoadingState variant="card" count={3} />;
  }
  
  if (error) {
    return (
      <ErrorDisplay 
        error={error}
        context="players data"
        onRetry={refetch}
      />
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No players found"
        description="Try changing your search criteria or add a new player."
        action={{
          label: "Add Player",
          onClick: () => navigate('/players/new')
        }}
      />
    );
  }
  
  // Render data...
}
```

### Navigation Example

```tsx
import { Breadcrumbs, BackButton, Pagination } from '@/shared/components/ui-kit';

function PlayerDetailPage() {
  const { id } = useParams();
  
  const breadcrumbItems = [
    { label: 'Players', href: '/players' },
    { label: 'Player Details', href: `/players/${id}` },
  ];
  
  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} />
      
      <BackButton to="/players" />
      
      {/* Page Content */}
      
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
```

## Contributing

When adding new components to this library:

1. Place the component in the appropriate category folder
2. Export the component from the category's index.ts file
3. Follow the existing patterns for props, styling, and TypeScript typings
4. Add appropriate documentation and examples
5. Ensure components are accessible and responsive