const STATE = {
    
    DB: {
        MANAGER: 'EVENT_MANAGER',
        MANAGER_STORE: 'events',
        KEY_STORE: 'roster',
        KEY_PATH: 'bench'
    },

    HTML: {
        TEMP_URL: '../html/templates.html',
        // VIEWS MUST SYNC WITH TEMPLATE SECTION IDS
        VIEWS: [ 'mainMenu', 'roster', 'scoring' ]
    },

    AGGREGATES: ['lv100', 'lv200', 'hv100', 'hv200'],
    MATCHES: ['Match 1', 'Match 2', 'Match 3', 'Match 4', 'Match 5'],
    GRAND_AGGREGATES: {
        light: ['lv100', 'lv200'],
        heavy: ['hv100', 'hv200'],
        twoGun: ['light', 'heavy']
    },
    VIEWS: ['start', 'roster', 'enterScores']
};

export { STATE as default };
