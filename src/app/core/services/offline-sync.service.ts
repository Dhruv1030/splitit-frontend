import { Injectable, signal, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwUpdate } from '@angular/service-worker';
import { ToastrService } from 'ngx-toastr';
import { catchError, filter, map, of, firstValueFrom } from 'rxjs';

export interface PendingAction {
    id: string;
    type: 'CREATE_EXPENSE' | 'UPDATE_EXPENSE' | 'DELETE_EXPENSE' | 'CREATE_GROUP';
    payload: any;
    timestamp: number;
}

@Injectable({
    providedIn: 'root'
})
export class OfflineSyncService {
    private http = inject(HttpClient);
    private updates = inject(SwUpdate);
    private toastr = inject(ToastrService);

    private readonly DB_NAME = 'splitit-offline-db';
    private readonly STORE_NAME = 'pending-actions';
    private readonly CACHE_STORE_NAME = 'data-cache';

    isOnline = signal(navigator.onLine);
    pendingCount = signal(0);
    isSyncing = signal(false);

    constructor() {
        window.addEventListener('online', () => this.handleOnlineStatus(true));
        window.addEventListener('offline', () => this.handleOnlineStatus(false));

        this.checkForUpdates();
        this.loadPendingCount();
    }

    // --- Caching for GET Requests ---
    async cacheData(key: string, data: any) {
        const db = await this.getDB();
        return new Promise<void>((resolve, reject) => {
            const transaction = db.transaction(this.CACHE_STORE_NAME, 'readwrite');
            transaction.objectStore(this.CACHE_STORE_NAME).put({ id: key, data, timestamp: Date.now() });
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    async getCachedData<T>(key: string): Promise<T | null> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.CACHE_STORE_NAME, 'readonly');
            const request = transaction.objectStore(this.CACHE_STORE_NAME).get(key);
            request.onsuccess = () => resolve(request.result ? request.result.data : null);
            request.onerror = () => reject(request.error);
        });
    }

    private handleOnlineStatus(online: boolean) {
        this.isOnline.set(online);
        if (online) {
            this.toastr.info('Connection restored. Syncing your changes...', 'Online');
            this.syncPendingActions();
        } else {
            this.toastr.warning('You are offline. Showing cached data where available.', 'Offline Mode');
        }
    }

    private checkForUpdates() {
        if (this.updates.isEnabled) {
            this.updates.versionUpdates
                .pipe(filter((evt): evt is any => evt.type === 'VERSION_READY'))
                .subscribe(() => {
                    if (confirm('New version available. Load New Version?')) {
                        window.location.reload();
                    }
                });
        }
    }

    async queueAction(type: PendingAction['type'], payload: any) {
        const action: PendingAction = {
            id: crypto.randomUUID(),
            type,
            payload,
            timestamp: Date.now()
        };

        await this.saveToIndexedDB(action);
        this.loadPendingCount();
    }

    private async syncPendingActions() {
        if (this.isSyncing() || !this.isOnline()) return;

        const actions = await this.getAllPendingActions();
        if (actions.length === 0) return;

        this.isSyncing.set(true);

        for (const action of actions) {
            try {
                await this.processAction(action);
                await this.removeFromIndexedDB(action.id);
            } catch (error) {
                console.error(`Failed to sync action ${action.id}:`, error);
                // If it's a 4xx error (validation/logic), we might want to discard or flag it
                // For now, we'll stop sync to avoid ordered execution issues
                break;
            }
        }

        this.isSyncing.set(false);
        this.loadPendingCount();

        if (this.pendingCount() === 0) {
            this.toastr.success('All changes synced successfully!', 'Sync Complete');
        }
    }

    private async processAction(action: PendingAction) {
        // This will be mapped to actual service calls
        // For now, we use relative paths consistent with environment
        switch (action.type) {
            case 'CREATE_EXPENSE':
                return firstValueFrom(this.http.post('/api/expenses', action.payload));
            case 'UPDATE_EXPENSE':
                return firstValueFrom(this.http.put(`/api/expenses/${action.payload.id}`, action.payload));
            case 'DELETE_EXPENSE':
                return firstValueFrom(this.http.delete(`/api/expenses/${action.payload.id}`));
            case 'CREATE_GROUP':
                return firstValueFrom(this.http.post('/api/groups', action.payload));
        }
    }

    // --- IndexedDB Lower Level ---
    private async getDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, 2); // Upgrade version to 2 for new store
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains(this.CACHE_STORE_NAME)) {
                    db.createObjectStore(this.CACHE_STORE_NAME, { keyPath: 'id' });
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    private async saveToIndexedDB(action: PendingAction) {
        const db = await this.getDB();
        return new Promise<void>((resolve, reject) => {
            const transaction = db.transaction(this.STORE_NAME, 'readwrite');
            transaction.objectStore(this.STORE_NAME).add(action);
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    private async getAllPendingActions(): Promise<PendingAction[]> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.STORE_NAME, 'readonly');
            const request = transaction.objectStore(this.STORE_NAME).getAll();
            request.onsuccess = () => resolve(request.result.sort((a, b) => a.timestamp - b.timestamp));
            request.onerror = () => reject(request.error);
        });
    }

    private async removeFromIndexedDB(id: string) {
        const db = await this.getDB();
        return new Promise<void>((resolve, reject) => {
            const transaction = db.transaction(this.STORE_NAME, 'readwrite');
            transaction.objectStore(this.STORE_NAME).delete(id);
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    private async loadPendingCount() {
        const actions = await this.getAllPendingActions();
        this.pendingCount.set(actions.length);
    }
}
