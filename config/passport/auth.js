// expose our config directly to our application using module.exports
module.exports = {
        'facebookAuth': {
            'clientID': '1427407013967334', // your App ID
            'clientSecret': 'a98eab57ae28e383b242258660411a00', // your App Secret
            'callbackURL': 'https://restracer.herokuapp.com/auth/facebook/callback'
            //'callbackURL': 'http://localhost:3000/auth/facebook/callback'
        },
        'googleAuth': {
            'clientID': '1039342764013-26jvo7m6coq5714k7tt6v3db7t8ud5lu.apps.googleusercontent.com',
            'clientSecret': 'mgMaxMfD5xolsF9V8uRsb0sP',
            'callbackURL': 'https://restracer.herokuapp.com/auth/google/callback'
            //'callbackURL': 'http://localhost:3000/auth/google/callback'
        }
};