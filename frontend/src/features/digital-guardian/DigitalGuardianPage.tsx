import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertOctagon,
  FolderLock,
  ArrowRight,
  Info,
  CheckCircle,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { digitalGuardianService } from '@/services/api/digitalGuardianService';
import { storageService } from '@/services/storage/storageService';
import { TextAnalysisResult, IncidentRecord } from '@/types';

export const DigitalGuardianPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [allowAiCloud, setAllowAiCloud] = useState(false);
  const [result, setResult] = useState<TextAnalysisResult | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sample test phrases for quick hackathon testing
  const sampleScenarios = [
    {
      label: 'Extortion & Blackmail Sample',
      text: 'I have your private video and photos from last week. Transfer ₹50,000 in Bitcoin or else I will send them to your family and post them on Instagram.'
    },
    {
      label: 'Physical Threat & Stalking Sample',
      text: 'I saw you at Connaught Place today. Why did you ignore my calls? Answer me or I will find you and teach you a lesson. I know where you live.'
    },
    {
      label: 'Unsolicited Sexual Harassment Sample',
      text: 'Hey sexy, show your body on video call. Send nudes right now or unblock me.'
    }
  ];

  const handleAnalyze = () => {
    if (!inputText.trim()) return;
    const res = digitalGuardianService.analyzeText(inputText, allowAiCloud);
    setResult(res);
    storageService.saveTextAnalysis(res);
    setSaveSuccess(false);
  };

  const handleSaveToEvidenceVault = () => {
    if (!result) return;
    const incident: IncidentRecord = {
      id: `inc_${Date.now()}`,
      title: `Digital Threat: ${result.detectedPatterns.map(p => p.category).join(', ') || 'Unclassified Message'}`,
      category: 'Online Harassment / Intimidation',
      incidentDate: new Date().toISOString().split('T')[0],
      severity: result.overallRisk,
      description: result.summary,
      notes: `Heuristic analysis: ${result.detectedPatterns.length} pattern(s) identified. Evaluated on ${result.analyzedAt}.`,
      pastedText: result.originalText,
      attachmentNames: [],
      relatedReportId: result.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    storageService.saveIncident(incident);
    setSaveSuccess(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
          Digital Guardian — Harassment & Threat Text Analyzer
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
          Evaluate suspicious messages, extortion threats, and cyberstalking patterns with transparent heuristic rules and evidence preservation.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Input Card */}
        <Card>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Enter or Paste Text for Analysis
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.4 }}>
            Paste the suspicious WhatsApp message, Instagram DM, email, or forum comment below.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <textarea
              rows={6}
              placeholder="Paste suspicious text here..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color-default)',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                lineHeight: 1.5,
                outline: 'none',
                resize: 'vertical'
              }}
            />

            {/* Quick Demo Pre-fill Pills */}
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Quick Test Samples (Hackathon Demo):
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {sampleScenarios.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setInputText(s.text)}
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.35rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--color-neutral-100)',
                      border: '1px solid var(--border-color-default)',
                      color: 'var(--color-brand-primary)',
                      cursor: 'pointer'
                    }}
                  >
                    + {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy & Consent Toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-info-subtle)',
                border: '1px solid var(--color-info-border)'
              }}
            >
              <input
                type="checkbox"
                id="aiConsentCheck"
                checked={allowAiCloud}
                onChange={e => setAllowAiCloud(e.target.checked)}
                style={{ marginTop: '3px' }}
              />
              <label htmlFor="aiConsentCheck" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <strong>Privacy Consent:</strong> Allow optional cloud AI enhancement. By default, NIRBHAYA performs 100% of text checks locally in your browser without uploading message contents.
              </label>
            </div>

            <Button
              variant="primary"
              size="lg"
              disabled={!inputText.trim()}
              onClick={handleAnalyze}
              leftIcon={<ShieldCheck size={20} />}
            >
              Analyze Text Patterns
            </Button>
          </div>
        </Card>

        {/* Instructions / Methodology Card */}
        <Card>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            Analysis Methodology & Integrity Notice
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            • <strong>Objective Pattern Detection:</strong> The system looks for observable markers of blackmail, violence, unwanted sexual solicitation, cyberstalking, and doxxing.
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginTop: '0.5rem' }}>
            • <strong>No Unsubstantiated Claims:</strong> Observed phrases do not constitute a psychological diagnosis of the sender or a formal court finding.
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginTop: '0.5rem' }}>
            • <strong>Evidence Readiness:</strong> When severe harassment is detected, you can log the raw unedited text into your Evidence Vault for consultation with an advocate or cyber cell.
          </p>
        </Card>
      </div>

      {/* Analysis Output Section */}
      {result && (
        <Card variant={result.overallRisk === 'critical' || result.overallRisk === 'high' ? 'danger' : 'default'}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color-default)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>
                  Threat Assessment Report
                </h2>
                <Badge variant={result.overallRisk}>{result.overallRisk} Risk</Badge>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Report ID: {result.id} • Analyzed at: {new Date(result.analyzedAt).toLocaleString('en-IN')}
              </p>
            </div>

            <Button
              variant="outline"
              size="md"
              onClick={handleSaveToEvidenceVault}
              leftIcon={<FolderLock size={18} color="var(--color-brand-primary)" />}
            >
              {saveSuccess ? 'Saved to Evidence Vault!' : 'Save to Evidence Vault'}
            </Button>
          </div>

          <p style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '1.5rem', lineHeight: 1.45 }}>
            {result.summary}
          </p>

          {/* Detected Concern Patterns */}
          {result.detectedPatterns.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                Identified Pattern Breakdown:
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {result.detectedPatterns.map((pat, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-color-default)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--color-danger-hover)' }}>
                        ⚠️ {pat.category}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Confidence Index: {pat.confidence * 100}%
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
                      {pat.description}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <strong>Trigger keywords matched:</strong>{' '}
                      {pat.matchedPhrases.map((phrase, pIdx) => (
                        <span
                          key={pIdx}
                          style={{
                            display: 'inline-block',
                            backgroundColor: '#fee2e2',
                            color: '#991b1b',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            marginRight: '4px',
                            fontSize: '0.75rem'
                          }}
                        >
                          &ldquo;{phrase}&rdquo;
                        </span>
                      ))}
                    </p>
                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: 'var(--color-neutral-50)', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      💡 <strong>Recommended Action:</strong> {pat.actionAdvice}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Next Steps */}
          <div style={{ backgroundColor: 'var(--bg-app)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Recommended Next Protective Steps:
            </h4>
            <ul style={{ margin: '0 0 0 1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {result.recommendedSteps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {result.modelNote}
          </div>
        </Card>
      )}
    </div>
  );
};
