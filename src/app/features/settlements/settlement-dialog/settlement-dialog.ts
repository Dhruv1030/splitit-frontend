import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SettlementService } from '../../../core/services/settlement.service';

interface SettlementSuggestion {
  payerId: string;
  payerName: string;
  payeeId: string;
  payeeName: string;
  amount: number;
  currency: string;
}

interface SettlementResponse {
  groupId: number;
  suggestions: SettlementSuggestion[];
  totalTransactions: number;
  totalAmount: number;
  currency: string;
  message: string;
}

interface DialogData {
  groupId: number;
  groupName: string;
  currency: string;
}

@Component({
  selector: 'app-settlement-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './settlement-dialog.html',
  styleUrls: ['./settlement-dialog.scss'],
})
export class SettlementDialogComponent implements OnInit {
  private settlementService = inject(SettlementService);
  private dialogRef = inject(MatDialogRef<SettlementDialogComponent>);
  private dialog = inject(MatDialog);

  public data = inject<DialogData>(MAT_DIALOG_DATA);

  suggestions: SettlementSuggestion[] = [];
  totalTransactions = 0;
  totalAmount = 0;
  settlementMessage = '';
  loading = true;
  error = false;
  completedPayments = new Set<string>();

  ngOnInit(): void {
    this.loadSuggestions();
  }

  loadSuggestions(): void {
    this.loading = true;
    this.error = false;

    this.settlementService.getSettlementSuggestions(this.data.groupId).subscribe({
      next: (response: any) => {
        // Handle the new structured response format
        const settlementData: SettlementResponse = response.data || response;
        
        this.suggestions = settlementData.suggestions || [];
        this.totalTransactions = settlementData.totalTransactions || this.suggestions.length;
        this.totalAmount = settlementData.totalAmount || 0;
        this.settlementMessage = settlementData.message || '';
        
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading settlement suggestions:', err);
        this.error = true;
        this.loading = false;
      },
    });
  }

  onRecordPayment(suggestion: SettlementSuggestion): void {
    import('../record-payment-dialog/record-payment-dialog').then((m) => {
      const recordDialogRef = this.dialog.open(m.RecordPaymentDialogComponent, {
        width: '500px',
        data: {
          groupId: this.data.groupId,
          suggestion: suggestion,
        },
      });

      recordDialogRef.afterClosed().subscribe((result) => {
        if (result) {
          // Mark this payment as completed (visual feedback)
          const paymentKey = `${suggestion.payerId}-${suggestion.payeeId}-${suggestion.amount}`;
          this.completedPayments.add(paymentKey);
          
          // Refresh suggestions after recording payment
          setTimeout(() => {
            this.loadSuggestions();
          }, 500);
        }
      });
    });
  }

  isPaymentCompleted(suggestion: SettlementSuggestion): boolean {
    const paymentKey = `${suggestion.payerId}-${suggestion.payeeId}-${suggestion.amount}`;
    return this.completedPayments.has(paymentKey);
  }

  getProgressPercentage(): number {
    if (this.totalTransactions === 0) return 100;
    return Math.round((this.completedPayments.size / this.totalTransactions) * 100);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.data.currency || 'USD',
    }).format(amount);
  }

  onClose(): void {
    this.dialogRef.close(false);
  }

  onDone(): void {
    this.dialogRef.close(true);
  }
}
