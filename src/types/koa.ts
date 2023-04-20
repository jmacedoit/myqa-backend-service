

/*
 * Module dependencies.
 */

import { DefaultContext, DefaultState, ParameterizedContext } from 'koa';
import Router from 'koa-router';

/*
 * Koa context type.
 */

// eslint-disable-next-line @typescript-eslint/ban-types
export type KoaContext = ParameterizedContext<DefaultState, DefaultContext>
