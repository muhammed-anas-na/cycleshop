const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(
    new GoogleStrategy(
      {
        clientID: '661569134831-r1hip0s2qcdllcaksrs82lpagbrmo2ag.apps.googleusercontent.com',
        clientSecret: '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',
        callbackURL: 'http://localhost:3000/auth/google/callback',
        scope: ['profile', 'email']
      },
      (accessToken, refreshToken, profile, callback) => {
        if(profile){
            let user = {
              id:profile.id,
              name:profile.displayName,
              email:profile.emails[0].value
            }
            callback(null , user);
        }
      }
    ),
);
passport.serializeUser((user,done)=>{
    done(null, user);
}),

passport.deserializeUser((user, done)=>{
    done(null , user);
})

