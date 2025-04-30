# Component Guide

This guide explains how to use the standardized components in the PPGameMgmt Web application.

## Data Display Components

### DataDisplay

`DataDisplay` is a generic component that handles loading, error, and empty states for data display components.

```tsx
import { DataDisplay } from '@/shared/components/ui-kit/data-display';

function MyComponent() {
  const { data, isLoading, error } = useQuery('myData', fetchData);
  
  return (
    <DataDisplay
      data={data || []}
      isLoading={isLoading}
      error={error}
      renderItem={(item, index) => (
        <div key={index}>
          {item.name}
        </div>
      )}
      emptyState={<div>No data found</div>}
      loadingState={<div>Loading...</div>}
      errorState={<div>Error: {error?.message}</div>}
    />
  );
}
```

### Table

`Table` is a standardized table component that uses the `DataDisplay` component.

```tsx
import { Table } from '@/shared/components/ui-kit/data-display';

function MyTable() {
  const { data, isLoading, error } = useQuery('myData', fetchData);
  
  const columns = [
    {
      id: 'name',
      header: 'Name',
      accessor: (item) => item.name,
    },
    {
      id: 'email',
      header: 'Email',
      accessor: (item) => item.email,
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: (item) => (
        <Button onClick={() => handleEdit(item)}>Edit</Button>
      ),
    },
  ];
  
  return (
    <Table
      data={data || []}
      isLoading={isLoading}
      error={error}
      columns={columns}
      caption="My Table"
      striped
      hoverable
      onRowClick={(item) => handleRowClick(item)}
    />
  );
}
```

### List

`List` is a standardized list component that uses the `DataDisplay` component.

```tsx
import { List } from '@/shared/components/ui-kit/data-display';

function MyList() {
  const { data, isLoading, error } = useQuery('myData', fetchData);
  
  return (
    <List
      data={data || []}
      isLoading={isLoading}
      error={error}
      renderItem={(item, index) => (
        <div>
          <h3>{item.name}</h3>
          <p>{item.description}</p>
        </div>
      )}
      layout="vertical"
      divided
      onItemClick={(item) => handleItemClick(item)}
    />
  );
}
```

### Grid

`Grid` is a standardized grid component that uses the `DataDisplay` component.

```tsx
import { Grid } from '@/shared/components/ui-kit/data-display';

function MyGrid() {
  const { data, isLoading, error } = useQuery('myData', fetchData);
  
  return (
    <Grid
      data={data || []}
      isLoading={isLoading}
      error={error}
      renderItem={(item, index) => (
        <Card>
          <CardHeader>
            <CardTitle>{item.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{item.description}</p>
          </CardContent>
        </Card>
      )}
      columns={{
        xs: 1,
        sm: 2,
        md: 3,
        lg: 4,
      }}
      gap="1rem"
      onItemClick={(item) => handleItemClick(item)}
    />
  );
}
```

### VirtualizedList

`VirtualizedList` is a component for efficiently rendering large data sets.

```tsx
import { VirtualizedList } from '@/shared/components/ui-kit/data-display';

function MyVirtualizedList() {
  const { data, isLoading, error } = useQuery('myData', fetchData);
  
  return (
    <VirtualizedList
      data={data || []}
      isLoading={isLoading}
      error={error}
      renderItem={(item, index, style) => (
        <div key={index} style={style}>
          <h3>{item.name}</h3>
          <p>{item.description}</p>
        </div>
      )}
      itemHeight={80}
      height={400}
      width="100%"
      overscanCount={5}
    />
  );
}
```

## Form Components

### FormWrapper

`FormWrapper` is a standardized form component that handles form state, validation, and submission.

```tsx
import { FormWrapper } from '@/shared/components/FormWrapper';
import { z } from 'zod';

// Define form schema with Zod
const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  age: z.number().min(18, 'Must be at least 18 years old'),
});

function MyForm() {
  const handleSubmit = async (data) => {
    // Submit form data
  };
  
  return (
    <FormWrapper
      schema={formSchema}
      defaultValues={{
        name: '',
        email: '',
        age: 18,
      }}
      onSubmit={handleSubmit}
      submitText="Submit"
      onCancel={() => navigate(-1)}
      cancelText="Cancel"
    >
      {(form) => (
        <>
          <TextField
            name="name"
            label="Name"
            placeholder="Enter your name"
            required
            form={form}
          />
          
          <TextField
            name="email"
            label="Email"
            placeholder="Enter your email"
            type="email"
            required
            form={form}
          />
          
          <NumberField
            name="age"
            label="Age"
            placeholder="Enter your age"
            required
            form={form}
          />
        </>
      )}
    </FormWrapper>
  );
}
```

