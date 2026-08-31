function brainfuckDecode(code)
{
    var len=5120;//缓存
    var source=new Array(len);//堆
    var runtime=new Array(len);//运行空间
    var spos=0;//堆pos
    for(var i=0;i<len;i++)
    {
        source[i]=0;
        runtime[i]=0;
    }
    //var sptr=0,wptr=0;
    var pos=0;
    var wflag=1;
    var sflag=0;
    //var line=1,col=0,wline=0,wcol=0;
    //sptr=source;
    var codel=code.length;//<5120
	if (codel>len)
	{
		return "too long";
	}
    var codep=0,wcodep=0;
    var output="";
    while(codep<codel)
    {
        switch(code[codep])
        {
            case '>':
            if(wflag)
            {
                ++pos;
            }
            break;
            case '<':
            if(wflag)
            {
                if(--pos<0)
                {
                    return line+':'+col+"ERROR: Illegal pointer value\n";
                }
            }
            break;
            case '+':
            if(wflag)
            {
                ++runtime[pos];
                if (runtime[pos]<0||runtime[pos]>255)
                {
                    return "ERROR: Illegal pointer value\n";
                }
            }
            break;
            case '-':
            if(wflag)
            {
                --runtime[pos];
                if((runtime[pos]<0)||(runtime[pos]>255))
                {
                    return "ERROR: Illegal pointer value\n";
                }
            }
            break;
            case'.':
            if(wflag)
            {
                output=output+String.fromCharCode(runtime[pos]);
            }
            break;
            case',':
            if(wflag)
            {
                var temp=prompt("输入一个字符","");
                if(temp)
                {
                    runtime[pos]=temp[0];
                }
            }
            break;
            case '[':
            sflag++;
            if(wflag==1)
            {
                if(sflag>spos)
                {
                    if (runtime[pos])
                    {
                        //上级可执行，本级可执行；
                        source[spos]=codep-1;
                        ++spos;
                        wflag=1;
                        //wcodep=codep-1;
                    }else{
                        //上级可执行，本级不可执行；
                        spos++;
                        wflag=0;
                        //sflag--;
                    }
                }else{
                    return "error";
                }
            }else{
            }
            break;
            case']':
            if(wflag==1)
            {
                sflag--;
                spos--;
                codep=source[spos];
            }else{
                if(sflag>spos)
                {
                    sflag--;
                }else{
                    wflag=1;
                    sflag--;
                    spos--;
                }
            }
            break;
            case '\n':
            if (!wflag)
            spos=0;
            for(var i=0;i<len;i++)
            {
                source[i]=0;
                runtime[i]=0;
            }
            pos=0;
            wflag=1;
            sflag=0;
            break;
            default:
            return "error string";
            break;
        }
        ++codep;
    }
    return output;
}
function brainfuckEncode(code)
{
    var output="";
    var codel=code.length;
    var pos=0;
    var min=255;
    var spos=0;
    var epos=code.length;
    //spos=pos;
    for(var i=pos;i<codel;i++)
    {
        //if(code.charCodeAt(i)==0)
        //{
        //    break;
        //}
        if(code.charCodeAt(i)<min)
        {
            min=code.charCodeAt(i);
        }
    }
    //epos=i;
    for(var i=0;i<min;i++)
    {
        output=output+'+';
    }
    output=output+"[";
    for(var i=spos;i<epos;i++)
    {
        output=output+">+";
    }
    for(var i=spos;i<epos;i++)
    {
        output=output+"<";
    }
    output=output+"-]";
    output=output+'>';
    for(var i=0;i<codel;i++)
    {
        for(var j=0;j<code.charCodeAt(pos)-min;j++)
        {
            output=output+'+';
        }
        output=output+'.';
        output=output+'>';
        pos++;
    }
    return output;

}

