# SplitIt Frontend - Implementation Checklist

## ✅ Phase 1: Foundation (Completed)

- [x] Setup Angular Project
- [x] Configure Environment & Proxy
- [x] Create Core Structure (Models, Interceptors, Guards, Services)
- [x] Implement JWT Interceptor
- [x] Implement Auth Guard
- [x] Create Auth Service
- [x] Create Login Component

---

## � Phase 2: Authentication Complete & Core Services (CURRENT)

---

## 🚀 Phase 2: Authentication Complete & Core Services (CURRENT)

### 2.1 Register Component ⏳

- [ ] Create register component structure (`features/auth/register/`)
- [ ] Build reactive form (email, password, confirmPassword, name, phone, defaultCurrency)
- [ ] Add password match validation
- [ ] Implement currency dropdown (USD, EUR, INR, GBP, etc.)
- [ ] Add form submission with AuthService
- [ ] Auto-login after successful registration
- [ ] Style with Material Design matching login page

### 2.2 Core Services 🔧

- [ ] **Group Service** (`core/services/group.service.ts`)
  - getUserGroups(), getGroup(id), createGroup(), updateGroup(), deleteGroup()
  - addMember(), removeMember(), getGroupBalance()
- [ ] **Expense Service** (`core/services/expense.service.ts`)
  - createExpense(), getGroupExpenses(), getUserExpenses()
  - updateExpense(), deleteExpense(), getExpenseDetails()
  - getUserBalance()
- [ ] **Settlement Service** (`core/services/settlement.service.ts`)

  - getGroupSettlements(), getUserSettlements()
  - recordSettlement(), getSettlementsByDateRange()
  - getPendingSettlements()

- [ ] **User Service** (`core/services/user.service.ts`)
  - searchUsers(), getUserProfile(), updateProfile()
  - getUsersByGroup()

### 2.3 Shared Layout Components 🎨

- [ ] **Main Layout Component** (`shared/layout/`)
  - Container with navbar, sidebar, and router-outlet
  - Responsive design (collapse sidebar on mobile)
- [ ] **Navbar Component** (`shared/navbar/`)
  - Logo and app title
  - User profile dropdown (name, avatar, logout)
  - Notifications icon (future feature)
- [ ] **Sidebar Component** (`shared/sidebar/`)
  - Navigation menu: Dashboard, Groups, Expenses, Settlements, Profile
  - Active route highlighting
  - Collapsible on mobile

### 2.4 Routing Configuration 🛣️

- [ ] Configure app.routes.ts with all routes
  - Public: /login, /register (redirect if authenticated)
  - Protected: /dashboard, /groups, /groups/:id, /expenses, /settlements, /profile
  - Default redirect: / → /dashboard or /login
  - 404 Not Found page

---

## 📦 Phase 3: Dashboard & Groups Feature

### 3.1 Dashboard Component 📊

- [ ] Create dashboard component (`features/dashboard/`)
- [ ] Display summary cards:
  - Total groups count
  - Total expenses this month
  - Amount you owe (in red)
  - Amount you're owed (in green)
- [ ] Recent activity feed (last 10 transactions)
- [ ] Quick action buttons
- [ ] Balance chart (optional - Chart.js or ng2-charts)

### 3.2 Groups Feature 👥

- [ ] **Groups List Component** (`features/groups/groups-list/`)
  - Display groups in Material Cards grid
  - Show: name, category icon, member count, total expenses
  - Search/filter functionality
  - "Create Group" FAB button
  - Empty state illustration
- [ ] **Group Detail Component** (`features/groups/group-detail/`)
  - Group header with edit/delete buttons
  - Members section with add/remove functionality
  - Recent expenses list (last 10)
  - Balance summary for current user
  - Tabs: Overview, Expenses, Settlements, Members
- [ ] **Group Form Dialog** (`features/groups/group-form/`)
  - Material Dialog for create/edit
  - Fields: name*, description, category*, currency\*
  - Category options: TRIP, HOME, COUPLE, OTHER
  - Form validation
- [ ] **Add Member Dialog** (`features/groups/add-member-dialog/`)
  - Search users by email
  - Display search results
  - Add member to group

---

## 💰 Phase 4: Expenses Feature

### 4.1 Expenses List Component 📝

- [ ] Create expenses list (`features/expenses/expenses-list/`)
- [ ] Display all user expenses across groups
- [ ] Filter by: group, date range, category
- [ ] Sort by: date, amount
- [ ] Show: description, amount, group, paidBy, date, status
- [ ] "Add Expense" FAB button

### 4.2 Expense Form Component 💵

