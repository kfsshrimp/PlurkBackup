(()=>{
    
    var Ex = {
        id:"PlurkBackup",
        config:{
            sort:{
                "posted":"日期",
                "favorite_count":"喜歡數",
                "replurkers_count":"轉噗數",
                "response_count":"回噗數"
            },
            fans_sort:{
                "karma":"卡瑪",
                "Detail.friends_count":"好友",
                "Detail.fans_count":"粉絲",
                "Detail.user_info.plurks_count":"發噗數",
                "Detail.user_info.response_count":"回噗數",
                "Detail.user_info.join_date":"註冊時間",
                "Detail.plurks.0.posted":"最後發噗時間",
            },
            porn:{
                "all":"全部",
                "true":"成人",
                "false":"非成人"
            },
            karma_limit:50,
            fans_cfg:{
                fans_count_max:100,
                fans_api_sec:100
            },
            loop_sec:2000,
            loop_safe:100,
            page_per_count:20,
            max:100,
            XMLmax:100 * 100,
            msg:{
                search_end:(end,start,length,last)=>{
                    return `${end}~${start}期間搜尋完成,共${length}噗<BR>(今日查詢餘額：${last})`
                },
                day_limit:(nick_name)=>{
                    return `帳號【${nick_name}】今日已達查詢上限,請明日再使查詢`
                },
                Progress:(number,day)=>{
                    return `搜尋中：${number}%(${day})`;
                },
                search_fans_end:(mode,detail_count)=>{
                    return `共有 ${Ex.PlurkApi[mode].length} ${(mode.indexOf("Fans")!==-1)?`粉絲`:`好友`}, ${detail_count} 名已讀取完畢`
                },
                nick_name_err:`帳號輸入有誤`,
                xml:`系統今日已達查詢上限,請明日再查詢`,
                time_range_err:`開始時間不可大於結果時間`,
                time_range_err2:`搜尋範圍不可大於31天`
            }
        },
        flag:{
            PageControl:{
                mode:'',
                total:0,
                page:1
            },
            search_mode:"",
            fans_sort:"karma",
            sort_desc:true,
            page:1,
            local:{},
            session:{}
        },
        temp:{
            Plurk:(data)=>{

                var div = document.createElement("div");

                div.innerHTML = `
                <div class="PlurkDiv">
                    <div>
                        ${data.content}
                        <hr>

                        <div>
                        【${data.no}】${Ex.func.PlurkDate(data.posted)} / 喜歡：<span class="fav">${data.favorite_count}</span> / 轉噗：<span class="rep">${data.replurkers_count}</span> / 回噗：<span class="rep">${data.response_count}</span> / <a href="https://www.plurk.com/p/${parseInt(data.plurk_id).toString(36)}" target="_blank">PLURK</a> / <a data-event="ClickEvent" data-plurk_id=${data.plurk_id} data-mode="TextPrint" id="TextPrint_${data.plurk_id}">複製</a>

                        </div>

                    </div>
                </div>`;

                return div;
            },
            FanSort:()=>{
                var div = document.createElement("div");

                div.innerHTML = `
                <div class="PlurkDiv">
                    <div>
                        排序：
                        
                        <select id="fans_sort" data-mode="fans_sort" data-event="ChangeEvent">${Ex.func.SelectHtml(Ex.config.fans_sort,Ex.flag.fans_sort)}</select>

                        <input type="button" data-mode="sort_desc" id="sort_desc" data-event="ClickEvent" value="排序倒反">



                    </div>
                </div>`;

                return div;
            },
            Fan:(data)=>{

                var table = ``;

                table += `
                
                    <tr>
                        <td>
                        <a target="_blank" href="https://www.plurk.com/${data.nick_name}">${data.display_name}</a> (${data.nick_name})
                        </td>

                        ${Object.keys(Ex.config.fans_sort).map((v)=>{

                            var _return = `<td data-sort="${v}">`;

                            if(data.karma>Ex.config.karma_limit)
                            {
                                if(v.indexOf("join_date")!==-1 || v.indexOf("posted")!==-1)
                                {
                                    if(Ex.func.JsonChild(data,v)===undefined)
                                    {
                                        if(data.Detail.privacy==="only_friends")
                                            _return += `私密河道`;
                                        else
                                            _return += `未發噗`;
                                        
                                    }
                                    else
                                    {
                                        _return += Ex.func.PlurkDate(Ex.func.JsonChild(data,v));
                                    }
                                }
                                else
                                {
                                    _return +=  `${Ex.func.JsonChild(data,v)}`;
                                }
                            }
                            else
                            {
                                _return += `卡瑪低於${Ex.config.karma_limit},略過`;
 
                                
                            }
                            
                            _return += `</td>`;


                            return _return;

                        }).join("")}

                    </tr>
                
                `;

                return table;

                var div = document.createElement("div");

                div.innerHTML = `
                <div class="PlurkDiv">
                    <div>
                    <a target="_blank" href="https://www.plurk.com/${data.nick_name}">${data.display_name}</a> (${data.nick_name})
                    <hr>

                    ${Object.keys(Ex.config.fans_sort).map((v)=>{

                        var _return = `${Ex.config.fans_sort[v]}：`;

                        if(data.karma>Ex.config.karma_limit)
                        {
                            if(v.indexOf("join_date")!==-1 || v.indexOf("posted")!==-1)
                            {
                                if(Ex.func.JsonChild(data,v)===undefined)
                                {
                                    if(data.Detail.plurks===undefined)
                                    {
                                        if(data.Detail.privacy==="only_friends")
                                            _return += `私密河道`;
                                        else
                                            _return += `未發噗`;
                                    }   
                                }
                                else
                                {
                                    _return += Ex.func.PlurkDate(Ex.func.JsonChild(data,v));
                                }
                            }
                            else
                            {
                                _return +=  `${Ex.func.JsonChild(data,v)||''}`;
                            }
                        }
                        else
                        {
                            _return += `卡瑪低於${Ex.config.karma_limit},略過讀取`;
                        }
                        


                        _return += `<BR>`;


                        return _return;

                    }).join("")}

                    <hr>
                    


                    </div>
                </div>`;

                return div;
            },
            PageSelect:(total)=>{

                var select = document.createElement("select");
                select.dataset.mode = "PageChange";
                select.dataset.event = "ChangeEvent";
                select.id = "PageChange";

                select.innerHTML = Ex.func.SelectHtml(total,Ex.flag.PageControl.page)

                
                return select;

            }
        },
        func:{
            Block:(sec)=>{

                var div = document.createElement("div");
                document.body.prepend(div);

                div.innerHTML = 
                `<div style="
                position: absolute;
                height: 100px;
                width: 100px;
                top: calc(50% - 100px);
                left: calc(50% - 100px);
                border-radius: 50%;
                border-top: 5px solid #aaa;"></div>`;

                div.style = `
                    overflow:hidden;
                    width: 100%;
                    height: 100%;
                    z-index: 99;
                    background: #000;
                    position: absolute;
                    opacity:1;
                    transition-duration: ${sec}s;
                    cursor: wait;
                `;

                var r = 0;
                var _t = setInterval(()=>{
                    r++;
                    div.querySelector("div").style.transform = `rotate(${r}deg)`;
                    
                    
                },1);
                
                setTimeout(()=>{
                    div.style.opacity = 0;
                    
                    setTimeout(()=>{ div.remove();clearInterval(_t); },sec * 1000);

                },sec * 1000);
                

            },
            PageChange:(path)=>{


                
                if(path==="next")
                {
                    Ex.flag.PageControl.page += 1;
                }
                else if(path==="prev")
                {
                    Ex.flag.PageControl.page -= 1;
                }
                else
                {
                    Ex.flag.PageControl.page = parseInt(path);
                }


                if(
                    Ex.flag.PageControl.page>Math.ceil(Ex.flag.PageControl.total/Ex.config.page_per_count) || 
                    Ex.flag.PageControl.page*Ex.config.page_per_count<=0) return;

                
                document.querySelector("#PlurkList").scrollTo(0,0);


                (Ex.flag.PageControl.mode==="plurks")?Ex.func.PlurkList():Ex.func.FanList(Ex.flag.search_mode);


            },
            PageControl:( mode = "search_plurks" )=>{

                var total = Ex.PlurkApi[`${mode}`].length;
                
                Ex.flag.PageControl = {
                    mode:mode,
                    total:Ex.PlurkApi[`${mode}`].length,
                    page:Ex.flag.PageControl.page
                };

                Ex.func.DisabledBtn(`#PageBar [data-mode="PageChange"]`,true);


                if( (Ex.flag.PageControl.page*1+1)<=Math.ceil(total/Ex.config.page_per_count) )
                {

                    Ex.func.DisabledBtn(`#PageBar [data-path="next"]`,false);
                }

                if( (Ex.flag.PageControl.page-1)*Ex.config.page_per_count>0)
                {
                    Ex.func.DisabledBtn(`#PageBar [data-path="prev"]`,false);
                    
                }

                if(Ex.PlurkApi[mode].length<=Ex.config.page_per_count)
                {

                    Ex.func.DisabledBtn(`#PageBar [data-mode="PageChange"]`,true);
                    
                }

                document.querySelector("#PageBar #page").innerHTML = ``;
                document.querySelector("#PageBar #page").appendChild(Ex.temp.PageSelect(Math.ceil(Ex.flag.PageControl.total/Ex.config.page_per_count)));


                Ex.func.ClickEvent();
                Ex.func.ChangeEvent();


            },
            PlurkTime:( func )=>{

                var api = Ex.PlurkApi;

                api.act = "checkTime";
                api.func = (r)=>{
                    r = JSON.parse(r.response);
                    Ex.flag.PlurkTime = new Date(r.timestamp * 1000);
                    Ex.flag.PlurkDay = `${Ex.flag.PlurkTime.getFullYear()}-${Ex.flag.PlurkTime.getMonth()+1}-${Ex.flag.PlurkTime.getDate()}`;

                    if(typeof(func)==="function") setTimeout(() => {func();},0);
                }
                api.Send();

            },
            PlurkList:()=>{

                var plurks = Ex.PlurkApi.plurks;

                Ex.flag.ClickEventRegister = [];
                Ex.flag.ChangeEventRegister = [];

                document.querySelector("#PlurkList").innerHTML = ``;
                
                var start = ``,end = ``,p_start = ``,p_end = ``,
                ymd = document.querySelectorAll(`select[data-mode="ymdchange"]`),
                sort = document.querySelector(`select[data-mode="sort"]`),
                porn = document.querySelector(`select[data-mode="porn"]`);


                p_start = `${ymd[3].value}/${ymd[4].value}/${ymd[5].value}`;
                p_end = `${ymd[0].value}/${ymd[1].value}/${ymd[2].value}`;

                start = new Date(p_start);
                end = new Date(p_end);

                start = new Date( start.setDate( start.getDate()+1 ) )

                var search_plurks = [];

                
                
                for(var i in plurks)
                {
                    let data = plurks[i];

                    
                    if( 
                        new Date(data.posted).toISOString() >= end.toISOString() && 
                        new Date(data.posted).toISOString() <= start.toISOString() && 
                        /*
                        (
                            new Date(data.posted).getFullYear()<=parseInt(ymd[3].value) && 
                            new Date(data.posted).getFullYear().toString()>=parseInt(ymd[0].value)
                        )
                        &&
                        (
                            (new Date(data.posted).getMonth()+1)<=parseInt(ymd[4].value) && 
                            (new Date(data.posted).getMonth()+1)>=parseInt(ymd[1].value)
                        )
                        &&
                        (
                            new Date(data.posted).getDate()<=parseInt(ymd[5].value) && 
                            new Date(data.posted).getDate()>=parseInt(ymd[2].value)
                        )
                        */
                        (
                            porn.value===data.porn.toString() || 
                            porn.value==="all"
                        )
                    )
                    {
                        search_plurks.push(data);
                    }
                }


                console.log(search_plurks);

                /*
                if(sort.value==="favorite_count")
                    search_plurks.sort( (a,b)=>{return (b.favorite_count!==a.favorite_count)?b.favorite_count - a.favorite_count:b.replurkers_count - a.replurkers_count});
                else if(sort.value==="replurkers_count")
                    search_plurks.sort( (a,b)=>{return (b.replurkers_count!==a.replurkers_count)?b.replurkers_count - a.replurkers_count:b.favorite_count - a.favorite_count});
                */


                search_plurks.sort( (a,b)=>{return b[sort.value] - a[sort.value]});




                Ex.PlurkApi.search_plurks = search_plurks;

                for(var i in search_plurks)
                {
                    let data = search_plurks[i];

                    data.no = i*1+1;


                    if( (Ex.flag.PageControl.page-1)*Ex.config.page_per_count>=data.no || Ex.flag.PageControl.page*Ex.config.page_per_count<data.no ) continue;

                    document.querySelector("#PlurkList").appendChild(

                        Ex.temp.Plurk(data)

                    );
                }
                

                document.querySelector("#Progress").innerHTML = Ex.config.msg.search_end(p_end,p_start,search_plurks.length,Ex.config.max-Ex.flag.NickNameCount);

                Ex.func.DisabledBtn([`[data-mode="GetFans"]`,`[data-mode="Search"]`],false);


                

                Ex.func.PageControl();

                

            },
            FanList:(mode)=>{

                var fans = Ex.PlurkApi[mode];

                Ex.flag.ClickEventRegister = [];
                Ex.flag.ChangeEventRegister = [];

                document.querySelector("#PlurkList").innerHTML = ``;
                
         
                var search_fans = fans;

               

                
                search_fans.sort( (a,b)=>{

                    var _a = Ex.func.JsonChild(a,Ex.flag.fans_sort)||0,
                    _b = Ex.func.JsonChild(b,Ex.flag.fans_sort)||0

                    if(Ex.flag.fans_sort.indexOf("join_date")!==-1 || Ex.flag.fans_sort.indexOf("posted")!==-1)
                    {
                        _a = (_a===0)?new Date(0):new Date(_a);
                        _b = (_b===0)?new Date(0):new Date(_b);
                    }
                    
                    return (Ex.flag.sort_desc)?(_b - _a):(_a - _b);
                    
                });
                


                Ex.PlurkApi[mode] = search_fans;

                document.querySelector("#PlurkList").appendChild(Ex.temp.FanSort());

                var table = document.createElement("table");
                table.id = "FanListTable";

                table.innerHTML = `
                <tr>
                    <td>帳號</td>
                    ${Object.keys(Ex.config.fans_sort).map((v)=>{
    
                        return `<td data-sort="${v}">${Ex.config.fans_sort[v]}</td>`;
    
                    }).join("")}
                </tr>`;


                for(var i in search_fans)
                {
                    let data = search_fans[i];

                    data.no = i*1+1;

                    if( (Ex.flag.PageControl.page-1)*Ex.config.page_per_count>=data.no || Ex.flag.PageControl.page*Ex.config.page_per_count<data.no ) continue;

                    table.innerHTML += Ex.temp.Fan(data)

                    document.querySelector("#PlurkList").appendChild(table);
                }

                Ex.func.DisabledBtn([`[data-mode="GetFans"]`,`[data-mode="Search"]`],false);



                document.querySelectorAll(`td[data-sort="${Ex.flag.fans_sort}"]`).forEach(o=>{o.className = "SortNow";});
                

                Ex.func.PageControl(mode);


            },
            SelectYMD:(y,m,d)=>{

                var y_select = ``,m_select = ``,d_select = ``;

                for(var i=new Date().getFullYear()-10;i<=new Date().getFullYear();i++)
                    y_select += `<option ${(i===new Date().getFullYear())?"selected":""}>${i}</option>`;

                for(var i=1;i<=12;i++)
                    m_select += `<option ${(i===(parseInt(m)||new Date().getMonth()+1))?"selected":""}>${i.toString().padStart(2,'0')}</option>`;


                for(var i=1;i<=new Date( y||new Date().getFullYear() , m||(new Date().getMonth()+1) ,0).getDate();i++)
                    d_select += `<option ${(i===(parseInt(d)||new Date().getDate()))?"selected":""}>${i.toString().padStart(2,'0')}</option>`;

                
                return {y:y_select,m:m_select,d:d_select}
            },
            SelectHtml:(obj,val)=>{
                var html = ``;

                if(typeof(obj)==="number")
                {
                    for(var i=1;i<=obj;i++)
                        html += `<option value="${i}" ${(i===val)?"selected":""}>${i}</option>`
                }
                else
                {
                    for(var v in obj)
                        html += `<option value="${v}" ${(v===val)?"selected":""}>${obj[v]}</option>`
                }

                return html;
            },
            DisabledBtn:(select,mode)=>{

                if(!Array.isArray(select)) select = [select];

                select.forEach(o => {
                    
                    o = document.querySelectorAll(o);

                    (mode)?o.forEach(_o=>{_o.setAttribute("disabled","disabled")}):o.forEach(_o=>{_o.removeAttribute("disabled")});
                });

            },
            ChangeEvent:(e)=>{

                if(e===undefined)
                {
                    document.querySelectorAll(`[data-event="ChangeEvent"]`).forEach(o=>{

                        Ex.flag.ChangeEventRegister = Ex.flag.ChangeEventRegister||[];

                        if(Ex.flag.ChangeEventRegister.indexOf(o.id)===-1)
                        {
                            //console.log('register ChangeEvent')
                            Ex.flag.ChangeEventRegister.push(o.id);
                            o.addEventListener("change",Ex.func.ChangeEvent);
                        }
                    });


                    return;
                }

                switch (e.target.dataset.mode){

                    case "ymdchange":
                        var ymd = document.querySelectorAll(`[data-mode="ymdchange"][data-group="${e.target.dataset.group}"]`);


                        ymd[2].innerHTML = Ex.func.SelectYMD( ymd[0].value,ymd[1].value,1 ).d;
                    break;

                    case "PageChange":

                        Ex.func.PageChange(e.target.value);

                    break;

                    case "sort":

                        Ex.func.PlurkList();

                    break;

                    case "porn":

                        Ex.func.PlurkList();

                    break;

                    case "fans_sort":

                        Ex.flag.fans_sort = e.target.value;


                        Ex.func.FanList(Ex.flag.search_mode);

                    break;

                }

            },
            UsersDetail:(nick_name,arg,func)=>{

                var api = Ex.PlurkApi;

                api.arg = arg;

                api.act = "Profile/getPublicProfile";
                api.arg.nick_name = "";
                api.mode = "CORS";

                api.arg.nick_name = nick_name;

                api.func = (r)=>{
                    try{
                        r = JSON.parse(r.response);
                        func(r);
                    }
                    catch(e){

                        Ex.func.DisabledBtn([`[data-mode="GetFans"]`,`[data-mode="Search"]`],false);

                        console.log("error");
                        //console.log(e);
                        return;
                    }
                }

                api.Send();
            },
            FansDetail:(fans,i)=>{

                var mode = Ex.flag.search_mode;
                

                if(fans[i]===undefined)
                {

                    Ex.DB.ref(`PlurkSearch/nick_name/${document.querySelector("#nick_name").value}/${Ex.flag.PlurkDay}/${mode}`).set(Ex.PlurkApi[mode]);


                    Ex.func.FanList(mode);
                    console.log(`【Get End】`);
                    return;
                }

             
                if(fans[i].karma<Ex.config.karma_limit)
                {
                    setTimeout(()=>{

                        i++;
                        document.querySelector("#Progress").innerHTML = Ex.config.msg.search_fans_end(mode,i);

                        document.querySelector("#Progress").style.background = `linear-gradient(to right, #0d0 ${i/Ex.PlurkApi[mode].length*100}% , #999 0%)`;


                        Ex.func.FansDetail(fans,i);

                    },0);

                    return;
                }

                Ex.func.UsersDetail(fans[i].nick_name,{include_plurks:"true"},(r)=>{

                    console.log(`Get ${fans[i].nick_name}`);

                    (r.plurks.length>0)?r.plurks = [r.plurks.shift()]:null;

                    fans[i].Detail = r;

                    i++;

                    document.querySelector("#Progress").innerHTML = Ex.config.msg.search_fans_end(mode,i);

                    document.querySelector("#Progress").style.background = `linear-gradient(to right, #0d0 ${i/Ex.PlurkApi[mode].length*100}% , #999 0%)`;
                    
                    
                    if(fans[i]!==undefined)
                    {

                        setTimeout(()=>{

                            Ex.func.FansDetail(fans,i);

                        },Ex.config.fans_cfg.fans_api_sec);
                    }
                    else
                    {

                        Ex.DB.ref(`PlurkSearch/nick_name/${document.querySelector("#nick_name").value}/${Ex.flag.PlurkDay}/${mode}`).set(Ex.PlurkApi[mode]);


                        Ex.func.FanList(mode);
                        console.log(`【Get End】`);
                    }
                    
                });


            },
            GetFuns:(mode)=>{

                Ex.func.UsersDetail( document.querySelector("#nick_name").value,{include_plurks:"false"},(user)=>{

                    var api = Ex.PlurkApi;

                  
                    api.act = (mode.indexOf("Fans")!==-1)?"FriendsFans/getFansByOffset":"FriendsFans/getFriendsByOffset"

                    api.arg.user_id = user.user_info.id;
                    api.arg.offset = "0";
                    api.arg.limit = "100";
                    api.func = (r)=>{
                    
                        api[mode] = api[mode]||[];
    
                        try{
                            r = JSON.parse(r.response);
                        }
                        catch(e){
    
                            console.log(e);
                            return;
                        }
    
                        api[mode] = api[mode].concat(r);

                        

    
                        
                        if(r.length===0)
                        {
                            document.querySelector("#Progress").innerHTML = Ex.config.msg.search_fans_end(mode,0);

                            if(api[mode].length>Ex.config.fans_cfg.fans_count_max)
                            {
                                if(confirm(`粉絲或好友數過多，第一次讀取需要較長時間，確定要繼續嗎？`)===false){

                                    Ex.func.DisabledBtn([`[data-mode="GetFans"]`,`[data-mode="Search"]`,`[data-mode="GetFriends"]`],false);
                                    return;
                                }
                            }


                            Ex.func.FansDetail(api[mode],0);
    
                            return;
                        }
    
                        setTimeout(()=>{
    
                            api.arg.user_id = user.user_info.id;
                            api.arg.limit = "100";
                            api.arg.offset -= -1*r.length;
                            
                            api.Send();
    
                        },Ex.config.fans_cfg.fans_api_sec);
    
                    }
                    
                    api.Send();



                });

            },
            ClickEvent:(e)=>{

                if(e===undefined)
                {
                    document.querySelectorAll(`[data-event="ClickEvent"]`).forEach(o=>{

                        Ex.flag.ClickEventRegister = Ex.flag.ClickEventRegister||[];

                        if(Ex.flag.ClickEventRegister.indexOf(o.id)===-1)
                        {
                            //console.log('register ClickEvent')
                            Ex.flag.ClickEventRegister.push(o.id);
                            o.addEventListener("click",Ex.func.ClickEvent);
                        }
                    });


                    return;
                }

                switch (e.target.dataset.mode){


                    case "GetFriends":
                    case "GetFans":

                        var mode = e.target.dataset.mode;
                        Ex.flag.search_mode = mode;

                        Ex.func.DisabledBtn([`[data-mode="GetFans"]`,`[data-mode="Search"]`,`[data-mode="GetFriends"]`],true);

                        Ex.func.PlurkTime(()=>{

                            Ex.DB.ref(`PlurkSearch/nick_name/${document.querySelector("#nick_name").value}`).once("value",r=>{

                                r = r.val()||{};

                                r[Ex.flag.PlurkDay] = r[Ex.flag.PlurkDay]||{};
                                


                                for(var day in r)
                                {
                                    if(day===Ex.flag.PlurkDay) continue;

                                    //r[day].search_fans = 1;
                                    r[day][mode] = 1;
                                }
                                

                                if(r[Ex.flag.PlurkDay][mode]!==undefined)
                                {
                                    Ex.PlurkApi[mode] = r[Ex.flag.PlurkDay][mode];
                                    Ex.func.FanList(mode);
                                }
                                else
                                {
                                    Ex.func.GetFuns(mode);
                                }

                                Ex.DB.ref(`PlurkSearch/nick_name/${document.querySelector("#nick_name").value}`).set(r);

                            });

                        });

                    break;


                    case "Search":
                        
                        Ex.func.DisabledBtn([`[data-mode="GetFans"]`,`[data-mode="Search"]`],true);


                        var nick_name = document.querySelector("#nick_name").value;



                        Ex.func.PlurkTime(()=>{

                            var api = Ex.PlurkApi;


                            api.plurks = [];
                            document.querySelector("#PlurkList").innerHTML = ``;
                            Ex.flag.PageControl.page = 1;
                            


                            var start = ``,end = ``,ymd = document.querySelectorAll(`select[data-mode="ymdchange"]`);

                            start = `${ymd[3].value}/${ymd[4].value}/${ymd[5].value}`;
                            end = `${ymd[0].value}/${ymd[1].value}/${ymd[2].value}`;

                            if(nick_name==='')
                            {
                                alert(Ex.config.msg.nick_name_err);
                                Ex.func.DisabledBtn([`[data-mode="GetFans"]`,`[data-mode="Search"]`],false);
                                return;
                            }

                            if( new Date(start)<new Date(end) )
                            {
                                alert(Ex.config.msg.time_range_err);
                                Ex.func.DisabledBtn([`[data-mode="GetFans"]`,`[data-mode="Search"]`],false);
                                return;
                            }


                            if( (((new Date(start) - new Date(end)) / 1000) / 60 / 60 / 24) >= 31 )
                            {
                                alert(Ex.config.msg.time_range_err2);
                                Ex.func.DisabledBtn([`[data-mode="GetFans"]`,`[data-mode="Search"]`],false);
                                return;
                            }



                            api.act = "Timeline/getPublicPlurks";
                            api.arg.minimal_data = "true";
                            api.arg.minimal_user = "true";
                            api.arg.nick_name = document.querySelector("#nick_name").value;
                            api.arg.limit = "100";
                            api.arg.only_user = "true";
                            api.mode = "CORS";

                            start = new Date(start).setHours(24+8);
                            end = new Date(end).setHours(8);


                            api.arg.offset = new Date(start).toISOString();
                            
                            
                            var safe = 0;
                            api.func = (r)=>{ 

                                api.plurks = api.plurks||[];
        
                                try{
                                    r = JSON.parse(r.response);
                                }
                                catch(err){
                                    console.log(end);
                                    
                                    Ex.func.PlurkList();

                                    document.querySelector("#Progress").style.background = `linear-gradient(to right, #0d0 100% , #999 0%)`;

                                    return;
                                }
        
                                if(r.plurks.length===0)
                                {
                                    Ex.func.PlurkList();

                                    document.querySelector("#Progress").style.background = `linear-gradient(to right, #0d0 100% , #999 0%)`;

                                    return;
                                }
        
                            
                                api.plurks = api.plurks.concat(r.plurks);
                            

                                safe++;
                                if(safe>Ex.config.loop_safe){console.log('loop_safe break');return;}
                                
                                
                                
                                var s = Math.floor(new Date(start).getTime()/1000/60/60/24);
                                var e = Math.floor(new Date(end).getTime()/1000/60/60/24);
                                var p = Math.floor(new Date(api.plurks[api.plurks.length-1].posted).getTime()/1000/60/60/24);

                                var progress = Math.floor( ( s - e - (p - e) ) / ( s - e ) * 100 );


                                document.querySelector("#Progress").innerHTML = Ex.config.msg.Progress(
                                    progress,
                                    new Date(api.plurks[api.plurks.length-1].posted).toISOString().split("T")[0]
                                    );

                                document.querySelector("#Progress").style.background = `linear-gradient(to right, #0d0 ${progress}% , #999 0%)`;




                                if(new Date(api.plurks[api.plurks.length-1].posted).toISOString() >= new Date(end).toISOString())
                                {
                                    setTimeout(()=>{
                                        
                                        api.arg.offset = new Date( new Date(api.plurks[api.plurks.length-1].posted) ).toISOString();

                                        Ex.func.DB(`PlurkSearch/nick_name/${nick_name}/${Ex.flag.PlurkDay}/search_count`,`add`,(r)=>{

                                            r = r.val()||0;

                                            Ex.flag.NickNameCount = r;

                                            if(r>=Ex.config.max)
                                            {
                                                alert(Ex.config.msg.day_limit(nick_name));

                                                Ex.func.PlurkList();


                                                return;
                                            }

                                            Ex.func.DB(`PlurkSearch/XmlCount/${Ex.flag.PlurkDay}`,`add`,(r)=>{

                                                r = r.val()||0;
                
                                                if(r>=Ex.config.XMLmax)
                                                {
                                                    alert(Ex.config.msg.xml);
                                                    Ex.func.PlurkList();
                
                                                    
                                                    return;
                                                }
                                                
                
                                                api.Send();
                
                                            });
                
                                        });                               
                            
                                    },Ex.config.loop_sec);
                                }
                                else
                                {
                                    Ex.func.PlurkList();
                                    
                                    document.querySelector(`[data-mode="Search"]`).removeAttribute("disabled");
                                    document.querySelector(`[data-mode="GetFans"]`).removeAttribute("disabled");
                                }    
                            }


                            

                            Ex.func.DB(`PlurkSearch/nick_name/${nick_name}/${Ex.flag.PlurkDay}/search_count`,`add`,(r)=>{

                                r = r.val()||0;

                                Ex.flag.NickNameCount = r;

                                if(r>=Ex.config.max)
                                {
                                    alert(Ex.config.msg.day_limit(nick_name));
                                    Ex.func.PlurkList();

                                    document.querySelector(`[data-mode="Search"]`).removeAttribute("disabled");
                                    return;
                                }

                                Ex.func.DB(`PlurkSearch/SearchCount/${Ex.flag.PlurkDay}`,`add`);

                                Ex.func.DB(`PlurkSearch/XmlCount/${Ex.flag.PlurkDay}`,`add`,(r)=>{

                                    r = r.val()||0;

                                    if(r>=Ex.config.XMLmax)
                                    {
                                        alert(Ex.config.msg.xml);
                                        Ex.func.PlurkList();

                                        document.querySelector(`[data-mode="Search"]`).removeAttribute("disabled");
                                        return;
                                    }


                                    api.Send();

                                });

                            });
                                


                        });
                    break;



                    case "sort_desc":

                        Ex.flag.sort_desc = !Ex.flag.sort_desc;
                        Ex.func.FanList(Ex.flag.search_mode);

                    break;

                    case "TextPrint":

                        var plurk = Ex.PlurkApi.plurks.filter(o=>{
                            if(o.plurk_id===parseInt(e.target.dataset.plurk_id)) return true;
                        })[0];



                        var text = `${plurk.content_raw}\nhttps://www.plurk.com/p/${parseInt(plurk.plurk_id).toString(36)}`;

                        navigator.clipboard.writeText(text);
                        
                    break;



                    case "PageChange":

                        Ex.func.PageChange(e.target.dataset.path);
                        
                    break;

                }

            },
            DB:(path,mode,func)=>{


                switch (mode)
                {
                    case "add":
                        Ex.DB.ref(path).once("value",r=>{

                            r = r.val()||0;

                            Ex.DB.ref(path).set( parseInt(r)+1 );

                        }).then(r=>{

                            if(typeof(func)==="function") func(r);

                        });

                    break;



                }
                

            },
            JsonChild:(obj,row)=>{

                var _obj = JSON.parse(JSON.stringify(obj));
                row = row.split(".");

                row.forEach(_row=>{

                    if(_obj===undefined) return;

                    if(_obj[_row]!==undefined)
                        _obj = _obj[_row];
                    else
                        _obj = undefined;

                });

                return _obj;

            },
            StorageUpd:()=>{
                localStorage[Ex.id] = JSON.stringify(Ex.flag.local);
                sessionStorage[Ex.id] = JSON.stringify(Ex.flag.session);
            },
            PlurkDate:(IOSDate)=>{

                return `${new Date(IOSDate).getFullYear()}-${new Date(IOSDate).getMonth()+1}-${new Date(IOSDate).getDate()} ${new Date(IOSDate).getHours().toString().padStart(2,'0')}:${new Date(IOSDate).getMinutes().toString().padStart(2,'0')}:${new Date(IOSDate).getSeconds().toString().padStart(2,'0')}`
            }
        },
        ele:{

        },
        DB:{},
        firebase:(url,func)=>{

            if( typeof(firebase)!=='undefined' ) return;

            var firebasejs = document.createElement("script");
            firebasejs.src="https://www.gstatic.com/firebasejs/5.5.6/firebase.js";
            document.head.appendChild(firebasejs);

            var _t = setInterval(() => {
                if( typeof(firebase)!=='undefined' )
                {
                    Ex.DB = firebase;
                    Ex.DB.initializeApp({databaseURL:url});
                    Ex.DB = Ex.DB.database();
                    clearInterval(_t);

                    if(typeof(func)==="function") func();

                }
            },100);

        },
        js:(url_ary)=>{


            for(let i in url_ary)
            {
                setTimeout(()=>{
                    var js = document.createElement("script");
                    js.src = `${url_ary[i]}?s=${new Date().getTime()}`;
                    document.head.appendChild(js);
                },i*200);
            }


            var _t = setInterval(()=>{
                if(typeof(PlurkApi)==="function")
                {
                    Ex.PlurkApi = new PlurkApi();
                    clearInterval(_t);
                }
            },100);
        },
        css:(url_ary)=>{

            for(var src of url_ary)
            {
                var link = document.createElement('link');
                link.href = `${src}?s=${new Date().getTime()}`;
                link.rel = 'stylesheet';
                link.type = 'text/css';
                document.head.appendChild(link);
            }

        },
        init:()=>{

            

            Ex.firebase("https://plurksearch-9f77d-default-rtdb.firebaseio.com/");


            Ex.js(
                ['https://kfsshrimp.github.io/sha1/core-min.js',
                'https://kfsshrimp.github.io/sha1/sha1-min.js',
                'https://kfsshrimp.github.io/sha1/hmac-min.js',
                'https://kfsshrimp.github.io/sha1/enc-base64-min.js',
                'https://kfsshrimp.github.io/js/PlurkApi.js']
            );

            Ex.css(
                ["style.css"]
            )


            Ex.flag.local = JSON.parse(localStorage[Ex.id]||`{}`);
            Ex.flag.session = JSON.parse(sessionStorage[Ex.id]||`{}`);

            Ex.func.StorageUpd();
            
            


            document.body.innerHTML = `
            <div id="SearchBar">
            <input id="nick_name" value="${(location.hostname===``)?"kfsshrimp4":""}" type="text" placeholder="噗浪帳號">

            <select id="y_start" data-group="ymd_start" data-mode="ymdchange" data-event="ChangeEvent">${Ex.func.SelectYMD().y}</select>
            <select id="m_start" data-group="ymd_start" data-mode="ymdchange" data-event="ChangeEvent">${Ex.func.SelectYMD().m}</select>
            <select id="d_start" data-group="ymd_start" data-mode="ymdchange">${Ex.func.SelectYMD().d}</select>
            ~
            <select id="y_end" data-group="ymd_end" data-mode="ymdchange" data-event="ChangeEvent">${Ex.func.SelectYMD().y}</select>
            <select id="m_end" data-group="ymd_end" data-mode="ymdchange" data-event="ChangeEvent">${Ex.func.SelectYMD().m}</select>
            <select id="d_end" data-group="ymd_end" data-mode="ymdchange">${Ex.func.SelectYMD().d}</select>

            <select id="sort" data-mode="sort" data-event="ChangeEvent">${Ex.func.SelectHtml(Ex.config.sort)}</select>
            <select id="porn" data-mode="porn" data-event="ChangeEvent">${Ex.func.SelectHtml(Ex.config.porn)}</select>

            <input data-event="ClickEvent" data-mode="Search" id="Search" type="button" value="搜尋">

            <input data-event="ClickEvent" data-mode="GetFans" id="GetFans" type="button" value="粉絲清單">

            <input data-event="ClickEvent" data-mode="GetFriends" id="GetFriends" type="button" value="好友清單">

            <!--
            <input data-event="ClickEvent" data-mode="TextPrint" id="TextPrint" type="button" value="快速顯示">
            -->
            
            </div>

            <div id="Progress"></div>

            <div id="PlurkList"></div>

            <div id="PageBar">
            <input id="prev" 
            data-event="ClickEvent" 
            data-mode="PageChange" 
            data-path="prev" disabled
            type="button" value="上一頁">

            <!--<input id="page" type="button" value="1">-->

            <div id="page">
                <select id="PageChange" data-mode="PageChange" data-event="ChangeEvent">
                    <option>1</option>
                </select>
            </div>


            <input id="next" 
            data-event="ClickEvent" 
            data-mode="PageChange" 
            data-path="next" disabled
            type="button" value="下一頁">
            </div>`;

            
           
            Ex.func.ChangeEvent();
            Ex.func.ClickEvent();

            Ex.func.Block(1);
            
            

        }
    }

    

    window.onload = ()=>{

        Ex.init();


    }
    

})();