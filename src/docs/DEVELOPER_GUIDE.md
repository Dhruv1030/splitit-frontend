# Developer Quick Reference Guide

## 🔥 Quick Start: Using the New Components

### 1. Toast Notifications

Replace any `alert()` calls with toast notifications:

```typescript
// Inject the service
private toastService = inject(ToastService);

// Success (green, 3 seconds)
this.toastService.success('Group created successfully!');

// Error (red, 5 seconds)
this.toastService.error('Failed to load data. Please try again.');

// Warning (orange, 4 seconds)
this.toastService.warning('Please fill all required fields');

// Info (blue, 3 seconds)
this.toastService.info('Create a group first to add expenses');

// Custom with action button
this.toastService.showWithAction(
  'Changes saved',
  'Undo',
  () => this.undoChanges(),
  5000 // duration in ms
);
```

**Import**: Already provided in `root`, just inject `ToastService`

---

### 2. Breadcrumbs

Already integrated in the layout - **no code changes needed!**

Breadcrumbs automatically appear on all routes. To customize labels:

```typescript
// In your route configuration (app.routes.ts)
{
  path: 'groups/:id',
  component: GroupDetailComponent,
  data: { breadcrumb: 'Group Details' } // Custom label
}
```

**Default behavior**: Converts route paths to readable labels

- `groups` → "Groups"
- `expenses` → "Expenses"
- `5` (numeric) → "#5"
- `my-profile` → "My Profile"

---

### 3. Skeleton Loaders

Replace `mat-spinner` with skeleton loaders in your templates:

```html
<!-- Before -->
<div *ngIf="loading">
  <mat-spinner></mat-spinner>
</div>

<!-- After -->
<div *ngIf="loading">
  <app-skeleton-loader type="expense-card" [count]="6"></app-skeleton-loader>
</div>
```

**Available Types**:

| Type           | Use Case                | Preview                                |
| -------------- | ----------------------- | -------------------------------------- |
| `text`         | Loading text/paragraphs | Simple lines                           |
| `card`         | Loading generic cards   | Header + content + footer              |
| `list`         | Loading list items      | Avatar + 2 text lines                  |
| `table`        | Loading table rows      | 4-column grid                          |
| `expense-card` | Loading expense cards   | Header (title + amount) + body + chips |
| `group-card`   | Loading group cards     | Icon + title + description + badges    |

**Options**:

```html
<app-skeleton-loader type="text" <!-- Required -->
  [count]="5"
  <!-- Number of skeleton items (default: 1) -->
  width="80%"
  <!-- Custom width (default: 100%) -->
  height="20px"
  <!-- Custom height (default: auto) -->
  ></app-skeleton-loader
>
```

**Import in your component**:

```typescript
import { SkeletonLoaderComponent } from '../../../shared/skeleton-loader/skeleton-loader';

@Component({
  imports: [SkeletonLoaderComponent, ...]
})
```

---

## 📦 File Locations

```
src/app/
├── core/
│   └── services/
│       └── toast.service.ts          # Toast notification service
└── shared/
    ├── breadcrumb/
    │   ├── breadcrumb.ts              # Breadcrumb component
    │   ├── breadcrumb.html            # Breadcrumb template
    │   └── breadcrumb.scss            # Breadcrumb styles
    └── skeleton-loader/
        ├── skeleton-loader.ts         # Skeleton loader component
        ├── skeleton-loader.html       # Skeleton loader templates
        └── skeleton-loader.scss       # Skeleton loader animations
```

---

## 🎨 Customization

### Toast Colors (in `src/styles.scss`)

```scss
.toast-success {
  background-color: #10b981;
} // Green
.toast-error {
  background-color: #ef4444;
} // Red
.toast-warning {
  background-color: #f59e0b;
} // Orange
.toast-info {
  background-color: #3b82f6;
} // Blue
```

### Breadcrumb Styling (in `src/app/shared/breadcrumb/breadcrumb.scss`)

```scss
.breadcrumb-link {
  color: var(--primary-color, #6366f1);
  // Customize hover, focus, etc.
}
```

### Skeleton Animation Speed (in `src/app/shared/skeleton-loader/skeleton-loader.scss`)

```scss
@keyframes loading {
  // Change animation duration from 1.5s to your preference
  animation: loading 1s ease-in-out infinite;
}
```

---

## 🧪 Testing Examples

### Testing Toasts

```typescript
it('should show success toast', () => {
  const toastSpy = jasmine.createSpyObj('ToastService', ['success']);

  component.onSubmit();

  expect(toastSpy.success).toHaveBeenCalledWith('Expense created successfully!');
});
```

### Testing Skeleton Visibility

```typescript
it('should show skeleton loaders while loading', () => {
  component.loading = true;
  fixture.detectChanges();

  const skeleton = fixture.nativeElement.querySelector('app-skeleton-loader');
  expect(skeleton).toBeTruthy();
});
```

---

## 🚨 Common Issues

### Toast not appearing?

- ✅ Check that `provideAnimations()` is in `app.config.ts` (already added)
- ✅ Verify `ToastService` is injected correctly
- ✅ Check browser console for errors

### Breadcrumbs showing wrong labels?

- ✅ Add `data: { breadcrumb: 'Custom Label' }` to route config
- ✅ Check route structure in `app.routes.ts`

### Skeleton not matching content?

- ✅ Use the right skeleton type (e.g., `expense-card` for expenses)
- ✅ Adjust `count` to match expected items
- ✅ Customize `width` and `height` if needed

---

## 💡 Pro Tips

### 1. Toast Actions are Powerful

Use action buttons for undo functionality:

```typescript
deleteGroup(groupId: number) {
  const deletedGroup = this.groups.find(g => g.id === groupId);
  this.groups = this.groups.filter(g => g.id !== groupId);

  this.toastService.showWithAction(
    'Group deleted',
    'Undo',
    () => {
      this.groups.push(deletedGroup); // Restore the group
    },
    5000
  );
}
```

### 2. Skeleton Loaders Should Match Content

Always use skeletons that match your actual content layout for the best UX.

### 3. Custom Breadcrumb Labels

For dynamic pages (like group details), set breadcrumb labels in route data:

```typescript
{
  path: 'groups/:id',
  component: GroupDetailComponent,
  data: { breadcrumb: 'Group Details' }
}
```

---

## 📚 More Examples

Check these files for real-world usage:

- `src/app/features/expenses/expense-form-dialog/expense-form-dialog.ts` - Toast usage
- `src/app/features/expenses/expenses-list/expenses-list.html` - Skeleton loaders
- `src/app/shared/layout/layout.html` - Breadcrumb integration

---

## 🔗 Related Documentation

- [UI/UX Improvements Summary](./UI_UX_IMPROVEMENTS.md)
- [Testing Guide](./TESTING_GUIDE.md)
- [Responsive Design System](./RESPONSIVE_DESIGN_SYSTEM.md)

---

**Happy Coding! 🚀**
