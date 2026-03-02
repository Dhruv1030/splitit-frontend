import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartEvent, ChartType, TooltipItem } from 'chart.js';
import { Expense } from '../../../core/models/expense.model';

@Component({
    selector: 'app-expense-donut',
    standalone: true,
    imports: [CommonModule, BaseChartDirective],
    template: `
    <div class="chart-container">
      <canvas baseChart
        [data]="doughnutChartData"
        [type]="doughnutChartType"
        [options]="doughnutChartOptions">
      </canvas>
    </div>
  `,
    styles: [`
    .chart-container {
      position: relative;
      height: 300px;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `]
})
export class ExpenseDonutComponent implements OnChanges {
    @Input() expenses: Expense[] = [];

    public doughnutChartOptions: ChartConfiguration['options'] = Object.assign({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'right',
                labels: {
                    color: '#e2e8f0',
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12
                    },
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                titleColor: '#f8fafc',
                bodyColor: '#e2e8f0',
                borderColor: 'rgba(148, 163, 184, 0.1)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                    label: function (context: TooltipItem<'doughnut'>) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed);
                        }
                        return label;
                    }
                }
            }
        },
        layout: {
            padding: 20
        }
    }, { cutout: '70%' } as any);

    public doughnutChartData: ChartData<'doughnut'> = {
        labels: [],
        datasets: [
            {
                data: [],
                backgroundColor: [
                    '#3b82f6', // Blue
                    '#8b5cf6', // Purple
                    '#ec4899', // Pink
                    '#10b981', // Emerald
                    '#f59e0b', // Amber
                    '#ef4444', // Red
                    '#6366f1', // Indigo
                    '#14b8a6', // Teal
                ],
                hoverBackgroundColor: [
                    '#60a5fa',
                    '#a78bfa',
                    '#f472b6',
                    '#34d399',
                    '#fbbf24',
                    '#f87171',
                    '#818cf8',
                    '#2dd4bf',
                ],
                borderWidth: 0,
                hoverOffset: 4
            }
        ]
    };

    public doughnutChartType: ChartType = 'doughnut';

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['expenses'] && this.expenses) {
            this.updateChartData();
        }
    }

    private updateChartData(): void {
        const categoryTotals: { [key: string]: number } = {};

        if (!this.expenses || !Array.isArray(this.expenses)) {
            this.doughnutChartData.labels = [];
            this.doughnutChartData.datasets[0].data = [];
            this.doughnutChartData = { ...this.doughnutChartData };
            return;
        }

        this.expenses.forEach(expense => {
            const category = expense.category || 'Uncategorized';
            categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
        });

        this.doughnutChartData = {
            labels: Object.keys(categoryTotals),
            datasets: [
                {
                    ...this.doughnutChartData.datasets[0],
                    data: Object.values(categoryTotals)
                }
            ]
        };
    }
}
