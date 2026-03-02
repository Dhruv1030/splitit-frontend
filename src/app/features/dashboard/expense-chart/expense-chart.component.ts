import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { Expense } from '../../../core/models/expense.model';

@Component({
  selector: 'app-expense-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  template: `
    <mat-card class="h-full">
      <mat-card-header>
        <mat-card-title>Spending Overview</mat-card-title>
        <mat-card-subtitle>Expenses by Category</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <div class="chart-container">
          <canvas baseChart
            [data]="doughnutChartData"
            [options]="doughnutChartOptions"
            [type]="doughnutChartType">
          </canvas>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .chart-container {
      position: relative;
      height: 250px;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `]
})
export class ExpenseChartComponent implements OnInit, OnChanges {
  @Input() expenses: Expense[] = [];

  public doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          color: '#94a3b8', // Slate 400
          font: {
            family: 'Inter',
            size: 12
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      }
    },
    elements: {
      arc: {
        borderWidth: 0
      }
    }
  };

  public doughnutChartType: ChartType = 'doughnut';
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#3b82f6', // Blue
          '#8b5cf6', // Violet
          '#10b981', // Emerald
          '#f59e0b', // Amber
          '#ef4444', // Red
          '#ec4899', // Pink
          '#6366f1'  // Indigo
        ],
        hoverBackgroundColor: [
          '#2563eb',
          '#7c3aed',
          '#059669',
          '#d97706',
          '#dc2626',
          '#db2777',
          '#4f46e5'
        ],
        hoverOffset: 4
      },
    ],
  };

  ngOnInit(): void {
    this.updateChartData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['expenses']) {
      this.updateChartData();
    }
  }

  private updateChartData(): void {
    if (!this.expenses || !Array.isArray(this.expenses) || this.expenses.length === 0) {
      this.doughnutChartData.labels = [];
      this.doughnutChartData.datasets[0].data = [];
      this.doughnutChartData = { ...this.doughnutChartData };
      return;
    }

    // Group expenses by category
    const categoryTotals: { [key: string]: number } = {};

    this.expenses.forEach(expense => {
      const category = expense.category || 'OTHER';
      categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
    });

    this.doughnutChartData.labels = Object.keys(categoryTotals);
    this.doughnutChartData.datasets[0].data = Object.values(categoryTotals);

    // Trigger update
    this.doughnutChartData = { ...this.doughnutChartData };
  }
}
