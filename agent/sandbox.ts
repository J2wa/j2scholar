import {defineSandbox} from 'eve/sandbox';
import {JustBashSandbox} from 'eve/sandbox/just-bash';
// The study agent exposes no shell/file tools and has no sandbox workloads.
// Use the in-process provider so this app does not require remote VM provisioning.
export const environment=JustBashSandbox.environment({autoInstall:false});
export default defineSandbox(()=>environment.open());
