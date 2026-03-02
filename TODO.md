# 📋 SplitIt - TODO & Roadmap

## ✅ Recently Completed (Session 10)

### High-Value Features Sprint 🎉

- [x] **Activity Feed Service & Components**
  - Real-time activity tracking across groups
  - Activity filtering by type
  - Dashboard activity widget
  - Group detail activity tab
- [x] **Enhanced Dashboard Statistics**

  - Net Balance calculation card
  - Dynamic gradient colors (green/red/gray)
  - Responsive grid layout
  - Secondary stats breakdown

- [x] **Settlement Suggestions Enhancement**

  - Summary stats card (total transactions/amount)
  - Payment tracking with completed overlays
  - Progress percentage display
  - Payment number badges
  - Smart algorithm explanation

- [x] **Global Search Bar**

  - Ctrl/Cmd+K keyboard shortcut
  - Multi-entity search (groups/expenses/users)
  - Debounced search (300ms)
  - Full keyboard navigation
  - Responsive modal design

- [x] **Advanced Expense Filters**

  - Split type filter
  - Amount range slider (dual-thumb)
  - "Created by Me" toggle
  - Active filter counter badge
  - Collapsible advanced filters panel

- [x] **Email Preferences Component**

  - 6 notification type toggles
  - Quick actions (enable/disable all, reset)
  - Test email functionality
  - Change detection & save
  - localStorage persistence
  - Profile settings integration

- [x] **Email Notification Indicators**

  - Payment recording notifications
  - Expense creation notifications
  - Member addition notifications
  - Smart messaging based on preferences

- [x] **Progressive Web App (PWA) Setup**
  - Service worker configuration
  - Offline data caching
  - App manifest with branding
  - Generated app icons (8 sizes)
  - Install prompt component
  - Standalone mode support

---

## 🚧 In Progress

### Testing & Quality

- [ ] Core Service Unit Tests (0% → Target: 80%)
  - [ ] AuthService tests
  - [ ] GroupService tests
  - [ ] ExpenseService tests
  - [ ] SettlementService tests
  - [ ] ActivityService tests
  - [ ] UserService tests

---

## 📅 Planned Features

### Mobile-Specific Enhancements (HIGH PRIORITY)

- [ ] Swipe gestures for common actions
  - [ ] Swipe to delete expense
  - [ ] Swipe to mark payment complete
  - [ ] Swipe between tabs
- [ ] Pull-to-refresh functionality
  - [ ] Dashboard refresh
  - [ ] Group detail refresh
  - [ ] Expenses list refresh
- [ ] Bottom sheets for mobile dialogs
  - [ ] Convert dialogs to bottom sheets on mobile
  - [ ] Smooth slide-up animations
- [ ] Touch-optimized controls
  - [ ] Larger tap targets
  - [ ] Gesture hints

### End-to-End Testing (HIGH PRIORITY)

- [ ] Critical Flow Tests
  - [ ] Login/Register flow
  - [ ] Create group and add members
  - [ ] Add expense and split
  - [ ] Record settlement
  - [ ] Dashboard navigation
  - [ ] Search functionality
  - [ ] Profile settings
- [ ] Cross-browser testing
  - [ ] Chrome/Edge
  - [ ] Firefox
  - [ ] Safari
  - [ ] Mobile browsers

### Performance Optimization (MEDIUM PRIORITY)

- [ ] Bundle size analysis and reduction
- [ ] Image optimization (WebP format)
- [ ] Lazy loading optimization
- [ ] Virtual scrolling for long lists
- [ ] Code splitting improvements
- [ ] Tree shaking verification

### Accessibility Improvements (MEDIUM PRIORITY)

- [ ] Screen reader testing
- [ ] Keyboard navigation audit
- [ ] ARIA labels review
- [ ] Color contrast verification (WCAG AA)
- [ ] Focus management improvements
- [ ] Error message accessibility

### Advanced Features (LOW PRIORITY)

