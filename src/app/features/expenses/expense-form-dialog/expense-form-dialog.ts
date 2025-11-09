import { Component, OnInit, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ExpenseService } from '../../../core/services/expense.service';
import { UserService } from '../../../core/services/user.service';
import { GroupService } from '../../../core/services/group.service';
import { ToastService } from '../../../core/services/toast.service';
import { CreateExpenseRequest } from '../../../core/models/expense.model';

interface GroupMember {
  userId: string;
  name: string;
  role: string;
}

interface Group {
  id: number;
  name: string;
  members: string[] | GroupMember[]; // Can be either format
  currency: string;
}

interface DialogData {
  groupId?: number;
  members?: GroupMember[];
  groups?: Group[]; // For dashboard mode
  expense?: any;
}

@Component({
  selector: 'app-expense-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatIconModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './expense-form-dialog.html',
  styleUrls: ['./expense-form-dialog.scss'],
})
export class ExpenseFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private expenseService = inject(ExpenseService);
  private groupService = inject(GroupService);
  private dialogRef = inject(MatDialogRef<ExpenseFormDialogComponent>);
  private toastService = inject(ToastService);

  data = inject<DialogData>(MAT_DIALOG_DATA, { optional: true }) || { groups: [] };

  expenseForm: FormGroup;
  isEditMode = false;
  loading = false;
  
  // For dashboard mode
  isDashboardMode = false;
  availableGroups: Group[] = [];
  selectedGroupMembers: GroupMember[] = [];

  categories = [
    { value: 'FOOD', label: 'Food & Drinks', icon: 'restaurant' },
    { value: 'TRAVEL', label: 'Travel', icon: 'flight' },
    { value: 'ENTERTAINMENT', label: 'Entertainment', icon: 'movie' },
    { value: 'SHOPPING', label: 'Shopping', icon: 'shopping_bag' },
    { value: 'HOUSING', label: 'Housing', icon: 'home' },
    { value: 'UTILITIES', label: 'Utilities', icon: 'bolt' },
    { value: 'OTHER', label: 'Other', icon: 'category' },
  ];

  splitTypes = [
    { value: 'EQUAL', label: 'Equal Split', description: 'Split equally among all participants' },
    { value: 'EXACT', label: 'Exact Amounts', description: 'Specify exact amount for each person' },
    { value: 'PERCENTAGE', label: 'Percentage Split', description: 'Split by percentage' },
  ];

  constructor() {
    // Determine mode
    this.isDashboardMode = !!this.data.groups;
    this.availableGroups = this.data.groups || [];
    
    this.expenseForm = this.fb.group({
      groupId: [this.data.groupId || '', this.isDashboardMode ? Validators.required : []], // Required in dashboard mode
      description: ['', [Validators.required, Validators.minLength(3)]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      currency: ['USD', Validators.required],
      category: ['FOOD', Validators.required],
      paidBy: ['', Validators.required],
      splitType: ['EQUAL', Validators.required],
      notes: [''],
      receiptUrl: [''],
      participants: [[]],
      exactAmounts: this.fb.array([]),
      percentages: this.fb.array([]),
    });

    this.isEditMode = !!this.data.expense;
    
    // Listen to group selection changes in dashboard mode
    if (this.isDashboardMode) {
      this.expenseForm.get('groupId')?.valueChanges.subscribe((groupId) => {
        this.onGroupSelected(groupId);
      });
    }
  }

  ngOnInit(): void {
    // Debug: Check if members data is being passed correctly
    console.log('ExpenseFormDialog - data.members:', this.data.members);
    console.log('ExpenseFormDialog - groupId:', this.data.groupId);
    console.log('ExpenseFormDialog - isDashboardMode:', this.isDashboardMode);
    console.log('ExpenseFormDialog - availableGroups:', this.availableGroups);
    
    // Set default payer to current user if available
    const currentUserId = localStorage.getItem('userId');
    if (currentUserId && !this.isEditMode) {
      this.expenseForm.patchValue({ paidBy: currentUserId });
      // Disable payer field - users can only create expenses they paid for
      this.expenseForm.get('paidBy')?.disable();
      
      // Default: all members participate (only if we have members)
      if (this.data.members && this.data.members.length > 0) {
        this.expenseForm.patchValue({ 
          participants: this.data.members.map(m => m.userId) 
        });
      }
    }

    if (this.isEditMode && this.data.expense) {
      this.loadExpenseData();
    }

    // Listen to split type changes
    this.expenseForm.get('splitType')?.valueChanges.subscribe((type) => {
      this.onSplitTypeChange(type);
    });

    // Listen to participants changes
    this.expenseForm.get('participants')?.valueChanges.subscribe(() => {
      this.updateSplitArrays();
    });
  }

  loadExpenseData(): void {
    const expense = this.data.expense;
    this.expenseForm.patchValue({
      description: expense.description,
      amount: expense.amount,
      currency: expense.currency,
      category: expense.category,
      paidBy: expense.paidBy,
      splitType: expense.splitType,
      notes: expense.notes || '',
      receiptUrl: expense.receiptUrl || '',
    });
  }

  onGroupSelected(groupId: number): void {
    const selectedGroup = this.availableGroups.find(g => g.id === groupId);
    if (!selectedGroup) return;
    
    // Update currency based on selected group
    this.expenseForm.patchValue({ currency: selectedGroup.currency });
    
    // Fetch full group details to get member information
    this.loading = true;
    this.groupService.getGroup(groupId).subscribe({
      next: (response) => {
        this.loading = false;
        const groupDetail = response.data as any;
        
        console.log('Fetched group details:', groupDetail);
        
        // Backend now returns members with userId, name, email, and role
        if (groupDetail.members && Array.isArray(groupDetail.members)) {
          this.selectedGroupMembers = groupDetail.members.map((m: any) => ({
            userId: m.userId,
            name: m.name || m.email || m.userId, // Use name, fallback to email or userId
            role: m.role || 'MEMBER'
          }));
          console.log('Selected group members with names:', this.selectedGroupMembers);
          
          // Auto-select current user as payer if they're a member
          const currentUserId = localStorage.getItem('userId');
          if (currentUserId) {
            const isMember = this.selectedGroupMembers.some(m => m.userId === currentUserId);
            if (isMember) {
              this.expenseForm.patchValue({ paidBy: currentUserId });
              // Disable payer field - users can only create expenses they paid for
              this.expenseForm.get('paidBy')?.disable();
            }
          }
          
          // Auto-select all members as participants for equal split
          const allParticipantIds = this.selectedGroupMembers.map(m => m.userId);
          this.expenseForm.patchValue({ participants: allParticipantIds });
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error fetching group details:', error);
        this.toastService.error('Failed to load group members');
      }
    });
  }  getMemberName(userId: string): string {
    // Try data.members first (group detail mode)
    let member = this.data.members?.find(m => m.userId === userId);
    if (member) return member.name;
    
    // Try selectedGroupMembers (dashboard mode)
    member = this.selectedGroupMembers.find(m => m.userId === userId);
    return member ? member.name : userId;
  }

  onSplitTypeChange(splitType: string): void {
    this.updateSplitArrays();
  }

  updateSplitArrays(): void {
    const splitType = this.expenseForm.get('splitType')?.value;
    const participants = this.expenseForm.get('participants')?.value || [];
    const amount = this.expenseForm.get('amount')?.value || 0;

    // Clear arrays
    const exactAmounts = this.expenseForm.get('exactAmounts') as FormArray;
    const percentages = this.expenseForm.get('percentages') as FormArray;
    exactAmounts.clear();
    percentages.clear();

    if (splitType === 'EXACT') {
      participants.forEach((userId: string) => {
        exactAmounts.push(
          this.fb.group({
            userId: [userId],
            amount: [0, [Validators.required, Validators.min(0)]],
          })
        );
      });
    } else if (splitType === 'PERCENTAGE') {
      const equalPercentage = participants.length > 0 ? (100 / participants.length).toFixed(2) : 0;
      participants.forEach((userId: string) => {
        percentages.push(
          this.fb.group({
            userId: [userId],
            percentage: [equalPercentage, [Validators.required, Validators.min(0), Validators.max(100)]],
          })
        );
      });
    }
  }

  get exactAmounts(): FormArray {
    return this.expenseForm.get('exactAmounts') as FormArray;
  }

  get percentages(): FormArray {
    return this.expenseForm.get('percentages') as FormArray;
  }

  calculateEqualShare(): number {
    const amount = this.expenseForm.get('amount')?.value || 0;
    const participants = this.expenseForm.get('participants')?.value || [];
    return participants.length > 0 ? amount / participants.length : 0;
  }

  getTotalExactAmount(): number {
    let total = 0;
    this.exactAmounts.controls.forEach(control => {
      total += parseFloat(control.get('amount')?.value || 0);
    });
    return total;
  }

  getTotalPercentage(): number {
    let total = 0;
    this.percentages.controls.forEach(control => {
      total += parseFloat(control.get('percentage')?.value || 0);
    });
    return total;
  }

  isExactAmountValid(): boolean {
    const amount = this.expenseForm.get('amount')?.value || 0;
    const total = this.getTotalExactAmount();
    return Math.abs(total - amount) < 0.01; // Allow 1 cent difference for rounding
  }

  isPercentageValid(): boolean {
    const total = this.getTotalPercentage();
    return Math.abs(total - 100) < 0.01;
  }

  onSubmit(): void {
    if (this.expenseForm.invalid) {
      Object.keys(this.expenseForm.controls).forEach(key => {
        this.expenseForm.get(key)?.markAsTouched();
      });
      return;
    }

    const splitType = this.expenseForm.get('splitType')?.value;
    
    // Validate participants for EQUAL split
    if (splitType === 'EQUAL') {
      const participants = this.expenseForm.get('participants')?.value || [];
      if (participants.length === 0) {
        this.toastService.warning('Please select at least one participant for equal split');
        return;
      }
    }
    
    // Validate split amounts
    if (splitType === 'EXACT' && !this.isExactAmountValid()) {
      this.toastService.warning('Exact amounts must add up to the total expense amount');
      return;
    }

    if (splitType === 'PERCENTAGE' && !this.isPercentageValid()) {
      this.toastService.warning('Percentages must add up to 100%');
      return;
    }

    const formValue = this.expenseForm.getRawValue(); // Use getRawValue() to include disabled fields
    const request: CreateExpenseRequest = {
      description: formValue.description,
      amount: parseFloat(formValue.amount),
      currency: formValue.currency,
      paidBy: formValue.paidBy,
      category: formValue.category,
      splitType: formValue.splitType,
      notes: formValue.notes || undefined,
      receiptUrl: formValue.receiptUrl || undefined,
    };

    // Add split-specific data
    if (splitType === 'EQUAL') {
      request.participantIds = formValue.participants;
    } else if (splitType === 'EXACT') {
      request.exactAmounts = {};
      this.exactAmounts.controls.forEach(control => {
        const userId = control.get('userId')?.value;
        const amount = parseFloat(control.get('amount')?.value);
        request.exactAmounts![userId] = amount;
      });
    } else if (splitType === 'PERCENTAGE') {
      request.percentages = {};
      this.percentages.controls.forEach(control => {
        const userId = control.get('userId')?.value;
        const percentage = parseFloat(control.get('percentage')?.value);
        request.percentages![userId] = percentage;
      });
    }

    this.loading = true;

    // Determine the group ID (from data or form)
    const groupId = this.isDashboardMode 
      ? this.expenseForm.get('groupId')?.value 
      : this.data.groupId;

    if (!groupId) {
      this.toastService.error('Please select a group');
      this.loading = false;
      return;
    }

    // Debug: Log the complete request being sent
    console.log('🚀 Creating expense with request:', JSON.stringify(request, null, 2));
    console.log('🚀 Group ID:', groupId);
    console.log('🚀 Participants:', formValue.participants);

    if (this.isEditMode) {
      // TODO: Implement update expense
      console.log('Update expense:', request);
      this.dialogRef.close(true);
    } else {
      this.expenseService.createExpense(groupId, request).subscribe({
        next: (response) => {
          this.loading = false;
          
          // Check if email notifications are enabled
          const emailPrefs = this.getEmailPreferences();
          const participantCount = formValue.participants.filter((p: any) => p.selected || p.amount > 0).length;
          
          if (emailPrefs.newExpenseNotifications) {
            this.toastService.success(`Expense created successfully! Email notifications sent to ${participantCount} member(s).`);
          } else {
            this.toastService.success('Expense created successfully!');
          }
          
          this.dialogRef.close(true);
        },
        error: (error: any) => {
          console.error('Error creating expense:', error);
          this.loading = false;
          this.toastService.error('Failed to create expense. Please try again.');
        },
      });
    }
  }

  private getEmailPreferences(): any {
    const stored = localStorage.getItem('emailPreferences');
    if (stored) {
      return JSON.parse(stored);
    }
    // Default preferences
    return {
      paymentReminders: true,
      paymentReceived: true,
      groupInvitations: true,
      weeklyDigest: true,
      newExpenseNotifications: true,
      settlementReminders: true,
    };
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
