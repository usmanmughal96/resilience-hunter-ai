/**
 * Headless demo – prints a full agent run to the console.
 * Perfect for judges / video recording without browser.
 */
import { runAgent } from './agent.mjs';

const query = process.argv[2] || 'Show the highest-impact flood and heatwave resilience opportunities for Karachi and Sindh province right now';

console.log('\n◎ ResilienceHunter AI – Live Demo Run\n');
console.log('Query:', query);
console.log('─'.repeat(60));

const result = await runAgent(query, { mode: 'demo' }, (evt) => {
  if (evt.type === 'step') console.log('  →', evt.text);
  if (evt.type === 'source') console.log(`     [${evt.status}] ${evt.name}${evt.count != null ? ` (${evt.count})` : ''}`);
});

console.log('\n' + '═'.repeat(60));
console.log(`RESULT · ${result.opportunities.length} opportunities · ${result.duration_sec}s`);
console.log('═'.repeat(60));

if (result.opportunities[0]?.situation_summary) {
  console.log('\nSITUATION BRIEF');
  console.log(result.opportunities[0].situation_summary);
}

result.opportunities.slice(0, 8).forEach((o, i) => {
  console.log(`\n${i + 1}. [${o.band} ${o.impact_score}] ${o.title}`);
  console.log(`   Hazard: ${o.hazard} · ${o.location}`);
  console.log(`   Why: ${o.why}`);
  if (o.recommended_action) console.log(`   Action: ${o.recommended_action}`);
  if (o.source_url) console.log(`   Source: ${o.source_url}`);
});

console.log('\nDone.\n');
