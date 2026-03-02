# 🚀 Deployment & Testing Guide - SplitIt

## 📦 Production Build & Deployment

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Backend services running (see BACKEND_FIXES_COMPLETED.md)

### Build for Production

```bash
# Navigate to project directory
cd /Users/dhruvpatel/Desktop/splitit-frontend

# Install dependencies (if not already installed)
npm install

# Build for production with service worker
npm run build -- --configuration production

# Output will be in: dist/splitit-frontend/browser/
```

### Serve Production Build Locally

```bash
# Install http-server globally (one-time setup)
npm install -g http-server

# Serve the production build
npx http-server -p 8080 -c-1 dist/splitit-frontend/browser

# Access at: http://localhost:8080
```

### PWA Testing

The Progressive Web App features (service worker, offline support, install prompt) **only work in production builds**:

1. Build for production: `npm run build -- --configuration production`
2. Serve with HTTP server: `npx http-server -p 8080 -c-1 dist/splitit-frontend/browser`
3. Open in Chrome/Edge: `http://localhost:8080`
4. Open DevTools → Application → Service Workers
5. Verify service worker is registered and active
6. Test offline mode:
   - DevTools → Network → Toggle "Offline"
   - Reload page (should load from cache)
   - Navigate to groups/expenses (should load from cache)

### Install Prompt Testing

1. Open application in Chrome (production build)
2. Wait 5 seconds for install prompt to appear
3. Click "Install" button
4. Verify app opens in standalone window
5. Check home screen icon is added

---

## 🧪 Testing Guide

### Manual Testing Checklist

#### ✅ Email Preferences Component

**Route**: `/profile/email-preferences`

**Test Cases**:

1. Navigate to Profile → Settings → Email Preferences
2. Toggle each notification type (6 total)
3. Click "Enable All" → Verify all toggles turn on
4. Click "Disable All" → Verify all toggles turn off
5. Click "Reset to Defaults" → Verify defaults restored
6. Make changes → Verify "Save Changes" button appears
7. Click "Save Changes" → Verify toast success message
8. Click "Send Test Email" → Verify loading state and success message
9. Refresh page → Verify settings persisted from localStorage

**Expected Behavior**:

- All toggles respond immediately
- Changes are detected (hasChanges() method)
- Save button only appears when changes exist
- localStorage updates on save
- Test email shows loading state

---

#### ✅ Email Notification Indicators

**Test Case 1: Record Payment**

1. Navigate to any group with settlements
2. Open settlement dialog
3. Click "Record Payment" on any suggestion
4. Fill payment details and submit
5. **Expected**: Toast message shows "Payment recorded successfully! Email notification sent to [recipient]." (if email preferences enabled)

**Test Case 2: Create Expense**

1. Navigate to any group
2. Click "Add Expense" button
3. Fill expense details with multiple participants
4. Submit expense
5. **Expected**: Toast message shows "Expense created successfully! Email notifications sent to X member(s)." (if email preferences enabled)

**Test Case 3: Add Member**

1. Navigate to any group
2. Click "Add Member" button
3. Search and select a user
4. **Expected**: Toast message shows "Member added successfully! Invitation email sent." (if email preferences enabled)

---

#### ✅ Enhanced Dashboard Statistics

**Route**: `/dashboard`

**Test Cases**:

