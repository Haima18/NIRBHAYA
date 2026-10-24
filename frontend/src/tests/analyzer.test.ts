import { describe, it, expect } from 'vitest';
import { digitalGuardianService } from '../services/api/digitalGuardianService';

describe('Digital Guardian Analyzer Heuristic Engine', () => {
  it('detects critical blackmail and extortion threats', () => {
    const text = 'Transfer the money into bitcoin or else I will leak your private video to your family.';
    const result = digitalGuardianService.analyzeText(text, false);

    expect(result.overallRisk).toBe('critical');
    expect(result.detectedPatterns.some(p => p.category.includes('Blackmail'))).toBe(true);
    expect(result.recommendedSteps.length).toBeGreaterThan(0);
  });

  it('detects direct physical violence threats', () => {
    const text = 'I will find you and kill you if you dont reply to me.';
    const result = digitalGuardianService.analyzeText(text, false);

    expect(result.overallRisk).toBe('critical');
    expect(result.detectedPatterns.some(p => p.category.includes('Threats'))).toBe(true);
  });

  it('detects unsolicited sexual solicitation', () => {
    const text = 'Send nudes right now and show your body on video call.';
    const result = digitalGuardianService.analyzeText(text, false);

    expect(result.overallRisk).toBe('high');
    expect(result.detectedPatterns.some(p => p.category.includes('Sexual'))).toBe(true);
  });

  it('correctly assesses safe / low risk messages', () => {
    const text = 'Hey, are we still meeting for coffee tomorrow afternoon?';
    const result = digitalGuardianService.analyzeText(text, false);

    expect(result.overallRisk).toBe('low');
    expect(result.detectedPatterns.length).toBe(0);
  });

  it('handles empty or null-like input without crashing', () => {
    const result = digitalGuardianService.analyzeText(null as any, false);

    expect(result.overallRisk).toBe('low');
    expect(result.detectedPatterns.length).toBe(0);
    expect(result.recommendedSteps[0]).toContain('No acute intimidation');
  });
});
