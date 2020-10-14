var that;
var App = {
    //音乐播放器容器
    playBox: $(".player"),
    //音频标签
    audio: $("audio")[0],
    //实例化一个音乐播放器对象（原生DOM）
    playerObj: new Plyr($("audio")[0]),
    ipt: $("input"),
    btn: $("button.btn"),
    main: $(".main"),
    //获取音乐排行榜
    getMusicRanking: function () {
        $.ajax({
            url: "https://api.apiopen.top/musicRankings",
            data: "",
            type: "get",
            dataType: "json",
            success: e => {
                that.creatRankingsNode(e.result)
            }
        })
    },
    //渲染音乐排行榜
    creatRankingsNode: function (e) {
        // console.log("创建节点的方法=>",e);
        //创建榜单标题，容器；歌曲容器
        e.forEach(function (v, i) {
            // console.log(v)
            // var main=$(".main");
            var songAll = "";
            // console.log("每一个榜单的歌曲=>",v.content)
            for (var key in v.content) {
                // console.log("每一首歌曲=>", v.content[key])
                var songStr = `
                    <div class="col-lg-3 col-md-3 col-sm-6 col-xs-6">
						<img src="${v.content[key].pic_big}" alt="">
						<h5>${v.content[key].title}</h5>
						<h6>演唱:${v.content[key].author}</h6>
					</div>
                `
                songAll += songStr
            }
            //模板字符串
            var str = `
            <div class="item">
				<h2>
					<img src="${v.pic_s260}" alt="">
					${v.name}<span class="label label-danger small">New</span></h2>
                <div class="row">
                    ${songAll}
                </div>
            </div>
            `
            that.main.append($(str))
            songAll = ""
        })
    },
    //获取音乐id
    getSongid: function (opt) {
        $.ajax({
            url: "http://tingapi.ting.baidu.com/v1/restserver/ting",
            data: {
                format: "json",
                calback: "",
                from: "webapp_music",
                method: "baidu.ting.search.catalogSug",
                //TODO...获取输入框的值
                query: opt
            },
            type: "GET",
            dataType: "jsonp",
            success: e => {
                if (e.error_code == 22001) {
                    that.getSongid();
                } else {
                    console.log(e)
                    that.testSongId(e)
                }
                // that.getSongid();
                // that.createSongNode(getMusicId.song)
            }
        })
    },
    //通过id获取歌曲连接、歌词连接
    getSongSrc: function (id) {
        $.ajax({
            url: "http://tingapi.ting.baidu.com/v1/restserver/ting",
            data: {
                format: "json",
                calback: "",
                from: "webapp_music",
                method: "baidu.ting.song.play",
                //TODO...获取输入框的值
                songid: id
            },
            type: "GET",
            dataType: "jsonp",
            success: e => {
                console.log(e)
                console.log("歌词链接=>", e.songinfo.lrclink);
                console.log("播放链接=>", e.bitrate.file_link);
                // that.testSonginfo(e);
                // $(".songsrc").attr("src", e.bitrate.file_link)
                $("audio")[0].setAttribute("src", e.bitrate.file_link);
                that.getLrc(e.songinfo.lrclink);
            }
        })
    },
    //测试
    getLrc: function (link) {
        $.ajax({
            url: link,
            type: "GET",
            success: e => {
                console.log("当前歌曲的歌词=>", e)
                var lyric = $("#lyric")[0];
                var lyrObj = new Lyric({
                    onPlay: function (line, text) {
                        console.log(line, text);
                        lyric.innerHTML = text;
                    },
                    onSetLyric: function (lines) {

                    },
                    offset: 150
                });
                lyrObj.setLyric(e);
                var audio = $("audio")[0];
                audio.onplay = function () {
                    lyrObj.play(audio.currentTime * 1000) instanceof Promise;
                }
                audio.onpause = function () {
                    lyrObj.pause();
                }
                //    that.playObj.play()
            }
        })
    },
    testSongId: function (e) {
        var res = e || getMusicId;
        // console.log("歌曲id=>", getMusicId.song);
        //根据搜索到的音乐创建节点
        that.createSongNode(res.song)
    },
    // testSonginfo:function(e){
    //     var res = e || songinfo;
    //     console.log("歌曲信息=>",res);
    //     console.log("歌词链接=>", res.songinfo.lrclink);
    //     console.log("播放链接=>", res.bitrate.file_link);
    // },
    //创建搜索到的音乐节点
    createSongNode: function (opt) {
        var str = "";
        opt.forEach(function (v, i) {
            // console.log(v);
            str += `
            <h3 class="songitem" data-songid="${v.songid}">${i + 1}.  《${v.songname}》  --${v.artistname}</h3>
            `
        });
        that.main.html(str);
    },
    //页面初始化方法
    init: function () {
        that = this;
        //main元素绑定点击事件
        that.main.click(function (e) {
            if (e.target.nodeName == "H3") {
                that.getSongSrc(e.target.getAttribute("data-songid"))
                that.playerObj.play()
            }
        })
        that.getMusicRanking();
        // that.getSongid();
        // that.getSongSrc();
        // that.testSongId();
        // that.testSonginfo();
        that.getLrc()
        //点击事件
        that.btn.click(function () {
            // console.log(that.ipt.val());
            that.getSongid(that.ipt.val());
            // that.testSongId(that.ipt.val());
            that.ipt.val("")
        })
        that.ipt.keydown(function (e) {
            // console.log(e.keyCode)
            if (e.keyCode == 13) {
                that.getSongid(that.ipt.val());
                // that.testSongId(that.ipt.val());
                that.ipt.val("")
            }
        })
    }
}
App.init()
