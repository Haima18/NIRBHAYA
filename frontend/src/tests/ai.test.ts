import { describe, expect, it } from 'vitest';
import { aiService } from '../services/ai/aiService';

describe('NIRBHAYA local assistant routing', () => {
  it('routes ordinary help about an FIR to legal guidance, not emergency guidance', () => {
    const response = aiService.generateLocalResponse('Can you help me understand what to do if police refuse my FIR?');

    expect(response.reply).toContain('Legal Consultation');
    expect(response.reply).not.toContain('Immediate Safety Priority');
  });

  it('routes explicit immediate danger to emergency guidance', () => {
    const response = aiService.generateLocalResponse('I am in immediate danger right now');

    expect(response.reply).toContain('Call National Emergency 112');
  });
});