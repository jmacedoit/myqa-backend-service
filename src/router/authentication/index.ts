
/*
 * Module dependencies.
 */

import { KoaContext } from 'src/types/koa';
import { KoaPassport } from 'koa-passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Next } from 'koa';
import { applicationOperations } from 'src/services/application-operations';
import Router from 'koa-router';
import config from 'src/config';
import jwt from 'jsonwebtoken';
import logger from 'src/logger';

/*
 * Local strategy.
 */

const emailPasswordPassport = new KoaPassport();

emailPasswordPassport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await applicationOperations.getUserByEmail(email);

      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }

      const isValidPassword = await applicationOperations.validatePassword(user.password, password);

      if (!isValidPassword) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);


/*
 * Login controller.
 */

async function authenticationController(ctx: KoaContext, next: Next) {
  return emailPasswordPassport.authenticate('local', async (err: unknown, user: { id: string }) => {
    if (err) {
      ctx.throw(500, err);
    } else if (!user) {
      logger.debug('Authentication failed');

      ctx.status = 401;
    } else {
      const payload = { id: user.id };
      const token = jwt.sign(payload, config.authentication.signingKey, { expiresIn: config.authentication.expirationTime });

      ctx.cookies.set('jwt', token, {
        httpOnly: true,
        secure: config.authentication.secureCookies
      });

      ctx.status = 200;
      ctx.body = { message: 'Login successful' };
    }
  })(ctx, next);
}

/*
 * Add controller routes.
 */

export function addAuthenticationRoutes(router: Router<any, any>) {
  router.post('/authentication', authenticationController);
}
