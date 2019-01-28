const zclId = require('zcl-id/dist/legacy');

var FoundClass = require('../src/foundation')(zclId);

const foundCmd = Object.keys(require('zcl-id/src/definitions/common.json').foundation);

const valObj = {
    read: [
        {attrId: 0x1111},
        {attrId: 0x2222},
        {attrId: 0x3333},
    ],
    readRsp: [
        {attrId: 0x1111, status: 0, dataType: 0x48, attrData: {elmType: 0x20, numElms: 5, elmVals: [1, 2, 3, 4, 5]}},
        {attrId: 0x2222, status: 0, dataType: 0x4c, attrData: {numElms: 0x03, structElms: [{elmType: 0x20, elmVal: 1}, {elmType: 0x21, elmVal: 300}, {elmType: 0x22, elmVal: 65539}]}},
        {attrId: 0x3333, status: 1},
        {attrId: 0x4444, status: 0, dataType: 0x27, attrData: '0x000205680001e240'},
    ],
    write: [
        {attrId: 0x1234, dataType: 0x41, attrData: 'hello'},
        {attrId: 0xabcd, dataType: 0x24, attrData: [100, 2406]},
        {attrId: 0x1234, dataType: 0x08, attrData: 60},
    ],
    writeUndiv: [
        {attrId: 0x1234, dataType: 0x41, attrData: 'hello'},
        {attrId: 0xabcd, dataType: 0x24, attrData: [100, 2406]},
        {attrId: 0x1234, dataType: 0x08, attrData: 60},
    ],
    writeRsp: [
        {status: 0},
        {status: 1, attrId: 0xbbbb},
        {status: 1, attrId: 0xcccc},
    ],
    writeNoRsp: [
        {attrId: 0x1234, dataType: 0x41, attrData: 'hello'},
        {attrId: 0xabcd, dataType: 0x24, attrData: [100, 2406]},
        {attrId: 0x1234, dataType: 0x08, attrData: 60},
    ],
    configReport: [
        {direction: 0, attrId: 0x0001, dataType: 0x20, minRepIntval: 500, maxRepIntval: 1000, repChange: 10},
        {direction: 1, attrId: 0x0001, timeout: 999},
        {direction: 0, attrId: 0x0001, dataType: 0x43, minRepIntval: 100, maxRepIntval: 200},
    ],
    configReportRsp: [
        {status: 0},
        {status: 1, direction: 1, attrId: 0x0022},
        {status: 3, direction: 0, attrId: 0x0222},
    ],
    readReportConfig: [
        {direction: 0, attrId: 0x0001},
        {direction: 0, attrId: 0x0011},
        {direction: 0, attrId: 0x0111},
    ],
    readReportConfigRsp: [
        {status: 0, direction: 0, attrId: 0x0001, dataType: 0x20, minRepIntval: 500, maxRepIntval: 1000, repChange: 10},
        {status: 1, direction: 0, attrId: 0x1234},
        {status: 0, direction: 1, attrId: 0x0001, timeout: 999},
    ],
    report: [
        {attrId: 0x9999, dataType: 0x41, attrData: 'imhedy'},
        {attrId: 0x8888, dataType: 0x21, attrData: 65530},
        {attrId: 0x7777, dataType: 0x20, attrData: 99},
    ],
    defaultRsp: {
        cmdId: 10,
        statusCode: 20,
    },
    discover: {
        startAttrId: 0x0001,
        maxAttrIds: 50,
    },
    discoverRsp: {
        discComplete: 0,
        attrInfos: [
            {attrId: 0x0369, dataType: 0x25},
            {attrId: 0x0963, dataType: 0x26},
            {attrId: 0x0321, dataType: 0x27},
        ],
    },
    readStruct: [
        {attrId: 0x1111, selector: {indicator: 2, indexes: [0x0101, 0x0202]}},
        {attrId: 0x2222, selector: {indicator: 0}},
        {attrId: 0x1111, selector: {indicator: 5, indexes: [0x0101, 0x0202, 0x0303, 0x0404, 0x0505]}},
    ],
    writeStruct: [
        {attrId: 0x0011, selector: {indicator: 3, indexes: [0x0101, 0x0202, 0x0303]}, dataType: 0x21, attrData: 60000},
        {attrId: 0x0022, selector: {indicator: 0}, dataType: 0x50, attrData: {elmType: 0x20, numElms: 3, elmVals: [1, 2, 3]}},
        {attrId: 0x0033, selector: {indicator: 1, indexes: [0x0101]}, dataType: 0x4c, attrData: {numElms: 0x01, structElms: [{elmType: 0x20, elmVal: 1}]}},
    ],
    writeStructRsp: [
        {status: 0, attrId: 0x0001, selector: {indicator: 3, indexes: [0x0101, 0x0202, 0x0303]}},
        {status: 0, attrId: 0x0002, selector: {indicator: 2, indexes: [0x0101, 0x0202]}},
        {status: 1, attrId: 0x0003, selector: {indicator: 1, indexes: [0x0101]}},
    ],
};

describe('Foundation Cmd framer and parser Check', function () {
    foundCmd.forEach(function (cmd) {
        if (!valObj[cmd]) return;

        it(cmd + ' frame() and parse() check', function () {
            let cmdPayload = new FoundClass(cmd);

            let zBuf = cmdPayload.frame(valObj[cmd]);

            cmdPayload.parse(zBuf, function (err, result) {
                expect(result).toEqual(valObj[cmd]);
            });
        });
    });
});

describe('Binary attributes parsing', () => {
    it('should parse ascii encoded not null-terminated charStr(datatype 66)', (done) => {
        const binary = Buffer.from([
            '0121950b0328200421a84305217b0',
            '0062400000000000a210000641001',
        ].join(''), 'hex');

        const frame = Buffer.from([
            '0500420673656e736f72e803421d',
            binary.toString('hex'),
        ].join(''), 'hex');

        const parser = new FoundClass(10);

        parser.parse(frame, (err, result) => {
            result[1].attrData = Buffer.from(result[1].attrData, 'ascii');

            expect(result).toEqual([
                {attrId: 5, dataType: 66, attrData: 'sensor'},
                {attrId: 1000, dataType: 66, attrData: binary},
            ]);

            done();
        });
    });
});