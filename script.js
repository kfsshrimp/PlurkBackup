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
            },
            storage:"local"
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
            page:1
        },
        temp:{ 
            BackList:(plurk_id)=>{

                var {plurk,user,Replurk} = Ex.flag.storage.plurk[plurk_id];
                

                return `
                    <div>
                        ${user.display_name}（${user.nick_name}）
                        <div class="content">
                        ${plurk.content}
                        </div>

                        
                        <button data-plurk_id="${plurk.plurk_id}" data-mode="ShowReplurk">顯示回噗</button>

                        <button data-plurk_id="${plurk.plurk_id}"  data-mode="BackUpDownLoad">下載記錄檔</button>
                    </div>
                `;

            },
            ReplurkDivList:(data,user)=>{

                

                return `<div class="list">
                    ${(user.id===99999)?data.handle:`${user.display_name}（${user.nick_name}）`}
                    <p/>
                    ${data.content}

                    </div>
                `;
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
            ShowReplurk:(plurk,user,Replurk)=>{


                var ReplurkDiv = document.querySelector("#ReplurkDiv")||document.createElement("div");
                ReplurkDiv.id = "ReplurkDiv";




                ReplurkDiv.innerHTML = `
                <button data-selector="#ReplurkDiv" data-mode="Close">關閉</button>
                <div>

                <div class="list">
                ${user.display_name}（${user.nick_name}）<p/>
                ${plurk.content}
                </div>

                ${Object.values(Replurk.responses).map(data=>Ex.temp.ReplurkDivList(data,user)).join("")}

                
                </div>`;


                document.body.appendChild(ReplurkDiv);


            },
            ClickEvent:(e)=>{

                switch (e.target.dataset.mode){

                    case "BackUp":



                        var plurk_url = document.querySelector("#plurk_url").value;

                        var plurk_id =  parseInt(plurk_url.split("/").pop(),36);


                        var api = Ex.PlurkApi;

                        api.act = "Timeline/getPlurk";
                        api.arg.plurk_id = plurk_id;


                        api.func = (r)=>{

                            try{
                                r = JSON.parse(r.response);
                            }catch(e){
                                alert("輸入網址有誤");
                                return;
                            }


                            
                            Ex.flag.storage.plurk = Ex.flag.storage.plurk||{};
                            Ex.flag.storage.plurk[ r.plurk.plurk_id ] = r;
                            

                            api.act = "Responses/get";
                            api.arg.plurk_id = plurk_id;
                            api.func = (r)=>{
                                r = JSON.parse(r.response);
                                
                
                                Ex.flag.storage.plurk[ plurk_id ].Replurk = r;

                                Ex.func.StorageUpd();


                                document.querySelector("#BackList").innerHTML = Ex.func.BackList();

                            }
                            api.Send();

                        }

                        api.Send();

                    break;

                    case "BackUpDownLoad":

                        var plurk = Ex.flag.storage.plurk[e.target.dataset.plurk_id];
                        

                        var file = new File(
                            [ btoa(encodeURIComponent(JSON.stringify(plurk))) ],
                            `噗浪純文字備份（${ parseInt(e.target.dataset.plurk_id).toString(36)}）.txt`,
                            {
                                type: 'text/plain',
                            }
                        )
                          
                        var link = document.createElement("a")
                        var url = URL.createObjectURL(file)

                        console.log(url);
                        
                        link.href = url
                        link.download = file.name
                        document.body.appendChild(link)
                        link.click()
                        
                        document.body.removeChild(link)
                        URL.revokeObjectURL(url)

                    break;

                    case "BackUpLoadFile":

                        var reader = new FileReader();
                        var file = document.querySelector("#File");
                        file.addEventListener("change",r=>{

                            console.log(r);

                            reader.readAsText(r.target.files[0]);

                        });
                        reader.onload = (r)=>{
                            try{
                                var {plurk,user,Replurk} = JSON.parse(decodeURIComponent(atob(r.target.result)));
                            }catch(e){
                                alert("檔案錯誤");
                                return;
                            }

                            Ex.func.ShowReplurk(plurk,user,Replurk);
    
                        }

                        file.click();


                    break;

                    case "ShowReplurk":


                        var {plurk,user,Replurk} = Ex.flag.storage.plurk[e.target.dataset.plurk_id];

                        Ex.func.ShowReplurk(plurk,user,Replurk);



                    break;

                    case "ClearSave":

                        Ex.flag.storage.plurk = {};

                        Ex.func.StorageUpd();

                        document.querySelector("#BackList").innerHTML = Ex.func.BackList();

                    break;

                    


                    case "Close":

                        document.querySelectorAll(e.target.dataset.selector).forEach(o=>o.remove());

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
            BackList:()=>{

                var back_list = Ex.flag.storage.plurk||{};

                var html = ``;

                Object.values(back_list).forEach(data=>{

                    

                    html += Ex.temp.BackList(data.plurk.plurk_id);


                });

                return html;

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
                
                if(Ex.flag.local===undefined || Ex.flag.session===undefined)
                {
                    Ex.flag.local = JSON.parse(localStorage[Ex.id]||`{}`);
                    Ex.flag.session = JSON.parse(sessionStorage[Ex.id]||`{}`);

                    Ex.flag.storage = Ex.flag[Ex.config.storage];
                }
                else
                {
                    Ex.flag[Ex.config.storage] = Ex.flag.storage;

                    localStorage[Ex.id] = JSON.stringify(Ex.flag.local);
                    sessionStorage[Ex.id] = JSON.stringify(Ex.flag.session);
                }

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

            Ex.func.StorageUpd();
            

            


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


            
            


            document.body.innerHTML = `

            <div id="SearchBar">
                <input id="plurk_url" type="text" placeholder="噗浪網址">


                <button data-mode="BackUp">備份</button>
                <button data-mode="ClearSave">清除記錄</button>

                <button data-mode="BackUpLoadFile">檔案載入記錄</button>



                <button onclick="window.open('https://www.plurk.com/kfsshrimp4','_blank');">使用說明&問題回報</button>
                <input type="file" id="File">
                
            
                
            </div>

            <div id="BackList">${Ex.func.BackList()}</div>


            `;


            document.addEventListener("click",Ex.func.ClickEvent)
            
            
           
            
            

            Ex.func.Block(1);
            
            

        }
    }

    

    window.onload = ()=>{

        

        Ex.init();


    }
    

})();