- [ ] Create expense form dialog (`features/expenses/expense-form/`)
- [ ] Basic fields: description*, amount*, currency*, category*, date
- [ ] Category dropdown: FOOD, TRANSPORT, ACCOMMODATION, ENTERTAINMENT, UTILITIES, OTHER
- [ ] Select group\* (dropdown of user's groups)
- [ ] Select paidBy\* (user from group members)
- [ ] Split configuration:
  - Split type: EQUAL, EXACT, PERCENTAGE, SHARES
  - Participants selection (multi-select checkboxes)
  - For EXACT: Input exact amounts for each participant
  - For PERCENTAGE: Input percentages for each participant
  - For SHARES: Input share numbers for each participant
- [ ] Real-time split calculation display
- [ ] Validation: ensure splits sum correctly

### 4.3 Expense Detail Component 🔍

- [ ] Create expense detail view (`features/expenses/expense-detail/`)
- [ ] Display full expense information
- [ ] Show split breakdown for all participants
- [ ] Display who paid and who owes whom
- [ ] Edit/Delete buttons (only if user created it)
- [ ] Comment/note section (future feature)

---

## 🤝 Phase 5: Settlements Feature

### 5.1 Settlements Component 💸

- [ ] Create settlements component (`features/settlements/`)
- [ ] Display all settlements for user
- [ ] Group by: group, date
- [ ] Show: paidBy, paidTo, amount, date, group
- [ ] Filter by group and date range

### 5.2 Settle Up Dialog 💳

- [ ] Create settle up dialog (`features/settlements/settle-up-dialog/`)
- [ ] Select group
- [ ] Display suggested settlements (who owes whom)
- [ ] Select paidBy (current user usually)
- [ ] Select paidTo (person being paid)
- [ ] Enter amount
- [ ] Optional note field
- [ ] Record settlement with backend

### 5.3 Group Balance View 📈

- [ ] Create balance summary component
- [ ] Display overall balance in a group
- [ ] Show simplified debts (minimal transactions)
- [ ] "Settle Up" button to record settlements
- [ ] Visual representation (optional)

---

## 👤 Phase 6: User Profile & Settings

### 6.1 Profile Component 🔧

- [ ] Create profile component (`features/profile/`)
- [ ] Display user information (name, email, phone, currency)
- [ ] Edit profile form
- [ ] Change password functionality
- [ ] Update user settings
- [ ] Profile avatar upload (optional)

### 6.2 Settings ⚙️

- [ ] Default currency preference
- [ ] Notification preferences (future)
- [ ] Language selection (future)
- [ ] Theme toggle (light/dark mode) (optional)

---

## 🎨 Phase 7: UI/UX Enhancements

### 7.1 Shared Components 🧩

- [ ] Loading spinner component
- [ ] Empty state component (generic)
- [ ] Confirmation dialog component (generic)
- [ ] Toast notifications (ngx-toastr integration)
- [ ] Currency formatter pipe
- [ ] Date formatter pipe
- [ ] Avatar component with initials fallback

### 7.2 Error Handling 🚨

- [ ] Global error handler
- [ ] 404 Not Found page
- [ ] 403 Forbidden page
- [ ] Network error handling
- [ ] User-friendly error messages

### 7.3 Animations & Polish ✨

- [ ] Add route transition animations
- [ ] Loading states for all async operations
- [ ] Skeleton loaders for lists
- [ ] Smooth scroll behaviors
- [ ] Mobile responsive refinements

---

## 🧪 Phase 8: Testing & Optimization

### 8.1 Testing 🧪

- [ ] Unit tests for services
- [ ] Unit tests for components
- [ ] Integration tests for critical flows
- [ ] E2E tests (login, create group, add expense)

### 8.2 Performance 🚀

- [ ] Lazy loading for feature modules
- [ ] Image optimization
- [ ] Bundle size optimization
- [ ] Lighthouse audit and improvements

---

## 🚢 Phase 9: Deployment

### 9.1 Build & Deploy 🌐

- [ ] Configure production environment
- [ ] Build optimization (AOT, minification)
- [ ] Setup CI/CD pipeline
- [ ] Deploy to hosting (Netlify/Vercel/Firebase)
- [ ] Configure custom domain
- [ ] SSL certificate

### 9.2 Documentation 📚

- [ ] README with setup instructions
- [ ] API integration documentation
- [ ] Component documentation
- [ ] Deployment guide

---

## 🔮 Future Enhancements (Optional)

- [ ] PWA support (offline functionality)
- [ ] Push notifications
- [ ] Multi-language support (i18n)
- [ ] Dark mode theme
- [ ] Export reports (PDF/CSV)
- [ ] Advanced analytics dashboard
- [ ] Social features (activity feed, comments)
- [ ] Receipt image upload
- [ ] Recurring expenses
- [ ] Bill splitting by percentage
- [ ] Currency conversion API integration

---

## 📝 Current Priority Order:

1. ✅ Register Component (complete auth flow)
2. ✅ Core Services (Group, Expense, Settlement, User)
3. ✅ Layout Components (Navbar, Sidebar, Main Layout)
4. ✅ Routing Configuration
5. ✅ Dashboard Component
6. ✅ Groups Feature (List, Detail, Form)
7. ✅ Expenses Feature (List, Form, Detail)
8. ✅ Settlements Feature
9. ✅ Profile & Settings
10. ✅ UI/UX Enhancements

---

**Let's start building! 🚀**
