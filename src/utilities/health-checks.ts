/*
 * Module dependencies.
 */

import { Server } from 'http';
import { TerminusState, createTerminus } from '@godaddy/terminus';
import logger from 'src/logger';

/*
 * Health Checks setup.
 */

function onSignal(): Promise<any> {
  logger.info('server received SIGINT signal');

  return Promise.resolve();
}

function healthReadyCheck(check: { state: TerminusState }): Promise<any> {
  if (check.state.isShuttingDown) {
    return Promise.reject();
  }

  return Promise.resolve() ;
}

function healthLiveCheck(check: { state: TerminusState }): any {
  return !check.state.isShuttingDown;
}

export function addHealthChecks(server: Server) {
  createTerminus(server, {
    signal: 'SIGINT',
    healthChecks: {
      '/health/live': healthLiveCheck,
      '/health/ready': healthReadyCheck,
      '/health': healthReadyCheck
    },
    onSignal
  });
}
