var baidu = function () {
    this.version = "1.3.5"
};
baidu.namespace = new Object();
baidu.namespace.register = function (fullNS) {
    var reg = /^[_$a-z]+[_$a-z0-9]*/i;
    var nsArray = fullNS.split(".");
    var sEval = "";
    var sNS = "";
    for (var i = 0; i < nsArray.length; i++) {
        if (!reg.test(nsArray[i])) {
            throw new Error("Invalid namespace:" + nsArray[i] + "");
            return
		}
        if (i != 0) {
            sNS += "."
		}
        sNS += nsArray[i];
        sEval += "if (typeof(" + sNS + ") == 'undefined') " + sNS + " = new Object();"
	}
    if (sEval != "") {
        eval(sEval)
	}
};
String.prototype.trim = function () {
    return this.replace(/^\s*|\s*$/g, "")
};
String.prototype.format = function () {
    var b = arguments.length,
	a = this;
    while (b--) {
        a = a.replace(new RegExp("\\{" + b + "\\}", "g"), arguments[b])
	}
    return a
};
Date.prototype.format = function (e) {
    var a = function (m, l) {
        var n = "",
		k = (m < 0),
		j = String(Math.abs(m));
        if (j.length < l) {
            n = (new Array(l - j.length + 1)).join("0")
		}
        return (k ? "-" : "") + n + j
	};
    if ("string" != typeof e) {
        return this.toString()
	}
    var b = function (k, j) {
        e = e.replace(k, j)
	};
    var f = this.getFullYear(),
	d = this.getMonth() + 1,
	i = this.getDate(),
	g = this.getHours(),
	c = this.getMinutes(),
	h = this.getSeconds();
    b(/yyyy/g, a(f, 4));
    b(/yy/g, a(parseInt(f.toString().slice(2), 10), 2));
    b(/MM/g, a(d, 2));
    b(/M/g, d);
    b(/dd/g, a(i, 2));
    b(/d/g, i);
    b(/HH/g, a(g, 2));
    b(/H/g, g);
    b(/hh/g, a(g % 12, 2));
    b(/h/g, g % 12);
    b(/mm/g, a(c, 2));
    b(/m/g, c);
    b(/ss/g, a(h, 2));
    b(/s/g, h);
    return e
};
String.prototype.getBytes = function () {
    var b = this.replace(/\n/g, "xx").replace(/\t/g, "x");
    var a = encodeURIComponent(b);
    return a.replace(/%[A-Z0-9][A-Z0-9]/g, "x").length
};
var getOuterHtmlEllipsis = function (d) {
    var b = /(<[^>]+>)/g;
    var a = b.exec(d.outerHTML);
    var c = a ? a[1] : d.outerHTML;
    c = c.length > 40 ? c.substr(0, 40) + "..." : c;
    return c.replace(/</g, "<").replace(/>/g, ">")
};
var getOuterAndInnerHtmlEllipsis = function (b) {
    var a = jQuery("<div></div>").append(b).html()
};
(function () {
    baidu.i18n = {};
    baidu.i18n.getMessage = function (d, b) {
        if (b) {
            for (var c = 0, a = b.length; c < a; c++) {
                b[c] = "" + b[c]
			}
            return chrome.i18n.getMessage(d, b)
			} else {
            return chrome.i18n.getMessage(d)
		}
	}
})();
baidu.namespace.register("baidu.endecode");
baidu.endecode = (function () {
    var c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var h = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -
	1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55,
	56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
	17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,
	39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);
    var f = function (m) {
        m = escape(m.toString()).replace(/\+/g, "%2B");
        var k = m.match(/(%([0-9A-F]{2}))/gi);
        if (k) {
            for (var l = 0; l < k.length; l++) {
                var j = k[l].substring(1, 3);
                if (parseInt(j, 16) >= 128) {
                    m = m.replace(k[l], "%u00" + j)
				}
			}
		}
        m = m.replace("%25", "%u0025").replace(/%/g, "\\");
        return m
	};
    var a = function (n) {
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
	};
    var e = function (m) {
        var k, l, j, n;
        k = "";
        j = m.length;
        for (l = 0; l < j; l++) {
            n = m.charCodeAt(l);
            if ((n >= 1) && (n <= 127)) {
                k += m.charAt(l)
				} else {
                if (n > 2047) {
                    k += String.fromCharCode(224 | ((n >> 12) & 15));
                    k += String.fromCharCode(128 | ((n >> 6) & 63));
                    k += String.fromCharCode(128 | ((n >> 0) & 63))
					} else {
                    k += String.fromCharCode(192 | ((n >> 6) & 31));
                    k += String.fromCharCode(128 | ((n >> 0) & 63))
				}
			}
		}
        return k
	};
    var i = function (o) {
        var k, m, j, p;
        var n, l;
        k = "";
        j = o.length;
        m = 0;
        while (m < j) {
            p = o.charCodeAt(m++);
            switch (p >> 4) {
				case 0:
				case 1:
				case 2:
				case 3:
				case 4:
				case 5:
				case 6:
				case 7:
                k += o.charAt(m - 1);
                break;
				case 12:
				case 13:
                n = o.charCodeAt(m++);
                k += String.fromCharCode(((p & 31) << 6) | (n & 63));
                break;
				case 14:
                n = o.charCodeAt(m++);
                l = o.charCodeAt(m++);
                k += String.fromCharCode(((p & 15) << 12) | ((n & 63) << 6) | ((l & 63) << 0));
                break
			}
		}
        return k
	};
    var g = function (p) {
        var l, n, j;
        var o, m, k;
        j = p.length;
        n = 0;
        l = "";
        while (n < j) {
            o = p.charCodeAt(n++) & 255;
            if (n == j) {
                l += c.charAt(o >> 2);
                l += c.charAt((o & 3) << 4);
                l += "==";
                break
			}
            m = p.charCodeAt(n++);
            if (n == j) {
                l += c.charAt(o >> 2);
                l += c.charAt(((o & 3) << 4) | ((m & 240) >> 4));
                l += c.charAt((m & 15) << 2);
                l += "=";
                break
			}
            k = p.charCodeAt(n++);
            l += c.charAt(o >> 2);
            l += c.charAt(((o & 3) << 4) | ((m & 240) >> 4));
            l += c.charAt(((m & 15) << 2) | ((k & 192) >> 6));
            l += c.charAt(k & 63)
		}
        return l
	};
    var b = function (q) {
        var p, o, m, k;
        var n, j, l;
        j = q.length;
        n = 0;
        l = "";
        while (n < j) {
            do {
                p = h[q.charCodeAt(n++) & 255]
			} while (n < j && p == -1);
            if (p == -1) {
                break
			}
            do {
                o = h[q.charCodeAt(n++) & 255]
			} while (n < j && o == -1);
            if (o == -1) {
                break
			}
            l += String.fromCharCode((p << 2) | ((o & 48) >> 4));
            do {
                m = q.charCodeAt(n++) & 255;
                if (m == 61) {
                    return l
				}
                m = h[m]
			} while (n < j && m == -1);
            if (m == -1) {
                break
			}
            l += String.fromCharCode(((o & 15) << 4) | ((m & 60) >> 2));
            do {
                k = q.charCodeAt(n++) & 255;
                if (k == 61) {
                    return l
				}
                k = h[k]
			} while (n < j && k == -1);
            if (k == -1) {
                break
			}
            l += String.fromCharCode(((m & 3) << 6) | k)
		}
        return l
	};
    var d = function (m) {
        var k, l, j, n;
        k = "";
        j = m.length;
        for (l = 0; l < j; l++) {
            n = m.charCodeAt(l);
            if ((n >= 1) && (n <= 127)) {
                k += m.charAt(l)
				} else {
                if (n > 2047) {
                    k += String.fromCharCode(224 | ((n >> 12) & 15));
                    k += String.fromCharCode(128 | ((n >> 6) & 63));
                    k += String.fromCharCode(128 | ((n >> 0) & 63))
					} else {
                    k += String.fromCharCode(192 | ((n >> 6) & 31));
                    k += String.fromCharCode(128 | ((n >> 0) & 63))
				}
			}
		}
        return k
	};
    return {
        uniEncode: f,
        uniDecode: a,
        base64Encode: g,
        base64Decode: b,
        utf8Encode: e,
        utf8Decode: i,
        utf16to8: d
	}
})();
var hexcase = 0;
var b64pad = "";
var chrsz = 8;

