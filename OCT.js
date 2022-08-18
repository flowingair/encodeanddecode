function OCTEncode(input) {
    var output = '';
    var empty = true;
    for (i = 0; i < input.length; i++) {
        if (!empty) {
            output += ',';
        }
        output += input.charCodeAt(i);
        empty = false;
    }
    return output;
}

function OCTDecode(input) {
    if (input != '') {
        var input_array = input.substring(0, input.length).split(',')
        var output = ''
        for (i = 0; i < input_array.length; i++) {
            let number = parseInt(input_array[i]);
            if (number < 0) {
                number += 256;
            }
            if (number < 0 || number > 256) {
                return '';
            }
            if (2 > number.toString(16).length) {
                output += '%0' + number.toString(16);
            } else {
                output += '%' + number.toString(16);
            }
        }
        console.log(output);
        return unescape(output);
    }
}