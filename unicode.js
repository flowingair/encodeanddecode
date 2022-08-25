function unicode_encode_full(input) {
    var output = "";
    for (var i = 0; i < input.length; i++) {
        if (input[i].match(/([0-9A-z])/gi)) {
            output += "\\u00" + input.charCodeAt(i).toString(16).toUpperCase();
        } else {
            output += "\\u" + input.charCodeAt(i).toString(16).toUpperCase();
        }
    }
    return output;
}

function unicode_encode(input) {
    var output = "";
    for (var i = 0; i < input.length; i++) {
        if (input[i].match(/([0-9A-z])/gi)) {
            // output += "\\u00" + input.charCodeAt(i).toString(16).toUpperCase();
        } else {
            output += "\\u" + input.charCodeAt(i).toString(16).toUpperCase();
        }
    }
    return output;
}

function uicode_decode_old(input) {
    n = n.replace(/\\/g, "%").replace("%u0025", "%25");
    n = unescape(n.toString().replace(/%2B/g, "+"));
    var l = n.match(/(%u00([0-9A-F]{2}))/gi);
    if (l) {
        for (var m = 0; m < l.length; m++) {
            var k = l[m].substring(1, 3);
            var j = Number("0x" + k);
            if (j >= 128) {
                n = n.replace(l[m], k)
            }
        }
    }
    n = unescape(n.toString().replace(/%2B/g, "+"));
    return n
}

function octal(input) {
    if (input.match(/[0-7]/gi)) {
        let output = parseInt(input, 8);
        output = String.fromCharCode(output);
        return output;
    } else {
        return "\\" + input;
    }
}

function hexadecimal(input) {
    if (input.match(/[0-9A-Fa-f]/gi)) {
        let output = parseInt(input, 16);
        output = String.fromCharCode(output);
        return output;
    } else {
        return "\\x" + input;
    }
}

function unicode(input) {
    if (input.match(/[0-9A-Fa-f]/gi)) {
        let output = parseInt(input, 16);
        output = String.fromCharCode(output);
        return output;
    } else {
        return "\\u" + input;
    }
}
function unicode_decode(input) {
    let data = input.split("\\");
    let first = true;
    let output = "";
    for (let index = 0; index < data.length; index++) {
        if (first) {
            first = false;
            if ('' != data[index]) {
                output = ouput = data[index];
            }
        } else {
            if ('u' == data[index][0]) {
                output = output + unicode(data[index].substr(1, 4));
                output = output + data[index].substr(5);
                continue;
            }
            if ('x' == data[index][0]) {
                output = output + hexadecimal(data[index].substr(1, 2));
                output = output + data[index].substr(3);
                continue;
            }
            if (data[index][0].match(/[0-9]/gi)) {
                if (data[index][1].match(/[0-9]/gi)) {
                    if (data[index][2].match(/[0-9]/gi)) {
                        output = output + octal(data[index].substr(0, 3));
                        output = output + data[index].substr(3);
                    } else {
                        output = output + octal(data[index].substr(0, 2));
                        output = output + data[index].substr(2);
                    }
                } else {
                    output = output + octal(data[index].substr(0, 1));
                    output = output + data[index].substr(1);
                }
                continue;
            }
            output = output + "\\";
        }
    }
    return output;

}
input = "\\u4E2D\\u4E2D";
unicode_decode(input);