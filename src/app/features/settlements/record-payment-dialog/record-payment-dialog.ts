import { Component, OnInit, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { SettlementService } from '../../../core/services/settlement.service';
import { ToastService } from '../../../core/services/toast.service';
import { RecordSettlementRequest } from '../../../core/models/settlement.model';

interface SettlementSuggestion {
  payerId: string;
  payerName: string;
  payeeId: string;
  payeeName: string;
  amount: number;
  currency: string;
}

interface DialogData {
  groupId: number;
  suggestion: SettlementSuggestion;
}

@Component({
  selector: 'app-record-payment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './record-payment-dialog.html',
  styleUrls: ['./record-payment-dialog.scss'],
})
export class RecordPaymentDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private settlementService = inject(SettlementService);
  private dialogRef = inject(MatDialogRef<RecordPaymentDialogComponent>);
  private toastService = inject(ToastService);

  @Inject(MAT_DIALOG_DATA) public data!: DialogData;

  paymentForm: FormGroup;
  loading = false;

  paymentMethods = [
    { value: 'CASH', label: 'Cash', icon: 'payments' },
    { value: 'UPI', label: 'UPI / Digital Wallet', icon: 'phone_android' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: 'account_balance' },
    { value: 'CREDIT_CARD', label: 'Credit/Debit Card', icon: 'credit_card' },
  ];

  constructor() {
    this.paymentForm = this.fb.group({
      amount: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0.01)]],
      paymentMethod: ['UPI', Validators.required],
      transactionId: [''],
      notes: [''],
    });
  }

  ngOnInit(): void {
    // Pre-fill the amount from suggestion
    this.paymentForm.patchValue({
      amount: this.data.suggestion.amount,
    });
  }

  onSubmit(): void {
    if (this.paymentForm.invalid) {
      return;
    }

    const formValue = this.paymentForm.getRawValue();
    const request: RecordSettlementRequest = {
      groupId: this.data.groupId,
      payerId: this.data.suggestion.payerId,
      payeeId: this.data.suggestion.payeeId,
      amount: formValue.amount,
      currency: this.data.suggestion.currency,
      paymentMethod: formValue.paymentMethod,
      transactionId: formValue.transactionId || undefined,
      notes: formValue.notes || undefined,
    };

    this.loading = true;

    this.settlementService.recordSettlement(this.data.groupId, request).subscribe({
      next: (response) => {
        this.loading = false;
        this.toastService.success('Payment recorded successfully!');
        this.dialogRef.close(true);
      },
      error: (error: any) => {
        console.error('Error recording settlement:', error);
        this.loading = false;
        this.toastService.error('Failed to record payment. Please try again.');
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.data.suggestion.currency || 'USD',
    }).format(amount);
  }
}
