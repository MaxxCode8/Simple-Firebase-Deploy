
// This is not how production apps are structured, but it keeps things simple for now
// The structure is implemented using a framework like React or Vue!
///// User Authentication /////
const auth = firebase.auth();

const whenSignedIn = document.getElementById('whenSignedIn');
const whenSignedOut = document.getElementById('whenSignedOut');

const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');

const userDetails = document.getElementById('userDetails');

const provider = new firebase.auth.GoogleAuthProvider();

/// Sign in event handlers
signInBtn.onclick = () => auth.signInWithPopup(provider);
signOutBtn.onclick = () => auth.signOut();

auth.onAuthStateChanged(user => {
    if(user){
        // signed in
        whenSignedIn.hidden = false;
        whenSignedOut.hidden = true;
        userDetails.innerHTML = `<h3 style="font-family: Gerogia;"> Namskar "${user.displayName}"!</h3> <p>User ID: ${user.uid}</p>`
    }else {
        // not signed in
        whenSignedIn.hidden = true;
        whenSignedOut.hidden = false;
        userDetails.innerHTML = ``
    }
});

///// Firestore /////
const db = firebase.firestore();

const createExp = document.getElementById('createExp');
const expsList = document.getElementById('expsList');

let expsRef;
let unsubscribe;

auth.onAuthStateChanged(user => {
    if(user){
        // Database Reference
        expsRef = db.collection('exps') 
        createExp.onclick = () => {
            const { serverTimestamp } = firebase.firestore.FieldValue;
            expsRef.add({
                uid: user.uid,
                name: faker.commerce.productName(),
                createdAt: serverTimestamp()
            });
        }
        // query
        unsubscribe = expsRef
            .where('uid', '==', user.uid)
            .orderBy('createdAt') // requires a query (Composite index) on the server
            .onSnapshot(querySnapshot => {
            const items = querySnapshot.docs.map(doc => {
                return `<li>${ doc.data().name }</li>`
            });
            expsList.innerHTML = items.join('');
        });
    // Unsubscribe when the user signs out
    } else {
        unsubscribe && unsubscribe();
    } 
});