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
  loading = true;
  error = false;

  ngOnInit(): void {
    this.loadSuggestions();
  }

  loadSuggestions(): void {
    this.loading = true;
    this.error = false;

    this.settlementService.getSettlementSuggestions(this.data.groupId).subscribe({
      next: (response: any) => {
        // Handle both response formats: wrapped in ApiResponse or direct array
        this.suggestions = response.suggestions || response.data?.suggestions || response;
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
          // Refresh suggestions after recording payment
          this.loadSuggestions();
        }
      });
    });
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
