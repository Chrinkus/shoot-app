const assert = require('assert');

const { generateID, getDateStr } = require('../scripts/generateID');

describe('generateID.js', function() {

    describe('generateID()', function() {

        it("should return expected string", function() {
            const testDate = new Date('Oct 11 2017'),
                  testType = 'Provincials',
                  result = generateID(testDate, testType);

            assert.equal(result, '2017-10-11-provincials');
        });

        it("should be accurately sortable", function() {
            const test1 = generateID(new Date('Aug 8 2017'), 'Nationals'),
                  test2 = generateID(new Date('Jun 26 2017'), 'Provincials'),
                  test3 = generateID(new Date('Jun 26 2017'), 'Exhibition'),
                  result = [ test1, test3, test2 ];

            assert.equal(result.sort()[0], test3);
        });
    });

    describe('getDateStr()', function() {

        it("should return expected format", function() {
            const result = getDateStr(new Date('Oct 11 2017'));

            assert.equal(result, '2017-10-11');
        });

        it("should be convertable back to original Date", function() {
            /* Currently fails due to timezone offset
             * different dateStrings subtley produce different timezone
             * values for the same date
             */
            const testDate = new Date('Oct 26, 1997'),
                  testStr = getDateStr(testDate),
                  result = new Date(testStr);

            assert.equal(result, testDate);
        });
    });
});
