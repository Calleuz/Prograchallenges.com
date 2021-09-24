const functions = require('firebase-functions')
const admin = require('firebase-admin')

const insertChallenge = (functions, admin) => functions.https.onCall(async (data) => {
    const challengeTitle = data.title;
    const challengeUserEmail = data.email;
    const challengeUserNickName = data.nickname;
    const challengeText = data.text;
    const challengeLanguage = data.language

    if(challengeText === '' || challengeUserEmail === '' || challengeUserNickName === '' || challengeTitle === '' || challengeLanguage === ''){
        throw new functions.https.HttpsError('invalid-argument', 'All fields are required')
    }

    await admin.firestore().collection('challenges').add({
        title: challengeTitle,
        email: challengeUserEmail,
        nickname: challengeUserNickName,
        text: challengeText,
        language: challengeLanguage
    })

    return 'Challenge added succesfully'
})

module.exports = insertChallenge