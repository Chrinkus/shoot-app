function idb() {
    // Private reference
    let db;

    /* DB Management
     * openDB - create, access, update
     * deleteDB - delete
     */

    function openDB(config) {
        const { name, version, upgrade } = config;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(name, version);

            request.onerror = () => reject(request.errorCode);
            request.onsuccess = () => resolve(request.result);

            if (upgrade) {
                request.onupgradeneeded = () => upgrade(request.result);
            }
        })
        .then(dbRef => {
            db = dbRef;

            return Promise.resolve(`opened ${name}, version ${version}`);
        })
        .catch(console.error);
    }

    function deleteDB(connection) {
        const { name, version } = connection;

        connection.close();

        return new Promise((resolve, reject) => {
            const request = indexedDB.deleteDatabase(name);

            request.onerror = () => reject(request.errorCode);
            request.onsuccess = () => resolve(`${name} ${version} deleted`);
        })
        .catch(console.error);
    }

    /* CRUD ops
     * getOne
     * addOne
     * deleteSome
     * updateOne
     */

    function getOne(store, key) {
        return new Promise((resolve, reject) => {
            const request = db
                .transaction(store, 'readonly')
                .objectStore(store)
                .get(key);

            request.onerror = () => reject(request.errorCode);
            request.onsuccess = () => resolve(request.result);
        });
    }

    function addOne(store, record) {
        return new Promise((resolve, reject) => {
            const request = db
                .transaction(store, 'readwrite')
                .objectStore(store)
                .add(record);

            request.onerror = () => reject(request.errorCode);
            request.onsuccess = () => resolve(request.result);
        });
    }

    function deleteSome(store, key) {
    /* The behaviour of the ObjectStore.delete() method is to take either
     * a key or a key range thus allowing the delete to remove a single or
     * many records from the store. To reflect this capability 'deleteSome'
     * has been chosen as the appropriate name for this function.
     */
        return new Promise((resolve, reject) => {
            const request = db
                .transaction(store, 'readwrite')
                .objectStore(store)
                .delete(key);

            request.onerror = () => reject(request.errorCode);
            request.onsuccess = () => resolve(request.result);
        });
    }

    function updateOne(store, key, changes) {
        const storeRef = db
            .transaction(store, 'readwrite')
            .objectStore(store);

        return new Promise((resolve, reject) => {
            const request = storeRef.get(key);

            request.onerror = () => reject(request.errorCode);
            request.onsuccess = () => resolve(request.result);
        })
        .then(record => {
            Object.keys(changes).forEach(key => {
                record[key] = changes[key];
            });

            return new Promise((resolve, reject) => {
                const request = storeRef.keyPath
                        ? storeRef.put(record)
                        : storeRef.put(record, key);

                request.onerror = () => reject(request.errorCode);
                request.onsuccess = () => resolve(request.result);
            });
        });
    }

    /* Macro CRUD
     * getAll
     * updateAll
     */

    function getAll(store) {
        return new Promise((resolve, reject) => {
            const request = db
                .transaction(store, 'readonly')
                .objectStore(store)
                .getAll();

            request.onerror = () => reject(request.errorCode);
            request.onsuccess = () => resolve(request.result);
        });
    }

    function updateAll(store, fn) {
        // fn is transforming function to update each record
        return new Promise((resolve, reject) => {
            const request = db
                .transaction(store, 'readwrite')
                .objectStore(store)
                .openCursor();

            request.onerror = () => reject(request.errorCode);
            request.onsuccess = () => {
                const cursor = request.result;

                if (cursor) {
                    const updatedRecord = fn(cursor.value),
                          request = cursor.update(updatedRecord);

                    request.onerror = () => reject(request.errorCode);

                    cursor.continue();
                } else {
                    resolve(request.result);
                }
            };
        });
    }

    /* Selective gets
     * getOnlyProps
     * getAllOnlyProps
     */

    function getOnlyProps(store, argObj) {
        const { key, props, alias } = argObj;
        // Need specific columns
        return new Promise((resolve, reject) => {
            const request = db
                .transaction(store, 'readonly')
                .objectStore(store)
                .get(key);

            request.onerror = () => reject(errorCode);
            request.onsuccess = () => {
                const record = request.result,
                      extract = extractObj(record, props, alias);

                return resolve(extract);
            };
        });
    }

    function getAllOnlyProps(store, argObj) {
        const { props, alias } = argObj;

        return new Promise((resolve, reject) => {
            const request = db
                .transaction(store, 'readonly')
                .objectStore(store)
                .openCursor();

            const resultsArray = [];

            request.onerror = () => reject(request.errorCode);
            request.onsuccess = () => {
                const cursor = request.result;

                if (cursor) {
                    const record = cursor.value,
                          extract = extractObj(record, props, alias);

                    resultsArray.push(extract);

                    cursor.continue();
                } else {
                    return resolve(resultsArray);
                }
            };
        });
    }

    // Private methods
    function extractObj(obj, props, aliases) {
        
        return props.reduce((extracted, prop, i) => {
            const label = aliases && aliases[i] ? aliases[i] : prop;
            extracted[label] = obj[prop];
            return extracted;
        }, {});
    }

    return Object.freeze({
        // DB management
        openDB,
        deleteDB,

        // CRUD
        getOne,
        addOne,
        deleteSome,
        updateOne,

        // Macro CRUD
        getAll,
        updateAll,

        // Selective gets
        getOnlyProps,
        getAllOnlyProps,

        // connection reference
        get connection() {
            return db;
        }
    });
}

export { idb as default };