## Feedback Components

### LoadingIndicator

`LoadingIndicator` is a standardized loading indicator component.

```tsx
import { LoadingIndicator } from '@/shared/components/ui-kit/feedback';

function MyComponent() {
  return (
    <div>
      <LoadingIndicator size="md" label="Loading..." centered />
    </div>
  );
}
```

### ErrorDisplay

`ErrorDisplay` is a standardized error display component.

```tsx
import { ErrorDisplay } from '@/shared/components/ui-kit/feedback';

function MyComponent() {
  const { data, isLoading, error, refetch } = useQuery('myData', fetchData);
  
  if (error) {
    return (
      <ErrorDisplay
        error={error}
        context="data"
        onRetry={refetch}
        showDetails
      />
    );
  }
  
  // ...
}
```

### EmptyState

`EmptyState` is a standardized empty state component.

```tsx
import { EmptyState } from '@/shared/components/ui-kit/feedback';

function MyComponent() {
  const { data, isLoading } = useQuery('myData', fetchData);
  
  if (!isLoading && (!data || data.length === 0)) {
    return (
      <EmptyState
        title="No data found"
        description="There are no items to display."
        icon={<SearchIcon />}
        action={{
          label: 'Create New',
          onClick: () => navigate('/create'),
        }}
      />
    );
  }
  
  // ...
}
```

## Best Practices

### Use Standardized Components

Always use the standardized components from the UI kit instead of creating custom components.

```tsx
// Good
import { Table } from '@/shared/components/ui-kit/data-display';

// Bad
function CustomTable({ data }) {
  return (
    <table>
      {/* ... */}
    </table>
  );
}
```

### Consistent Props

Use the standardized prop types for your components.

```tsx
// Good
import { TableProps } from '@/shared/types/componentTypes';

interface MyTableProps extends TableProps<MyData> {
  // Additional props
}

// Bad
interface CustomTableProps {
  data: any[];
  loading: boolean;
  // Inconsistent prop names
}
```

### Handle Loading, Error, and Empty States

Always handle loading, error, and empty states in your components.

```tsx
// Good
function MyComponent() {
  const { data, isLoading, error } = useQuery('myData', fetchData);
  
  if (isLoading) return <LoadingIndicator />;
  if (error) return <ErrorDisplay error={error} />;
  if (!data || data.length === 0) return <EmptyState title="No data found" />;
  
  // Render data
}

// Better
function MyComponent() {
  const { data, isLoading, error } = useQuery('myData', fetchData);
  
  return (
    <DataDisplay
      data={data || []}
      isLoading={isLoading}
      error={error}
      renderItem={(item) => <div>{item.name}</div>}
    />
  );
}
```

### Use Virtualization for Large Lists

Use the `VirtualizedList` component for large data sets.

```tsx
// Good
function MyLargeList() {
  const { data } = useQuery('myData', fetchData);
  
  return (
    <VirtualizedList
      data={data || []}
      itemHeight={80}
      height={400}
      renderItem={(item, index, style) => (
        <div style={style}>{item.name}</div>
      )}
    />
  );
}

// Bad
function MyLargeList() {
  const { data } = useQuery('myData', fetchData);
  
  return (
    <div>
      {data?.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

### Use Form Validation

Always use form validation with Zod schemas.

```tsx
// Good
const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
});

// Bad
function validateForm(data) {
  const errors = {};
  if (!data.name) errors.name = 'Name is required';
  if (!data.email) errors.email = 'Email is required';
  return errors;
}
```

### Use Consistent Error Handling

Use the standardized error handling utilities.

```tsx
// Good
import { handleApiError } from '@/core/error';

try {
  await api.createItem(data);
} catch (error) {
  handleApiError(error, 'Failed to create item');
}

// Bad
try {
  await api.createItem(data);
} catch (error) {
  console.error(error);
  toast.error('An error occurred');
}
```
