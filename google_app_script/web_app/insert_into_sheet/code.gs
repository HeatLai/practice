const SHEET_URL = 'https://docs.google.com/spreadsheets/d/xxxxxx/edit';
const SHEET_GID = 12345678;
const GAS_POST_SIGN_SALT = 'MTUyNTMxOTliNDdkNDQ3Ng==';

function doPost(e) {
    e.method = "POST";
    console.log('Request:::', e);

    var param = e.parameter;
    var res = {
        action: 'doPost',
        status: true,
        code: 0,
    };

    // check token
    if( ! checkToken(param) ) {
        res.code = 1;
        res.status = false;
        return jsonResponse(res);
    }

    // find date row or fail
    var date = param.datetime;
    var findedRow = getRowByDate(date);
    if( findedRow === -1 ) {
        res.code = 2;
        res.status = false;
        return jsonResponse(res);
    }

    // update values
    var sheet = getSheetById(SHEET_GID);
    // get findedRow's col C:F
    // getRange(取第幾個row, 從C欄開始, 總共拿 1 行, 總共拿 4 欄)
    // getRange 的 index 是從 1 開始算
    var valueRange = sheet.getRange(findedRow, 3, 1, 4);
    var values = [
        param.all_registered,
        param.yesterday_registered,
        param.yesterday_login,
        param.yesterday_oubo
    ];

    valueRange.setValues([values]);
    // valueRange.setBackground('yellow');

    return jsonResponse(res);
}

function jsonResponse(data) {
    console.log('jsonResponse:::', data);
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * @return int
 */
function getRowByDate(date) {
    var sheet = getSheetById(SHEET_GID);

    // getValues() if the cell is DateFormat, will get a Date object
    var rangeA4toEnd = sheet.getRange("A4:A"+sheet.getLastRow()).getValues();

    // find date matches index
    // 注意 new Date() 會用本地時區，一定要設定好時區
    var searchDate = Utilities.formatDate(new Date(date), "Asia/Tokyo", "YYYY/MM/dd");
    var findedRow = rangeA4toEnd.findDateIndex(searchDate);

    // 因為上面 getRange 是從 A4 開始
    // 所以 rowIndex 要 +4 才是真正 sheet 的 rowIndex
    return ( findedRow === -1 ) ? findedRow : findedRow + 4;
}

/**
 * 日期欄位搜尋
 * @return int
 */
Array.prototype.findDateIndex = function(searchDate){
    if(searchDate == "") return false;
    for (var i = 0; i < this.length; i++) {
        try {
            // skip not Date
            if( !(this[i][0] instanceof Date) ) continue;

            var date = Utilities.formatDate(this[i][0], "Asia/Tokyo", "YYYY/MM/dd");
            if (date == searchDate) {
                return i;
            }
        } catch (e) {}
    }
    return -1;
};

/**
 * @return boolean
 */
function checkToken(arr) {
    if(!arr._token) return false;
    const time = parseInt('0x' + arr._token.substr(-8));
    const token = arr._token.substring(0, arr._token.length - 8);
    delete arr._token;
    const fieldnames = Object.keys(arr).sort();
    let col = [];
    for(var k of fieldnames)
        col.push(k + '=' + arr[k]);

    const hashBa = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, col.join('|') + '||' + GAS_POST_SIGN_SALT + '@' + time);
    const rez = hashBa.map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
    return rez === token;
}


/**
 * @return Sheet
 */
function getSheetById(id) {
    var ss = SpreadsheetApp.openByUrl(SHEET_URL);
    return ss.getSheets().filter(
        function(s) {return s.getSheetId() === id;}
    )[0];
}
