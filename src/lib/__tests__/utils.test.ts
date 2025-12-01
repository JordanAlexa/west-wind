import { cn } from '../utils';
import { describe, it, expect } from 'vitest';

describe('cn utility', () => {
    it('merges class names correctly', () => {
        expect(cn('c-1', 'c-2')).toBe('c-1 c-2');
    });

    it('handles conditional classes', () => {
        expect(cn('c-1', true && 'c-2', false && 'c-3')).toBe('c-1 c-2');
    });

    it('merges tailwind classes using tailwind-merge', () => {
        expect(cn('px-2 py-1', 'p-4')).toBe('p-4');
    });

    it('handles arrays and objects', () => {
        expect(cn(['c-1', 'c-2'], { 'c-3': true, 'c-4': false })).toBe('c-1 c-2 c-3');
    });
});
