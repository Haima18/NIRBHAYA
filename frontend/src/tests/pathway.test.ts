import { describe, it, expect } from 'vitest';
import { pathwayService } from '../services/api/pathwayService';

describe('NIRBHAYA Pathway Generator', () => {
  it('generates immediate safety steps for domestic abuse', () => {
    const plan = pathwayService.createPlan('domestic_abuse', false);

    expect(plan.situation).toBe('domestic_abuse');
    expect(plan.steps.length).toBeGreaterThan(0);
    const immediateStep = plan.steps.find(s => s.category === 'immediate_safety');
    expect(immediateStep).toBeDefined();
    expect(immediateStep?.actions.length).toBeGreaterThan(0);
  });

  it('marks urgent safety priority when immediate danger is detected', () => {
    const plan = pathwayService.createPlan('physical_danger', true);

    expect(plan.immediateDangerDetected).toBe(true);
    expect(plan.steps.some(s => s.isUrgent)).toBe(true);
  });

  it('provides all standard situations', () => {
    const situations = pathwayService.getAllSituations();
    expect(situations.length).toBeGreaterThanOrEqual(10);
    expect(situations.some(s => s.id === 'blackmail')).toBe(true);
    expect(situations.some(s => s.id === 'deepfake_abuse')).toBe(true);
  });
});
