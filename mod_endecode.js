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
const MSG_TYPE = {
    BROWSER_CLICKED: "browser-clicked",
    GET_CSS: "get-css",
    GET_JS: "get-js",
    GET_HTML: "get-html",
    GET_COOKIE: "get-cookie",
    REMOVE_COOKIE: "remove-cookie",
    SET_COOKIE: "set-cookie",
    GET_OPTIONS: "get_options",
    SET_OPTIONS: "set_options",
    CSS_READY: "css-ready",
    JS_READY: "js-ready",
    HTML_READY: "html-ready",
    START_OPTION: "start-option",
    OPT_START_FCP: "opt-item-fcp",
    OPT_START_GRID: "opt-item-grid",
    CALC_PAGE_LOAD_TIME: "calc-page-load-time",
    GET_PAGE_WPO_INFO: "get_page_wpo_info",
    SHOW_PAGE_LOAD_TIME: "show-page-load-time",
    FCP_HELPER_DETECT: "fcp-helper-detect",
    GRID_DETECT: "grid-detect",
    JS_TRACKER: "js_tracker",
    CODE_COMPRESS: "code_compress",
    FROM_POPUP: "from_popup_action",
    REGEXP_TOOL: "regexp",
    EN_DECODE: "endecode",
    JSON_FORMAT: "jsonformat",
    QR_CODE: "qrcode",
    CODE_BEAUTIFY: "codebeautify",
    TIME_STAMP: "timestamp",
    IMAGE_BASE64: "imagebase64",
    AUTO_FORMART_PAGE_JSON: "opt_item_autojson"
};
const FILE = {
    STYLE: "style",
    LINK: "link",
    SCRIPT: "script-block"
};
const PUBLIC_ID_WHITE_LIST = {
    "": {
        systemIds: {
            "": true
        }
    },
    "-//W3C//DTD HTML 3.2 Final//EN": {
        systemIds: {
            "": true
        }
    },
    "-//W3C//DTD HTML 4.0//EN": {
        systemIds: {
            "": true,
            "http://www.w3.org/TR/html4/strict.dtd": true
        }
    },
    "-//W3C//DTD HTML 4.01//EN": {
        systemIds: {
            "": true,
            "http://www.w3.org/TR/html4/strict.dtd": true
        }
    },
    "-//W3C//DTD HTML 4.0 Transitional//EN": {
        systemIds: {
            "": true,
            "http://www.w3.org/TR/html4/loose.dtd": true
        }
    },
    "-//W3C//DTD HTML 4.01 Transitional//EN": {
        systemIds: {
            "": true,
            "http://www.w3.org/TR/html4/loose.dtd": true,
            "http://www.w3.org/TR/1999/REC-html401-19991224/loose.dtd": true
        }
    },
    "-//W3C//DTD XHTML 1.1//EN": {
        systemIds: {
            "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd": true
        }
    },
    "-//W3C//DTD XHTML Basic 1.0//EN": {
        systemIds: {
            "http://www.w3.org/TR/xhtml-basic/xhtml-basic10.dtd": true
        }
    },
    "-//W3C//DTD XHTML 1.0 Strict//EN": {
        systemIds: {
            "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd": true
        }
    },
    "-//W3C//DTD XHTML 1.0 Transitional//EN": {
        systemIds: {
            "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd": true
        }
    },
    "ISO/IEC 15445:1999//DTD HyperText Markup Language//EN": {
        systemIds: {
            "": true
        }
    },
    "ISO/IEC 15445:2000//DTD HTML//EN": {
        systemIds: {
            "": true
        }
    },
    "ISO/IEC 15445:1999//DTD HTML//EN": {
        systemIds: {
            "": true
        }
    }
};
const COMPAT_MODE_DIFF_PUBLIC_ID_MAP = {
    "-//W3C//DTD HTML 4.0 Transitional//EN": {
        systemIds: {
            "http://www.w3.org/TR/html4/loose.dtd": {
                IE: "S",
                WebKit: "Q"
            }
        }
    },
    "ISO/IEC 15445:2000//DTD HTML//EN": {
        systemIds: {
            "": {
                IE: "Q",
                WebKit: "S"
            }
        }
    },
    "ISO/IEC 15445:1999//DTD HTML//EN": {
        systemIds: {
            "": {
                IE: "Q",
                WebKit: "S"
            }
        }
    }
};
const HTML_DEPRECATED_TAGS = {
    acronym: "定义首字母缩写",
    applet: "定义Java Applet",
    basefont: "定义Font定义",
    big: "定义大号文本",
    center: "定义居中的文本",
    dir: "定义目录列表",
    font: "定义文字相关",
    frame: "定义框架",
    frameset: "定义框架集",
    isindex: "定义单行的输入域",
    noframes: "定义noframe 部分",
    s: "定义加删除线的文本",
    strike: "定义加删除线的文本",
    tt: "定义打字机文本",
    u: "定义下划线文本",
    xmp: "定义预格式文本",
    layer: "定义层"
};
const HTML_DEPRECATED_ATTRIBUTES = {
    align: {
        iframe: true,
        img: true,
        object: true,
        table: true
    },
    color: {
        font: true
    },
    height: {
        td: true,
        th: true
    },
    language: {
        script: true
    },
    noshade: {
        hr: true
    },
    nowrap: {
        td: true,
        th: true
    },
    size: {
        hr: true,
        font: true,
        basefont: true
    }
};
const BLOCK_HTML_ELEMENT = ["address", "blockquote", "center", "dir", "div", "dl", "fieldset", "form", "h1", "h2", "h3",
        "h4", "h5", "h6", "hr", "isindex", "menu", "noframes", "noscript", "ol", "p", "pre", "table", "ul"];
