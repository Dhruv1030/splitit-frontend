import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pwa-install-prompt',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './pwa-install-prompt.html',
  styleUrls: ['./pwa-install-prompt.scss'],
})
export class PwaInstallPromptComponent implements OnInit {
  showPrompt = false;
  deferredPrompt: any = null;

  ngOnInit(): void {
    // Check if user has already dismissed or installed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const isStandalone = this.isRunningStandalone();

    if (!dismissed && !isStandalone) {
      // Listen for the beforeinstallprompt event
      window.addEventListener('beforeinstallprompt', (e: any) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later
        this.deferredPrompt = e;
        // Show the install prompt after a delay
        setTimeout(() => {
          this.showPrompt = true;
        }, 5000); // Show after 5 seconds
      });

      // Listen for app installed event
      window.addEventListener('appinstalled', () => {
        console.log('PWA was installed');
        this.showPrompt = false;
        this.deferredPrompt = null;
      });
    }
  }

  isRunningStandalone(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://')
    );
  }

  async installPwa(): Promise<void> {
    if (!this.deferredPrompt) {
      return;
    }

    // Show the install prompt
    this.deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await this.deferredPrompt.userChoice;

    console.log(`User response to the install prompt: ${outcome}`);

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt
    this.deferredPrompt = null;
    this.showPrompt = false;
  }

  dismissPrompt(): void {
    this.showPrompt = false;
    localStorage.setItem('pwa-install-dismissed', 'true');
  }
}
