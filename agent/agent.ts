import {defineAgent} from 'eve';
// The environment is set by the deployer; no API key reaches the browser.
// Keep a valid fallback so static builds do not fail when coaching is unconfigured.
export default defineAgent({
 defaultTools:false,
 model: process.env.AI_GATEWAY_MODEL || 'openai/gpt-6-luna',
 limits:{maxInputTokensPerSession:60000,maxOutputTokensPerSession:10000,maxTokenCostUsdPerSession:1,sessionTimeoutMs:12*60*60*1000}
});