- [ ] Date range filter for expenses
- [ ] Multi-category filter
- [ ] Export expenses to CSV/PDF
- [ ] Recurring expenses
- [ ] Budget limits per category
- [ ] Currency converter integration
- [ ] Split templates for common scenarios

### Analytics Dashboard (DEFERRED)

_Note: Skipped per user request_

- [ ] Spending over time chart
- [ ] Category breakdown pie chart
- [ ] Top spenders list
- [ ] Monthly trends

---

## 🐛 Known Issues

### To Fix

- [ ] Profile layout alignment on very small screens (<320px)
- [ ] Service worker cache invalidation strategy
- [ ] Email preferences - missing backend API integration
- [ ] Settlement dialog - animation performance on low-end devices

### To Investigate

- [ ] Occasional search delay on first open
- [ ] PWA install prompt timing optimization
- [ ] Amount range slider step precision

---

## 💡 Future Enhancements

### User Requests

- [ ] Dark mode support
- [ ] Multiple currency support in single group
- [ ] Bill scanning with OCR
- [ ] Receipt photo attachments
- [ ] Push notifications (web push API)
- [ ] Group chat/comments
- [ ] Expense categories customization
- [ ] Payment reminders automation

### Technical Debt

- [ ] Migrate from localStorage to IndexedDB
- [ ] Implement state management library (NgRx/Akita)
- [ ] Add Storybook for component documentation
- [ ] Set up CI/CD pipeline
- [ ] Implement feature flags
- [ ] Add error tracking (Sentry/LogRocket)

### Developer Experience

- [ ] Improve dev server hot reload speed
- [ ] Add more comprehensive type definitions
- [ ] Create component generator schematics
- [ ] Document component APIs
- [ ] Add performance monitoring

---

## 📊 Progress Tracking

### Feature Completion: 10/15 (67%)

- Activity Features: ✅ 100%
- Dashboard Enhancements: ✅ 100%
- Search & Filters: ✅ 100%
- User Preferences: ✅ 100%
- PWA Features: ✅ 100%
- Mobile Enhancements: ⏳ 0%
- Testing: ⏳ 0%

### Code Quality Metrics (Target)

- Unit Test Coverage: 0% → 80%
- E2E Test Coverage: 0% → 70%
- TypeScript Strict: ✅ Enabled
- Linting: ✅ Passing
- Accessibility Score: 85% → 95%
- Performance Score: 90% → 95%

---

## 🎯 Sprint Planning

### Sprint 11 (Next) - Testing & Quality

**Duration**: 1-2 days
**Focus**: Test coverage and quality assurance

**Goals**:

- [ ] Write unit tests for core services (80% coverage)
- [ ] Set up E2E testing framework (Playwright/Cypress)
- [ ] Write critical flow E2E tests
- [ ] Fix any bugs discovered during testing

### Sprint 12 - Mobile Polish

**Duration**: 1-2 days
**Focus**: Mobile-specific enhancements

**Goals**:

- [ ] Implement swipe gestures
- [ ] Add pull-to-refresh
- [ ] Convert dialogs to bottom sheets
- [ ] Test on actual mobile devices

### Sprint 13 - Performance & Optimization

**Duration**: 1 day
**Focus**: Performance improvements

**Goals**:

- [ ] Bundle size optimization
- [ ] Lazy loading improvements
- [ ] Virtual scrolling for lists
- [ ] Image optimization

---

## 📝 Notes

### Recent Decisions

- ✅ Skipped analytics charts per user request
- ✅ Implemented PWA for offline support
- ✅ Used localStorage for email preferences (will migrate to IndexedDB later)
- ✅ Chose Material Design for consistent UI

### Dependencies Updated

- @angular/pwa: 20.3.8
- @angular/service-worker: 20.3.9

### Breaking Changes

- None

---

**Last Updated**: Session 10 - High-Value Features Sprint
**Next Review**: After Sprint 11 (Testing)