//
function dec2hex(n) {
    var hex = "0123456789ABCDEF";
    var mask = 0xf;
    var retstr = "";
    while (n != 0) {
        retstr = hex.charAt(n & mask) + retstr;
        n >>>= 4;
	}
    return retstr.length == 0 ? "0" : retstr;
}
function url_Encode_full(a)
{
	var output="";
	for(var i=0;i<a.length;i++)
	{
		if(a.charCodeAt(i).toString(16).toUpperCase().length < 2)
		{
			output +="%0"+a.charCodeAt(i).toString(16).toUpperCase();
			}else{
			output +="%"+a.charCodeAt(i).toString(16).toUpperCase();
		}
	}
	return output;
	//return "url_Encode_full"
}
function ten_Encode(a) {
	var output = '';
    for (i = 0; i < a.length; i++) {
        output +=a.charCodeAt(i)+',';
	}
    return output;
    //return "ten_Encode"
}
function ten_Decode(a) {
	if (a != '')
	{
		var uniText = a;
		var testText = uniText.substring(0, uniText.length).split(",")
		var resultString = ""
		var output=""
		for (i = 0; i < testText.length-1; i++)
		{
			if (dec2hex(testText[i]).length < 2) {
				resultString += "%0" + dec2hex(testText[i]);
				} else {
				resultString += "%" + dec2hex(testText[i]);
			}	
		}
		output +=unescape(resultString);
		return output
	}
    //return "ten_Decode"
}
function morse_Encode(a) {
	return GO(a);
    //return "morse_Encode"
}
function morse_Decode(a) {
	return UNGO(a);
    //return "morse_Decode"
}
function eval_jsfuck(a) {
    return JSFuck.encode(a,true);
}
function jsfuck(a) {
    return JSFuck.encode(a,false);
}
function base32Encode(srcString)
{
	if(srcString=='')return '';
	//var srcString = 'abc';
	var BASE32CHAR = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
	var i = 0;
	var index = 0;
	var digit = 0;
	var currByte;
	var nextByte;
	var retrunString = '';
	for (var i = 0; i < srcString.length; )
	{
		//var          index    = 0;
		currByte = (srcString.charCodeAt(i) >= 0) ? srcString.charCodeAt(i): (srcString.charCodeAt(i) + 256);
		if (index > 3) {
			if ((i + 1) < srcString.length)
			{
				nextByte = (srcString.charCodeAt(i + 1) >= 0)? srcString.charCodeAt(i + 1): (srcString.charCodeAt(i + 1) + 256);
				} else{
				nextByte = 0;
			}
			digit = currByte & (0xFF >> index);
			index = (index + 5) % 8;
			digit <<= index;
			digit |= (nextByte >> (8 - index));
			i++;
			} else {
			digit = (currByte >> (8 - (index + 5))) & 0x1F;
			index = (index + 5) % 8;
			if (index == 0)
			{
				i++;
			}
		}
		retrunString = retrunString + BASE32CHAR.charAt(digit);
	}
	for(var ai=0;ai<8-index;ai++)
	{
		retrunString +='=';
	}
	return retrunString;
	//return "base32Encode";
}
function base32Decode(input)
{
	if(input=='')return '';
	//var bytes=new Array([parseInt(input.length * 5 / 8)]);
	var temp=0;
	var bytes="";
	bytes_l=parseInt(input.length * 5 / 8);
	var base32Lookup =new Array(
	0xFF,0xFF,0x1A,0x1B,0x1C,0x1D,0x1E,0x1F, // '0', '1', '2', '3', '4', '5', '6', '7'
	0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF, // '8', '9', ':', ';', '<', '=', '>', '?'
	0xFF,0x00,0x01,0x02,0x03,0x04,0x05,0x06, // '@', 'A', 'B', 'C', 'D', 'E', 'F', 'G'
	0x07,0x08,0x09,0x0A,0x0B,0x0C,0x0D,0x0E, // 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'
	0x0F,0x10,0x11,0x12,0x13,0x14,0x15,0x16, // 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W'
	0x17,0x18,0x19,0xFF,0xFF,0xFF,0xFF,0xFF, // 'X', 'Y', 'Z', '[', '', ']', '^', '_'
	0xFF,0x00,0x01,0x02,0x03,0x04,0x05,0x06, // '`', 'a', 'b', 'c', 'd', 'e', 'f', 'g'
	0x07,0x08,0x09,0x0A,0x0B,0x0C,0x0D,0x0E, // 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o'
	0x0F,0x10,0x11,0x12,0x13,0x14,0x15,0x16, // 'p', 'q', 'r', 's', 't', 'u', 'v', 'w'
	0x17,0x18,0x19,0xFF,0xFF,0xFF,0xFF,0xFF  // 'x', 'y', 'z', '{', '|', '}', '~', 'DEL'
	);
	var  i, index, lookup, offset, digit;
	for (i = 0, index = 0, offset = 0; i < input.length; i++) {
		if(input[i] =='=')break;
		lookup = input.charCodeAt(i) - '0'.charCodeAt(0);
		/* Skip chars outside the lookup table */
		if (lookup < 0 || lookup >= base32Lookup.length) {
			return "";//continue;
		}
		digit = base32Lookup[lookup];
		/* If this digit is not in the table, ignore it */
		if (digit == 0xFF) {
			return "";//continue;
		}
		if (index <= 3) {
			index = (index + 5) % 8;
			if (index == 0) {
				//bytes[offset]=String.fromCharCode(bytes.charCodeAt(offset)| digit);
				temp |=digit;
				bytes +=String.fromCharCode(temp);
				temp=0;
				offset++;
				if (offset >= bytes_l)
				break;
				} else {
				// bytes[offset]= String.fromCharCode(bytes.charCodeAt(offset)|(digit << (8 - index)));
				temp |=(digit << (8 - index))&0xFF;
			}
			} else {
			index = (index + 5) % 8;
			//bytes[offset]= String.fromCharCode(bytes.charCodeAt(offset)|(digit >>> index));
			temp |=(digit >>> index);
			bytes +=String.fromCharCode(temp);
			temp=0;
			offset++;
			if (offset >= bytes_l) {
				break;
			}
			//bytes[offset]= String.fromCharCode(bytes.charCodeAt(offset)| digit << (8 - index));
			temp |=(digit << (8 - index))&0xFF;
		}
	}
	return bytes;
}

