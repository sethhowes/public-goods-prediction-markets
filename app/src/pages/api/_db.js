const firebaseAdmin = require("./_firebase");

const firestore = firebaseAdmin.firestore();

/**** USERS ****/

// Get user by uid
function getUser(uid) {
  return firestore.collection("users").doc(uid).get().then(format);
}

// Get user by stripeCustomerId
function getUserByCustomerId(customerId) {
  return firestore
    .collection("users")
    .where("stripeCustomerId", "==", customerId)
    .get()
    .then(format)
    .then((docs) => (docs ? docs[0] : null)); // Get first result
}

// Update an existing user
function updateUser(uid, data) {
  return firestore.collection("users").doc(uid).update(data);
}

// Update a user by their stripeCustomerId
function updateUserByCustomerId(customerId, data) {
  return getUserByCustomerId(customerId).then((user) => {
    return updateUser(user.id, data);
  });
}

/**** HELPERS ****/

// Format Firestore response
function format(response) {
  // Converts doc into object that contains data and `doc.id`
  const formatDoc = (doc) => ({ id: doc.id, ...doc.data() });
  if (response.docs) {
    // Handle a collection of docs
    return response.docs.map(formatDoc);
  } else {
    // Handle a single doc
    return response.exists ? formatDoc(response) : null;
  }
}

module.exports = {
  getUser,
  getUserByCustomerId,

  updateUser,
  updateUserByCustomerId,
};
