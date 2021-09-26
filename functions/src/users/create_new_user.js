const functions = require("firebase-functions");
const admin = require("firebase-admin");
// TODO: Create schemes
// const {
//   ZODScreateNewUser,
//   ZODSsocialLoginNewUser,
// } = require("../../tools/schemes");
const generateUniqueId = require("../../tools/generate_unique_id");

async function signupNewUser(uid, user) {
  return admin.auth().createUser({
    uid,
    email: user.email,
    password: user.password,
  });
}

async function createUserRecord(uid, user) {
  let newRecord = {
    creationTime: getTimeStampOfNow(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  };

  if (user.refId) newRecord.refId = user.refId;

  await admin
    .firestore()
    .collection("users")
    .doc(uid)
    .set(newRecord, { merge: true });
}

function getFullName(user) {
  return `${user.firstName.trim()} ${user.lastName.trim()}`;
}

/**
 *
 * Creates a new users. Signs the user up with auth, stores the data into the database
 * @memberOf CloudFunctions.userManagementFunctions
 * @param { String } firstName the first name of the applicant
 * @param { String } lastName the last name of the applicant
 * @param { String } email the email address of the applicant
 * @param { String } password the password is given by the user when registering
 * @param { String } uid the unique id of the user generated by firebase auth service
 * @param { Boolean } socialAuth it specifies if the sign up method was using social auth
 * @async
 *
 * @return { Boolean } error
 * @return { Number } error_code
 *
 * @throws { InvalidUserError } if userType is not one of the three accepted user-types
 *
 */

exports.default = functions.https.onCall(async (data, context) => {
  const user = data;
  // TODO: Check if given object is tightly correct
  // data.socialAuth
  //   ? ZODSsocialLoginNewUser.parse(data)
  //   : ZODScreateNewUser.parse(data);

  try {
    if (data.socialAuth) await admin.auth().deleteUser(user.uid);

    const uid = await generateUniqueId("users", getFullName(user));
    await signupNewUser(uid, user);
    await createUserRecord(uid, user);
  } catch (e) {
    console.log(e);
    return {
      error: true,
      error_code: e,
    };
  }
  return { error: false };
});
