let db;
// create a new db request for a "BudgetDB" database.
const request = window.indexedDB.open("BudgetDB", 21);
request.onupgradeneeded = function (event) {
  // create object store called "BudgetStore" and set autoIncrement to true
  db = event.target.result;
if (db.objectStoreNames.length ===0 ) {
  db.createObjectStore('BudgetStore', { autoIncrement: true });
}
};

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  // log error here
  console.log(event.target.error);
};

function saveRecord(record) {
  // create a transaction on the pending db with readwrite access
  // access your pending object store
  // add record to your store with add method.
  const transaction = db.transaction(["BudgetStore"], "readwrite");
  const toDoListStore = transaction.objectStore("BudgetStore");
  toDoListStore.add(record);
}

function checkDatabase() {
  // open a transaction on your pending db
  // access your pending object store
  // get all records from store and set to a variable
  let transaction = db.transaction(['BudgetStore'], 'readwrite');
  const store = transaction.objectStore('BudgetStore');
  const getAll = store.getAll();
  //given
  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((data) => {
          // if successful, open a transaction on your pending db
          // access your pending object store
          // clear all items in your store
          if (data.length !==0) {
            transaction = db.transaction(['BudgetStore'], 'readwrite');
            const store = transaction.objectStore('BudgetStore');
            store.clear();
          }
        });
    }
  };
}

// listen for app coming back online
window.addEventListener('online', checkDatabase);