/**
 * Reliability tests – pure Node, no external keys required
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseIntent, scoreOpportunity, buildPlan } from '../server/agent.mjs';
import { LIVE_SOURCES } from '../server/sources.mjs';

describe('ResilienceHunter reliability', () => {
  it('parses intent for Karachi flood query', async () => {
    const intent = await parseIntent('Show flood resilience opportunities in Karachi');
    assert.ok(intent.location.toLowerCase().includes('karachi') || intent.query.includes('Karachi'));
    assert.ok(Array.isArray(intent.hazards));
  });

  it('builds a non-empty discovery plan', () => {
    const plan = buildPlan({ location: 'Karachi', focus: 'flood', hazards: ['flood'] });
    assert.ok(plan.length >= 3);
  });

  it('scores a critical flood alert higher than an info item', () => {
    const high = scoreOpportunity(
      {
        severity: 'Red',
        urgency: 'critical',
        population_at_risk: 1_000_000,
        hazard: 'Flood',
        location: 'Karachi',
        title: 'Major flood',
      },
      { location: 'Karachi', hazards: ['flood'], country: 'Pakistan' }
    );
    const low = scoreOpportunity(
      {
        severity: 'Info',
        urgency: 'low',
        hazard: 'Information',
        location: 'Global',
        title: 'News item',
      },
      { location: 'Karachi', hazards: ['flood'] }
    );
    assert.ok(high.score > low.score);
    assert.equal(high.band, 'CRITICAL');
  });

  it('has at least 6 live sources defined', () => {
    assert.ok(LIVE_SOURCES.length >= 6);
  });

  it('all sources have required metadata', () => {
    for (const s of LIVE_SOURCES) {
      assert.ok(s.id);
      assert.ok(s.name);
      assert.ok(s.type);
    }
  });
});