const INLINE_HTML_ELEMENT = ["a", "acronym", "b", "bdo", "big", "br", "cite", "code", "dfn", "em", "font", "i", "img",
        "input", "kbd", "label", "q", "s", "samp", "select", "small", "span", "strike", "strong", "sub", "sup",
        "textarea", "tt", "u", "var"];
const CHANGE_ABLE_HTML_ELEMENT = ["applet", "button", "del", "iframe", "ins", "map", "object", "script"];
const CONDITIONAL_COMMENT_REGEXP = /\[\s*if\s+[^\]][\s\w]*\]/i;
const NOT_IE_REVEALED_OPENING_CONDITIONAL_COMMENT_REGEXP = /^\[if\s+(!IE|false)\]$/i;
const REVEALED_CLOSING_CONDITIONAL_COMMENT_REGEXP = /^\[endif\s*\]$/i;
const NOT_IE_HIDDEN_CONDITIONAL_COMMENT_REGEXP = /^\[if\s+(!IE|false)\]>.*<!\[endif\]$/i;
const REG = {
    SCRIPT: /<script[^>]*>[\s\S]*?<\/[^>]*script>/gi,
    COMMENT: /<!--[\s\S]*?--\>/g,
    CSS_EXPRESSION: /expression[\s\r\n ]?\(/gi,
    TEXTAREA: /<textarea[^>]*>[\s\S]*?<\/[^>]*textarea>/gi,
    INVALID_TAG: /<\W+>/gi
};
const SELF_CLOSING_TAGS = ["meta", "link", "area", "base", "col", "input", "img", "br", "hr", "param", "embed"];
const HTML_DOM_MAX_DEPTH = 30;
const LOG = {
    options_page_opened: "m_20111124_options_page_opened",
    options_page_btnsave: "m_20111124_options_page_btnsave",
    options_page_btnclose: "m_20111124_options_page_btnclose",
    popup_page_show: "m_20111124_popup_page_show",
    popup_page_fcp: "m_20111124_popup_page_fcp",
    popup_page_grid: "m_20111124_popup_page_grid",
    popup_page_fdp: "m_20111124_popup_page_fdp",
    popup_page_endecode: "m_20111124_popup_page_endecode",
    popup_page_loadtime: "m_20111124_popup_page_loadtime",
    endecode_page_opened: "m_20111124_endecode_page_opened",
    endecode_page_uniEncode: "m_20111124_endecode_page_uniEncode",
    endecode_page_uniDecode: "m_20111124_endecode_page_uniDecode",
    endecode_page_utf8Encode: "m_20111124_endecode_page_utf8Encode",
    endecode_page_utf8Decode: "m_20111124_endecode_page_utf8Decode",
    endecode_page_base64Encode: "m_20111124_endecode_page_base64Encode",
    endecode_page_base64Decode: "m_20111124_endecode_page_base64Decode",
    endecode_page_btnchange: "m_20111124_endecode_page_btnchange",
    endecode_page_btnclear: "m_20111124_endecode_page_btnclear",
    fdp_page_opened: "m_20111124_fdp_page_opened",
    fdp_page_spacedoc: "m_20111124_fdp_page_spacedoc",
    fdp_page_fedoc: "m_20111124_fdp_page_fedoc",
    fdp_page_btnsearch: "m_20111124_fdp_page_btnsearch",
    fcp_detect_show: "m_20111124_fcp_detect_show",
    fcp_detect_close: "m_20111124_fcp_detect_close",
    fcp_detect_min: "m_20111124_fcp_detect_min",
    fcp_detect_max: "m_20111124_fcp_detect_max",
    fcp_detect_morehtml: "m_20111124_fcp_detect_morehtml",
    fcp_detect_morecss: "m_20111124_fcp_detect_morecss",
    fcp_detect_morejs: "m_20111124_fcp_detect_morejs",
    grid_detect_show: "m_20111124_grid_detect_show",
    grid_detect_esc: "m_20111124_grid_detect_esc",
    grid_detect_btnclose: "m_20111124_grid_detect_btnclose",
    fehelper_user_count: "m_20111124_fehelper_user_count"
};
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
//
function unicode_Encode_full(a)
{
	var output = "";
	for(var i=0;i<a.length;i++)
	{
		if(a[i].match(/([0-9A-z])/gi))
		{
			output +="\\u00"+a.charCodeAt(i).toString(16).toUpperCase();
		}else{
			output +="\\u"+a.charCodeAt(i).toString(16).toUpperCase();
		}
	}
	return output;
	//return "unicode_Encode_full"
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

baidu.namespace.register("baidu.ed");
baidu.ed = (function () {
    var d = function () {
        var f = jQuery("#srcText").val();
        jQuery("#rst").show();
        var g = jQuery("#rstCode");
        if (jQuery("#uniEncode").attr("checked") == true) {
            g.val(baidu.endecode.uniEncode(f))
        } else {
            if (jQuery("#uniDecode").attr("checked") == true) {
                g.val(baidu.endecode.uniDecode(f))
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
									g.val(ten_Encode(f))
								} else {
									if (jQuery("#ten_Decode").attr("checked") == true) {
										g.val(ten_Decode(f))
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
																						g.val(url_Encode_full(f))
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