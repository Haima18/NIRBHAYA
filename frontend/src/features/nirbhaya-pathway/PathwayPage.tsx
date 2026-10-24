import React, { useState, useEffect } from 'react';
import {
  Compass,
  ShieldAlert,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ArrowRight,
  PhoneCall,
  Save,
  RotateCcw
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { pathwayService } from '@/services/api/pathwayService';
import { storageService } from '@/services/storage/storageService';
import { PathwaySituation, PathwayPlan } from '@/types';

export const PathwayPage: React.FC = () => {
  const [situations, setSituations] = useState<{ id: PathwaySituation; title: string; urgentCheck: boolean }[]>([]);
  const [selectedSituation, setSelectedSituation] = useState<PathwaySituation | null>(null);
  const [activePlan, setActivePlan] = useState<PathwayPlan | null>(null);
  const [immediateDanger, setImmediateDanger] = useState<boolean | null>(null);

  useEffect(() => {
    const all = pathwayService.getAllSituations();
    setSituations(all);

    // Check for existing plan
    const existing = storageService.getPathwayPlans();
    if (existing.length > 0) {
      setActivePlan(existing[0]);
      setSelectedSituation(existing[0].situation);
      setImmediateDanger(existing[0].immediateDangerDetected);
    }
  }, []);

  const handleSelectSituation = (sit: PathwaySituation) => {
    setSelectedSituation(sit);
    const conf = situations.find(s => s.id === sit);
    if (conf && !conf.urgentCheck) {
      // Direct plan generation
      const plan = pathwayService.createPlan(sit, false);
      setActivePlan(plan);
      storageService.savePathwayPlan(plan);
    } else {
      setActivePlan(null);
      setImmediateDanger(null);
    }
  };

  const handleDangerConfirm = (isDanger: boolean) => {
    if (!selectedSituation) return;
    setImmediateDanger(isDanger);
    const plan = pathwayService.createPlan(selectedSituation, isDanger);
    setActivePlan(plan);
    storageService.savePathwayPlan(plan);
  };

  const handleToggleAction = (stepId: string, actionId: string) => {
    if (!activePlan) return;
    const updatedSteps = activePlan.steps.map(s => {
      if (s.id === stepId) {
        return {
          ...s,
          actions: s.actions.map(a => a.id === actionId ? { ...a, completed: !a.completed } : a)
        };
      }
      return s;
    });

    const updatedPlan: PathwayPlan = {
      ...activePlan,
      steps: updatedSteps,
      updatedAt: new Date().toISOString()
    };

    setActivePlan(updatedPlan);
    storageService.savePathwayPlan(updatedPlan);
  };

  const handleReset = () => {
    setSelectedSituation(null);
    setActivePlan(null);
    setImmediateDanger(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
            NIRBHAYA Pathway — Decision & Action Navigator
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
            &ldquo;I am experiencing this situation. What can I do next?&rdquo; — Pressure-free, step-by-step triage.
          </p>
        </div>

        {activePlan && (
          <Button variant="outline" size="sm" onClick={handleReset} leftIcon={<RotateCcw size={14} />}>
            Choose Different Situation
          </Button>
        )}
      </div>

      {/* Situation Picker */}
      {!activePlan && !immediateDanger && (
        <Card>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            What best describes what you are experiencing right now?
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Choose a situation to generate an actionable, self-paced response plan. There is zero judgment and zero pressure to report.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
            {situations.map(s => (
              <button
                key={s.id}
                onClick={() => handleSelectSituation(s.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: selectedSituation === s.id ? 'var(--color-brand-primary-subtle)' : 'var(--bg-app)',
                  border: selectedSituation === s.id ? '2px solid var(--color-brand-primary)' : '1px solid var(--border-color-default)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>
                    {s.title}
                  </strong>
                  {s.urgentCheck && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-danger)', fontWeight: 600 }}>
                      ⚡ Priority Safety Check
                    </span>
                  )}
                </div>
                <ArrowRight size={16} color="var(--color-brand-primary)" />
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Immediate Danger Check Modal/Banner */}
      {selectedSituation && !activePlan && immediateDanger === null && (
        <Card variant="danger">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <ShieldAlert size={28} color="var(--color-danger)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-danger-hover)', margin: 0 }}>
              Urgent Safety Check
            </h3>
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.45 }}>
            Are you or anyone with you in <strong>immediate physical danger</strong> or within physical reach of an aggressor right now?
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button
              variant="emergency"
              size="lg"
              onClick={() => handleDangerConfirm(true)}
              leftIcon={<ShieldAlert size={20} />}
            >
              YES — I am in danger right now
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleDangerConfirm(false)}
            >
              NO — I am currently physically safe
            </Button>
          </div>
        </Card>
      )}

      {/* Active Generated Pathway Plan */}
      {activePlan && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {activePlan.immediateDangerDetected && (
            <Alert type="danger" title="Immediate Physical Danger Priority">
              Your physical safety overrides everything else. If an aggressor is nearby, please dial <strong>112</strong> immediately or move to a crowded public space before reading further.
            </Alert>
          )}

          <Card variant="highlight">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-brand-primary)' }}>
                  Active Personalized Plan
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {activePlan.situationTitle}
                </h2>
              </div>
              <Badge variant="info">
                {activePlan.steps.reduce((acc, s) => acc + s.actions.filter(a => a.completed).length, 0)} of{' '}
                {activePlan.steps.reduce((acc, s) => acc + s.actions.length, 0)} Items Completed
              </Badge>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Check off items as you complete them. Your progress is saved automatically so you can revisit anytime.
            </p>
          </Card>

          {/* Plan Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {activePlan.steps.map((step, sIdx) => (
              <Card key={step.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    {step.title}
                  </h3>
                  {step.isUrgent && <Badge variant="critical">Urgent Step</Badge>}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.4 }}>
                  {step.description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {step.actions.map(action => (
                    <div
                      key={action.id}
                      onClick={() => handleToggleAction(step.id, action.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: action.completed ? 'var(--color-success-subtle)' : 'var(--bg-app)',
                        border: action.completed ? '1px solid var(--color-success-border)' : '1px solid var(--border-color-default)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <button
                        type="button"
                        aria-label={action.completed ? 'Mark incomplete' : 'Mark complete'}
                        style={{
                          color: action.completed ? 'var(--color-success)' : 'var(--color-neutral-400)',
                          marginTop: '2px'
                        }}
                      >
                        {action.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                      </button>

                      <div style={{ flexGrow: 1 }}>
                        <span
                          style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-primary)',
                            textDecoration: action.completed ? 'line-through' : 'none'
                          }}
                        >
                          {action.text}
                        </span>
                        {action.emergencyLink && (
                          <div style={{ marginTop: '4px' }}>
                            <a
                              href={action.emergencyLink}
                              onClick={e => e.stopPropagation()}
                              style={{
                                fontSize: '0.75rem',
                                color: 'var(--color-danger)',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                            >
                              <PhoneCall size={12} /> Call 112 Directly
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
