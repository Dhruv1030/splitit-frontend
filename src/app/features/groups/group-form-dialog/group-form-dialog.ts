import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GroupService } from '../../../core/services/group.service';
import { Group, CreateGroupRequest, UpdateGroupRequest } from '../../../core/models/group.model';

@Component({
  selector: 'app-group-form-dialog',
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
  ],
  templateUrl: './group-form-dialog.html',
  styleUrls: ['./group-form-dialog.scss'],
})
export class GroupFormDialogComponent {
  private fb = inject(FormBuilder);
  private groupService = inject(GroupService);
  private dialogRef = inject(MatDialogRef<GroupFormDialogComponent>);

  groupForm: FormGroup;
  loading = false;
  errorMessage = '';
  isEditMode = false;

  categories = [
    { value: 'TRIP', label: 'Trip', icon: 'flight' },
    { value: 'HOME', label: 'Home', icon: 'home' },
    { value: 'COUPLE', label: 'Couple', icon: 'favorite' },
    { value: 'OTHER', label: 'Other', icon: 'groups' },
  ];

  currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'CNY', name: 'Chinese Yuan' },
  ];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { group?: Group }) {
    this.isEditMode = !!data?.group;

    this.groupForm = this.fb.group({
      name: [data?.group?.name || '', [Validators.required, Validators.minLength(2)]],
      description: [data?.group?.description || ''],
      category: [data?.group?.category || 'OTHER', [Validators.required]],
      currency: [data?.group?.currency || 'USD', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.groupForm.invalid) {
      this.markFormGroupTouched(this.groupForm);
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const formValue = this.groupForm.value;

    if (this.isEditMode && this.data.group) {
      const updateRequest: UpdateGroupRequest = {
        name: formValue.name,
        description: formValue.description,
        category: formValue.category,
      };

      this.groupService.updateGroup(this.data.group.id, updateRequest).subscribe({
        next: (response) => {
          this.loading = false;
          this.dialogRef.close(response.data);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage =
            error.error?.message || error.message || 'Failed to update group';
        },
      });
    } else {
      const createRequest: CreateGroupRequest = {
        name: formValue.name,
        description: formValue.description,
        category: formValue.category,
        currency: formValue.currency,
      };

      this.groupService.createGroup(createRequest).subscribe({
        next: (response) => {
          this.loading = false;
          this.dialogRef.close(response.data);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage =
            error.error?.message || error.message || 'Failed to create group';
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(field: string): string {
    const control = this.groupForm.get(field);

    if (!control || !control.touched) {
      return '';
    }

    if (control.hasError('required')) {
      return `${this.getFieldLabel(field)} is required`;
    }
    if (control.hasError('minlength')) {
      const minLength = control.getError('minlength').requiredLength;
      return `${this.getFieldLabel(field)} must be at least ${minLength} characters`;
    }
    return '';
  }

  private getFieldLabel(field: string): string {
    const labels: { [key: string]: string } = {
      name: 'Group name',
      description: 'Description',
      category: 'Category',
      currency: 'Currency',
    };
    return labels[field] || field;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