function detection(a)
{
	var data=new Array([256]);
	for(var i=0;i<256;i++)
	{
		data[i]=0;
	}
	var a_l=a.length;
	for(var i=0;i<a_l;i++)
	{
		data[a.charCodeAt(i)] +=1;
	}
	var code=0;
	var return_data='';
	for(var i=0;i<256;i++)
	{
		if(data[i]>0)
		{
			code++;
			return_data =return_data+String.fromCharCode(i)+':'+data[i]+'\n';
		}
	}
	return_data='length:'+a_l+'\n'+'count:'+code+'\n'+return_data;
	return return_data;
}

//

function hex_md5(a) {
    return binl2hex(core_md5(str2binl(a), a.length * chrsz))
}
function b64_md5(a) {
    return binl2b64(core_md5(str2binl(a), a.length * chrsz))
}
function str_md5(a) {
    return binl2str(core_md5(str2binl(a), a.length * chrsz))
}
function hex_hmac_md5(a, b) {
    return binl2hex(core_hmac_md5(a, b))
}
function b64_hmac_md5(a, b) {
    return binl2b64(core_hmac_md5(a, b))
}
function str_hmac_md5(a, b) {
    return binl2str(core_hmac_md5(a, b))
}
function md5_vm_test() {
    return hex_md5("abc") == "900150983cd24fb0d6963f7d28e17f72"
}
function core_md5(p, k) {
    p[k >> 5] |= 128 << ((k) % 32);
    p[(((k + 64) >>> 9) << 4) + 14] = k;
    var o = 1732584193;
    var n = -271733879;
    var m = -1732584194;
    var l = 271733878;
    for (var g = 0; g < p.length; g += 16) {
        var j = o;
        var h = n;
        var f = m;
        var e = l;
        o = md5_ff(o, n, m, l, p[g + 0], 7, -680876936);
        l = md5_ff(l, o, n, m, p[g + 1], 12, -389564586);
        m = md5_ff(m, l, o, n, p[g + 2], 17, 606105819);
        n = md5_ff(n, m, l, o, p[g + 3], 22, -1044525330);
        o = md5_ff(o, n, m, l, p[g + 4], 7, -176418897);
        l = md5_ff(l, o, n, m, p[g + 5], 12, 1200080426);
        m = md5_ff(m, l, o, n, p[g + 6], 17, -1473231341);
        n = md5_ff(n, m, l, o, p[g + 7], 22, -45705983);
        o = md5_ff(o, n, m, l, p[g + 8], 7, 1770035416);
        l = md5_ff(l, o, n, m, p[g + 9], 12, -1958414417);
        m = md5_ff(m, l, o, n, p[g + 10], 17, -42063);
        n = md5_ff(n, m, l, o, p[g + 11], 22, -1990404162);
        o = md5_ff(o, n, m, l, p[g + 12], 7, 1804603682);
        l = md5_ff(l, o, n, m, p[g + 13], 12, -40341101);
        m = md5_ff(m, l, o, n, p[g + 14], 17, -1502002290);
        n = md5_ff(n, m, l, o, p[g + 15], 22, 1236535329);
        o = md5_gg(o, n, m, l, p[g + 1], 5, -165796510);
        l = md5_gg(l, o, n, m, p[g + 6], 9, -1069501632);
        m = md5_gg(m, l, o, n, p[g + 11], 14, 643717713);
        n = md5_gg(n, m, l, o, p[g + 0], 20, -373897302);
        o = md5_gg(o, n, m, l, p[g + 5], 5, -701558691);
        l = md5_gg(l, o, n, m, p[g + 10], 9, 38016083);
        m = md5_gg(m, l, o, n, p[g + 15], 14, -660478335);
        n = md5_gg(n, m, l, o, p[g + 4], 20, -405537848);
        o = md5_gg(o, n, m, l, p[g + 9], 5, 568446438);
        l = md5_gg(l, o, n, m, p[g + 14], 9, -1019803690);
        m = md5_gg(m, l, o, n, p[g + 3], 14, -187363961);
        n = md5_gg(n, m, l, o, p[g + 8], 20, 1163531501);
        o = md5_gg(o, n, m, l, p[g + 13], 5, -1444681467);
        l = md5_gg(l, o, n, m, p[g + 2], 9, -51403784);
        m = md5_gg(m, l, o, n, p[g + 7], 14, 1735328473);
        n = md5_gg(n, m, l, o, p[g + 12], 20, -1926607734);
        o = md5_hh(o, n, m, l, p[g + 5], 4, -378558);
        l = md5_hh(l, o, n, m, p[g + 8], 11, -2022574463);
        m = md5_hh(m, l, o, n, p[g + 11], 16, 1839030562);
        n = md5_hh(n, m, l, o, p[g + 14], 23, -35309556);
        o = md5_hh(o, n, m, l, p[g + 1], 4, -1530992060);
		
        l = md5_hh(l, o, n, m, p[g + 4], 11, 1272893353);
        m = md5_hh(m, l, o, n, p[g + 7], 16, -155497632);
        n = md5_hh(n, m, l, o, p[g + 10], 23, -1094730640);
        o = md5_hh(o, n, m, l, p[g + 13], 4, 681279174);
        l = md5_hh(l, o, n, m, p[g + 0], 11, -358537222);
        m = md5_hh(m, l, o, n, p[g + 3], 16, -722521979);
        n = md5_hh(n, m, l, o, p[g + 6], 23, 76029189);
        o = md5_hh(o, n, m, l, p[g + 9], 4, -640364487);
        l = md5_hh(l, o, n, m, p[g + 12], 11, -421815835);
        m = md5_hh(m, l, o, n, p[g + 15], 16, 530742520);
        n = md5_hh(n, m, l, o, p[g + 2], 23, -995338651);
        o = md5_ii(o, n, m, l, p[g + 0], 6, -198630844);
        l = md5_ii(l, o, n, m, p[g + 7], 10, 1126891415);
        m = md5_ii(m, l, o, n, p[g + 14], 15, -1416354905);
        n = md5_ii(n, m, l, o, p[g + 5], 21, -57434055);
        o = md5_ii(o, n, m, l, p[g + 12], 6, 1700485571);
        l = md5_ii(l, o, n, m, p[g + 3], 10, -1894986606);
        m = md5_ii(m, l, o, n, p[g + 10], 15, -1051523);
        n = md5_ii(n, m, l, o, p[g + 1], 21, -2054922799);
        o = md5_ii(o, n, m, l, p[g + 8], 6, 1873313359);
        l = md5_ii(l, o, n, m, p[g + 15], 10, -30611744);
        m = md5_ii(m, l, o, n, p[g + 6], 15, -1560198380);
        n = md5_ii(n, m, l, o, p[g + 13], 21, 1309151649);
        o = md5_ii(o, n, m, l, p[g + 4], 6, -145523070);
        l = md5_ii(l, o, n, m, p[g + 11], 10, -1120210379);
        m = md5_ii(m, l, o, n, p[g + 2], 15, 718787259);
        n = md5_ii(n, m, l, o, p[g + 9], 21, -343485551);
        o = safe_add(o, j);
        n = safe_add(n, h);
        m = safe_add(m, f);
        l = safe_add(l, e)
	}
    return Array(o, n, m, l)
}
function md5_cmn(h, e, d, c, g, f) {
    return safe_add(bit_rol(safe_add(safe_add(e, h), safe_add(c, f)), g), d)
}
function md5_ff(g, f, k, j, e, i, h) {
    return md5_cmn((f & k) | ((~f) & j), g, f, e, i, h)
}
function md5_gg(g, f, k, j, e, i, h) {
    return md5_cmn((f & j) | (k & (~j)), g, f, e, i, h)
}
function md5_hh(g, f, k, j, e, i, h) {
    return md5_cmn(f ^ k ^ j, g, f, e, i, h)
}
function md5_ii(g, f, k, j, e, i, h) {
    return md5_cmn(k ^ (f | (~j)), g, f, e, i, h)
}
function core_hmac_md5(c, f) {
    var e = str2binl(c);
    if (e.length > 16) {
        e = core_md5(e, c.length * chrsz)
	}
    var a = Array(16),
	d = Array(16);
    for (var b = 0; b < 16; b++) {
        a[b] = e[b] ^ 909522486;
        d[b] = e[b] ^ 1549556828
	}
    var g = core_md5(a.concat(str2binl(f)), 512 + f.length * chrsz);
    return core_md5(d.concat(g), 512 + 128)
}
function safe_add(a, d) {
    var c = (a & 65535) + (d & 65535);
    var b = (a >> 16) + (d >> 16) + (c >> 16);
    return (b << 16) | (c & 65535)
}
function bit_rol(a, b) {
    return (a << b) | (a >>> (32 - b))
}
function str2binl(d) {
    var c = Array();
    var a = (1 << chrsz) - 1;
    for (var b = 0; b < d.length * chrsz; b += chrsz) {
        c[b >> 5] |= (d.charCodeAt(b / chrsz) & a) << (b % 32)
	}
    return c
}
function binl2str(c) {
    var d = "";
    var a = (1 << chrsz) - 1;
    for (var b = 0; b < c.length * 32; b += chrsz) {
        d += String.fromCharCode((c[b >> 5] >>> (b % 32)) & a)
	}
    return d
}
function binl2hex(c) {
    var b = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
    var d = "";
    for (var a = 0; a < c.length * 4; a++) {
        d += b.charAt((c[a >> 2] >> ((a % 4) * 8 + 4)) & 15) + b.charAt((c[a >> 2] >> ((a % 4) * 8)) & 15)
	}
    return d
}
function binl2b64(d) {
    var c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var f = "";
    for (var b = 0; b < d.length * 4; b += 3) {
        var e = (((d[b >> 2] >> 8 * (b % 4)) & 255) << 16) | (((d[b + 1 >> 2] >> 8 * ((b + 1) % 4)) & 255) << 8) | ((d[
		b + 2 >> 2] >> 8 * ((b + 2) % 4)) & 255);
        for (var a = 0; a < 4; a++) {
            if (b * 8 + a * 6 > d.length * 32) {
                f += b64pad
				} else {
                f += c.charAt((e >> 6 * (3 - a)) & 63)
			}
		}
	}
    return f
}
baidu.namespace.register("baidu.ed");
baidu.ed = (function () {
    var d = function () {
        var f = jQuery("#srcText").val();
        jQuery("#rst").show();
        var g = jQuery("#rstCode");
        if (jQuery("#uniEncode").attr("checked") == true) {
            g.val(unicode_encode(f))
			} else {
            if (jQuery("#uniDecode").attr("checked") == true) {
                g.val(unicode_decode(f))
				} else {
                if (jQuery("#utf8Encode").attr("checked") == true) {
                    g.val(encodeURIComponent(f))
                    //g.val(escape(f))
					} else {
                    if (jQuery("#utf8Decode").attr("checked") == true) {
                        g.val(decodeURIComponent(f))
                        //g.val(unescape(f))
						} else {
                        if (jQuery("#base64Encode").attr("checked") == true) {
                            g.val(baidu.endecode.base64Encode(baidu.endecode.utf8Encode(f)))
							} else {
                            if (jQuery("#base64Decode").attr("checked") == true) {
                                g.val(baidu.endecode.utf8Decode(baidu.endecode.base64Decode(f)))
								} else {
								if (jQuery("#ten_Encode").attr("checked") == true) {
									g.val(OCTEncode(f))
									} else {
									if (jQuery("#ten_Decode").attr("checked") == true) {
										g.val(OCTDecode(f))
										} else {
										if (jQuery("#eval_jsfuck").attr("checked") == true) {
											g.val(eval_jsfuck(f))
											} else {
											if (jQuery("#jsfuck").attr("checked") == true) {
												g.val(jsfuck(f))
												} else {
												if (jQuery("#morse_Decode").attr("checked") == true) {
													g.val(morse_Decode(f))
													} else {
													if (jQuery("#morse_Encode").attr("checked") == true) {
														g.val(morse_Encode(f))
														} else {
														if (jQuery("#unicode_Encode_full").attr("checked") == true) {
															g.val(unicode_Encode_full(f))
															} else {
															if (jQuery("#url_Encode_full").attr("checked") == true) {
																g.val(unicode_encode_full(f))
																} else {
																if (jQuery("#base32Encode").attr("checked") == true)
																{
																	g.val(base32Encode(f))
																	} else {
																	if (jQuery("#base32Decode").attr("checked") == true) {
																		g.val(base32Decode(f))
																		} else {
																		if (jQuery("#detection").attr("checked") == true) {
																			g.val(detection(f))
																			} else {
																			if (jQuery("#vbsEncode").attr("checked") == true) {
																				g.val(vbsEncode(f))
																				} else {
																				if (jQuery("#vbsDecode").attr("checked") == true) {
																					g.val(vbsDecode(f))
																					} else {
																					if (jQuery("#kimojiEncode").attr("checked") == true) {
																						g.val(kimojiEncode(f))
																						} else {
																						if (jQuery("#brainfuckEncode").attr("checked") == true) {
																							g.val(brainfuckEncode(f))
																							} else {
																							if (jQuery("#brainfuckDecode").attr("checked") == true) {
																								g.val(brainfuckDecode(f))
																								} else {
																								if (jQuery("#SHA1").attr("checked") == true) {
																									g.val(CryptoJS.SHA1(f))
																									} else {
																									if (jQuery("#SHA224").attr("checked") == true) {
																										g.val(CryptoJS.SHA224(f))
																										} else {
																										if (jQuery("#SHA256").attr("checked") == true) {
																											g.val(CryptoJS.SHA256(f))
																											} else {
																											if (jQuery("#SHA384").attr("checked") == true) {
																												g.val(CryptoJS.SHA384(f))
																												} else {
																												if (jQuery("#SHA512").attr("checked") == true) {
																													g.val(CryptoJS.SHA512(f))
																													} else {
																													g.val(hex_md5(f))
																												}
																											}
																										}
																									}
																								}
																							}
																						}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	};
	var c = function () {
		jQuery("#btnCodeChange").click(function () {
			d()
		});
		jQuery("#btnCodeClear").click(function () {
			jQuery("#srcText,#rstCode").val("")
		})
	};
	var b = function () {
		jQuery("input[type=radio],label[for]").click(function (f) {
			$this = jQuery(this);
			setTimeout(function () {
				d()
			}, 150)
		})
	};
	var a = function () {
		jQuery("#rstCode").mouseover(function () {
			this.selectionStart = 0;
			this.selectionEnd = this.value.length;
			this.select()
		})
	};
    var e = function () {
        jQuery(function () {
            jQuery("#srcText").focus();
            c();
            a();
            b()
		})
	};
    return {
        init: e
	}
})();
baidu.ed.init();