1. Navigate to dashboard
2. Verify Net Balance card displays correctly
3. Check color coding:
   - **Positive balance** (you're owed): Green gradient
   - **Negative balance** (you owe): Red gradient
   - **Zero balance** (settled): Gray gradient
4. Verify Math.abs() displays absolute value correctly
5. Check responsive layout on mobile (grid changes to 1 column)

**Expected Behavior**:

- Net balance = amountOwing - amountOwed
- Color changes dynamically based on balance
- Responsive grid on mobile devices

---

#### ✅ Settlement Suggestions Enhancement

**Route**: `/groups/:id` (Groups tab)

**Test Cases**:

1. Navigate to group with unsettled balances
2. Open settlement dialog
3. Verify summary stats card shows:
   - Total transactions count
   - Total amount to settle
4. Record a payment
5. Verify payment is marked as completed (checkmark overlay)
6. Verify payment counter decreases
7. Check progress percentage updates

**Expected Behavior**:

- Completed payments show checkmark animation
- Summary stats update after payment
- Auto-refresh after 500ms delay
- Progress bar shows completion percentage

---

#### ✅ Global Search Bar

**Test Cases**:

1. **Keyboard Shortcut**: Press Ctrl+K (Cmd+K on Mac)
2. Verify search dialog opens
3. Type search query (debounced 300ms)
4. Verify results show across:
   - Groups (with member count)
   - Expenses (with amount)
   - Users (with email)
5. **Keyboard Navigation**:
   - Press Arrow Down → First result selected
   - Press Arrow Up → Previous result
   - Press Enter → Navigate to selected result
   - Press Esc → Close dialog
6. Click result → Verify navigation
7. Click outside → Verify dialog closes

**Expected Behavior**:

- Search debounces for 300ms
- Results grouped by type
- Keyboard shortcuts work
- Empty state shows when no results
- Initial state shows keyboard hints

---

#### ✅ Advanced Expense Filters

**Route**: `/groups/:id/expenses` or `/expenses`

**Test Cases**:

1. Navigate to expenses list
2. Verify filter header with badge (shows active filter count)
3. Click "Advanced Filters" button → Panel expands
4. **Split Type Filter**:
   - Select "Equal" → Verify only equal-split expenses shown
   - Select "Exact" → Verify only exact-amount expenses shown
   - Select "All" → Verify all expenses shown
5. **Amount Range Slider**:
   - Drag start thumb → Verify min amount updates
   - Drag end thumb → Verify max amount updates
   - Verify range display updates
6. **Created By Me Filter**:
   - Toggle on → Verify only user's expenses shown
   - Toggle off → Verify all expenses shown
7. Click "Clear All Filters" → Verify all filters reset
8. Verify active filter count badge updates

**Expected Behavior**:

- Filters apply immediately
- Active filter count accurate
- Amount range auto-calculates from data
- Collapsible panel animates smoothly

---

#### ✅ PWA Features

**Test Cases**:

1. Build for production: `npm run build -- --configuration production`
2. Serve: `npx http-server -p 8080 -c-1 dist/splitit-frontend/browser`
3. Open in Chrome: `http://localhost:8080`
4. Wait 5 seconds → Verify install prompt appears
5. Click "Install" → Verify app installs
6. Check home screen → Verify icon added
7. Open installed app → Verify standalone mode
8. **Offline Testing**:
   - DevTools → Network → Offline
   - Reload page → Verify loads from cache
   - Navigate to groups → Verify data from cache
   - Try to create expense → Verify offline message

**Expected Behavior**:

- Install prompt shows after 5 seconds (if not dismissed)
- App installs to home screen
- Runs in standalone mode
- Service worker caches API responses
- Offline data access works

---

### Unit Testing (TODO)

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Target: 80% coverage for core services
```

**Services to Test**:

- AuthService
- GroupService
- ExpenseService
- SettlementService
- ActivityService
- UserService

---

### E2E Testing (TODO)

```bash
# Install Playwright (or Cypress)
npm install -D @playwright/test

# Run E2E tests
npm run e2e

# Run in headed mode
npm run e2e:headed
```

**Critical Flows to Test**:

1. User registration and login
2. Create group and add members
3. Add expense and split
4. Record settlement
5. Dashboard navigation
6. Global search
7. Email preferences

---

## 🌐 Browser Compatibility

### Desktop Browsers

- ✅ Chrome 90+ (Recommended)
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+

### Mobile Browsers

- ✅ Chrome Mobile (Android)
- ✅ Safari Mobile (iOS 14+)
- ✅ Samsung Internet
- ✅ Firefox Mobile

### PWA Support

- ✅ Chrome/Edge (Full support)
- ⚠️ Safari (Limited - no install prompt)
- ⚠️ Firefox (Limited - manual install)

---

## 🔧 Troubleshooting

### Service Worker Not Registering

**Symptoms**: PWA features not working, install prompt not showing

**Solutions**:

1. Ensure production build: `npm run build -- --configuration production`
2. Clear browser cache and service workers
3. Check DevTools → Application → Service Workers
4. Verify `ngsw-worker.js` exists in dist folder
5. Serve over HTTPS or localhost (required for service workers)

### Email Preferences Not Persisting

**Symptoms**: Settings reset after page reload

**Solutions**:

1. Check localStorage in DevTools → Application → Local Storage
2. Verify key 'emailPreferences' exists
3. Clear localStorage and re-save preferences
4. Check browser privacy settings (incognito may block localStorage)

### Install Prompt Not Showing

**Symptoms**: PWA install banner never appears

**Solutions**:

1. Clear localStorage key 'pwa-install-dismissed'
2. Check if already installed (standalone mode)
3. Verify `beforeinstallprompt` event fires (DevTools console)
4. Try different browser (Chrome recommended)
5. Wait at least 5 seconds after page load

### Offline Mode Not Working

**Symptoms**: App doesn't load when offline

**Solutions**:

1. Verify service worker is active (DevTools → Application)
2. Check cache storage has entries (DevTools → Application → Cache Storage)
3. Ensure production build with service worker
4. Clear cache and reload when online
5. Check `ngsw-config.json` dataGroups configuration

---

## 📊 Performance Benchmarks

### Target Metrics (Lighthouse)

- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+
- PWA: 100 (Installable)

### Bundle Sizes (Production)

- Initial Bundle: ~500KB (gzipped)
- Lazy Loaded Routes: ~50-100KB each
- Total Transfer: ~800KB - 1MB

### Load Times (3G)

- First Contentful Paint: <2s
- Time to Interactive: <4s
- Largest Contentful Paint: <3s

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (unit + E2E)
- [ ] No console errors in production build
- [ ] Service worker configured correctly
- [ ] Environment variables set for production API
- [ ] Build size optimized (<1MB total)
- [ ] Lighthouse score meets targets
- [ ] Cross-browser testing complete
- [ ] Mobile testing on real devices
- [ ] Accessibility audit passed

### Deployment Steps

1. Update version in package.json
2. Build for production: `npm run build -- --configuration production`
3. Test production build locally
4. Deploy to hosting (Netlify/Vercel/Firebase)
5. Verify deployment URL works
6. Test PWA features on deployed site
7. Monitor error logs (if error tracking setup)

### Post-Deployment

- [ ] Verify all routes accessible
- [ ] Test user flows on production
- [ ] Check service worker updates
- [ ] Monitor performance metrics
- [ ] Gather user feedback

---

## 📝 Environment Variables

### Development (.env or environment.ts)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  enableDebugLog: true,
};
```

### Production (environment.prod.ts)

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api.com/api',
  enableDebugLog: false,
};
```

---

## 🎯 Quick Commands Reference

```bash
# Development
npm start                              # Start dev server (localhost:4200)
npm test                               # Run unit tests
npm run lint                           # Run linter

# Production
npm run build -- --configuration production    # Production build
npx http-server -p 8080 -c-1 dist/splitit-frontend/browser   # Serve production

# Testing
npm run test:coverage                  # Unit tests with coverage
npm run e2e                            # E2E tests (when setup)

# Utilities
ng generate component <name>          # Generate component
ng generate service <name>             # Generate service
ng add @angular/pwa                    # Add PWA support (already done)
```

---

**Last Updated**: Session 10 - Post High-Value Features Sprint
**Next Action**: Run manual tests using this guide
