import idb from './idb.js';
import * as H from './html-utils.js';
import STATE from './state.js';
import generateID from './generateID.js';

// TODO: need to design way to transition from main menu to event interface
// TODO: clean out message literals and replace w/STATE refs
// TODO: clean out id literals and replace w/STATE refs

/* START-UP
 *
 * create idb reference
 * load metadb
 * fetch db list
 *
 * fetch templates, parse and store
 * load main menu, populate lists, wire events, route options
 * await input
 */

const db = idb();

async function startup() {

    // set db.connection to event manager
    await loadEventManager();

    // retrieve template views and save as object of html containers
    const views = await getViews(STATE.HTML.TEMP_URL, STATE.HTML.VIEWS);
    document.querySelector('main').appendChild(views.mainMenu);

    populateMainMenu();
}

startup();

function loadEventManager() {

    return db.openDB({
        name: STATE.DB.MANAGER,
        version: 1,
        upgrade(ref) {
            /* All test code can be deleted, only the creation of the object
             * store must be kept (but not saved to const var test).
             */
            const test = ref.createObjectStore(STATE.DB.MANAGER_STORE,
                    { keyPath: 'id' });

            const testData = [
                { date: '2016-07-05', type: 'Provincials', scorer: 'Chris' },
                { date: '2016-06-26', type: 'Spring Shoot', scorer: 'Chris' },
                { date: '2016-08-17', type: 'Nationals', scorer: 'Chris' }
            ];

            testData.forEach(obj => {
                const idString = generateID(obj.date, obj.type);

                test.put(Object.assign({}, obj, { id: idString }));
            });
        }
    });
}

function getViews(url, viewList) {
    return fetch(url)
        .then(response => response.text())
        .then(htmlString => {
            const container = document.createElement('div');
            container.innerHTML = htmlString;
            return extractViews(container, viewList);
        })
        .catch(console.error);
}

function extractViews(container, viewIds) {

    return viewIds.reduce((viewObj, viewId) => {
        const view = container.querySelector(`#${viewId}`);
        viewObj[viewId] = view;

        return viewObj;
    }, {});
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
// MAIN MENU JS
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
function populateMainMenu() {

    // Add show/hide toggle to main menu forms
    mainMenuToggle();

    // Add/replace delete & load menu options
    refreshSelectOptions();

    // Route form submits
    mainMenuRouting();
}

function refreshSelectOptions() {

    return db.getAll('events')
        .then(insertSelectOptions)
        .catch(console.error);
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
// Add toggle to main menu forms
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
function mainMenuToggle() {
    const mainMenu = document.querySelectorAll('#mainMenu li');

    mainMenu.forEach(li => {
        li.querySelector('.mmOption').addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();

            H.toggleAttribute(li.querySelector('form'), 'hide');
        }, false);
    });
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
// Insert Select Input Options
// 
// Both the load event and remove event forms contain select elements with a
// list of past events. When an event is deleted these lists must be updated
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 

function insertSelectOptions(eventList) {
    const load      = document.querySelector('#mmLoadEvent'),
          remove    = document.querySelector('#mmRemoveEvent');

    H.clearNode(load);
    H.clearNode(remove);

    ascendingSortByProperty(eventList, 'id')
        .forEach(evt => {
            const { date, type, scorer } = evt;

            const txt = `${date} ${type} ${scorer}`;

            load.appendChild(H.createNode('option', txt));
            remove.appendChild(H.createNode('option', txt));
        });
}

function ascendingSortByProperty(arr, prop) {
    // sorts an array of objects by a given property into ascending order
    // property value must be string, no duplicates permitted

    return arr.sort((a, b) => {
        const strA = a[prop].toLowerCase(),
              strB = b[prop].toLowerCase();

        if (strA > strB) return -1;
        if (strA < strB) return 1;

        if (strA === strB) {
            throw new Error("duplicates in sort array");
        }
    });
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 

function mainMenuRouting() {
    const create    = document.querySelector('#mmCreate'),
          load      = document.querySelector('#mmLoad'),
          remove    = document.querySelector('#mmRemove');

    create.addEventListener('submit', e => {
        e.preventDefault();
        e.stopPropagation();

        handleCreate(create.elements);
    }, false);

    load.addEventListener('submit', e => {
        e.preventDefault();
        e.stopPropagation();

        handleLoad(load.elements);
    }, false);

    remove.addEventListener('submit', e => {
        e.preventDefault();
        e.stopPropagation();

        handleRemove(remove.elements);
    }, false);
}

async function handleCreate(formData) {
    const formObj = H.unpackForm(formData);

    await createEvent(formObj);
}

async function handleLoad(formData) {
    const formObj = H.unpackForm(formData);

    await loadEvent(formObj);
}

async function handleRemove(formData) {
    const formObj = H.unpackForm(formData);

    await removeEvent(formObj);
}

function eventExists(idString) {

    return db.getOne(STATE.DB.MANAGER_STORE, idString)
    .then(evt => typeof evt !== 'undefined' && evt.id ? true : false)
    .catch(console.error);
}

async function createEvent(formData) {
    // this assumes 'date' will be a string. if iOS returns an object there
    // will be trouble here
    const { date, type, scorer }    = formData;

    const id = generateID(date, type);

    const alreadyExists = await eventExists(id);

    if (await eventExists(id)) {
        console.log("It exists!");
        return;
        //showMessage(ERROR.EVENT_ALREADY_EXISTS);  // TODO design showMessage
    } else {
        console.log("It doesn't exist!");
    }

    return db.addOne(STATE.DB.MANAGER_STORE, { id, date, type, scorer })
    .then(() => {
        db.connection.close();
        return db.openDB({
            name: id,
            version: 1,
            upgrade(ref) {
                ref.createObjectStore(STATE.DB.KEY_STORE,
                        { keyPath: STATE.DB.KEY_PATH });

                STATE.AGGREGATES.forEach(agg => {
                    ref.createObjectStore(agg, { keyPath: STATE.DB.KEY_PATH });
                });
            }
        });
    })
    .catch(console.error);
}

function loadEvent(formData) {
    // loadEvent
    /*
    const { idString: loadID } = formData;

    return db.getOne(idString)
    .then(result => {
        if (result) {
            db.connection.close();
            return db.openDB({ name: idString });
        }
    });
    */
}

function removeEvent(formData) {
    // add check for db?
    const [ date, type ] = formData.remove.split(' ');

    const id = generateID(date, type);

    const tempDB = idb();

    return tempDB.openDB({ name: id })
        .then(() => tempDB.deleteDB(tempDB.connection))
        .then(console.log)
        .then(() => db.deleteSome(STATE.DB.MANAGER_STORE, id))
        .then(() => refreshSelectOptions())
        .catch(console.error);
}
