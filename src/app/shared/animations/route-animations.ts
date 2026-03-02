import {
    trigger,
    transition,
    style,
    animate,
    query,
    group,
} from '@angular/animations';

// -------------------------------------------------------------------------
// Route-level fade + slide-up transition
// Plays when navigating between any two routes
// -------------------------------------------------------------------------
export const routeFadeSlide = trigger('routeFadeSlide', [
    transition('* <=> *', [
        query(
            ':enter',
            [
                style({ opacity: 0, transform: 'translateY(12px)' }),
                animate(
                    '280ms cubic-bezier(0.4, 0, 0.2, 1)',
                    style({ opacity: 1, transform: 'translateY(0)' })
                ),
            ],
            { optional: true }
        ),
    ]),
]);

// -------------------------------------------------------------------------
// Card stagger-in animation — apply to a list container
// Children animate in sequentially with a 60ms delay between each
// -------------------------------------------------------------------------
export const cardStaggerIn = trigger('cardStaggerIn', [
    transition(':enter', [
        query(
            ':enter',
            [
                style({ opacity: 0, transform: 'translateY(16px)' }),
                animate(
                    '320ms cubic-bezier(0.4, 0, 0.2, 1)',
                    style({ opacity: 1, transform: 'translateY(0)' })
                ),
            ],
            { optional: true }
        ),
    ]),
]);

// -------------------------------------------------------------------------
// Single element fade-in-up — for individual cards/sections
// -------------------------------------------------------------------------
export const fadeInUp = trigger('fadeInUp', [
    transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
            '300ms 50ms cubic-bezier(0.4, 0, 0.2, 1)',
            style({ opacity: 1, transform: 'translateY(0)' })
        ),
    ]),
]);

// -------------------------------------------------------------------------
// Number counter — scales briefly on value change
// -------------------------------------------------------------------------
export const numberPop = trigger('numberPop', [
    transition('* => *', [
        style({ transform: 'scale(1.08)' }),
        animate('180ms ease-out', style({ transform: 'scale(1)' })),
    ]),
]);
