let db;

const request = indexedDB.oppen('budget_tracker', 1);

request.onupgradeneeded = function(event) {
    const db=event.target.result;

    db.createObjectStore('budget_tracker', {autoIncrement: true});
};

request.onsuccess = function(event) {
    db = event.target.result;

    if(navigator.onLine) {
        // function needed
        uploadBudget();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
}

// offline functionality
function saveRecord(record) {
    const transaction = db.transaction(['new_budget'], 'readwrite');

    const budgetObjectStore = transaction.objectStore('new_budget');

    budgetObjectStore.add(record);
}

function uploadBudget() {
    const transaction = db.transaction(['new_budget'], 'readwrite');

    const budgetObjectStore = transaction.objectStore('new_budget');

    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {
        if(getAll.result.length > 0) {
            fetch('/api/transaction', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(serverResponse => {
            if(serverResponse.message) {
                throw new Error(serverResponse);
            }

            const transaction = db.transaction(['new_budget'], 'readwrite');

            const budgetObjectStore = transaction.objectStore('new_budget');

            budgetObjectStore.clear();

            alert('All transactions have been submitted!');
        })
        .catch(err => {
            console.log(err);
        });

        }
    };
}

window.addEventListener('online', uploadBudget);