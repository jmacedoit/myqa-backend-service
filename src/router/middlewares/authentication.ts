/*
 * Module dependencies.
 */

import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { KoaContext } from 'src/types/koa';
import { KoaPassport } from 'koa-passport';
import { Next } from 'koa';
import { applicationOperations } from 'src/services/application-operations';
import config from 'src/config';


/*
 * JWT strategy options.
 */

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromExtractors([(req) => req.cookies.get('jwt')]),
  secretOrKey: config.authentication.signingKey,
};

/*
 * JWT strategy.
 */

const jwtPassport = new KoaPassport();

jwtPassport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await applicationOperations.getUser(payload.id);

      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);

/*
 * JWT authentication middleware.
 */

export async function jwtAuthenticationMiddleware(ctx: KoaContext, next: Next) {
  return jwtPassport.authenticate('jwt', { session: false })(ctx, next);
}
