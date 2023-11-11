// 関数の定義
var key = localStorage.length
var record = [];
var base64String;



// カメラの利用準備
// https://developer.mozilla.org/ja/docs/Web/API/MediaDevices/getUserMedia
function cameraStart(){
    navigator.mediaDevices.getUserMedia({ video: true })
    .then(function(stream) { // アクセスが成功したときに実行される関数
        const video = document.querySelector('video'); // video要素を取得
        video.srcObject = stream; // ビデオストリームをvideo要素のソースに設定
        video.play(); // ビデオを再生
      })
    .catch(function(error) { // アクセスが失敗したときに実行される関数
        console.error("Error accessing the camera", error); // コンソールにエラーメッセージを表示
    });
};

// スタートボタンによるモーダルの表示とアクション
function startModal (){
    $("#start").on("click", function(){
        cameraStart();
        setTimeout(function(){
            $("#startModal").fadeIn();
            $("#resnap").fadeOut();
            $("#startSubmit").fadeOut(); 
        },500);
        cancelModal();
    });
};

// モーダルのキャンセル
function cancelModal(){
    $("#cancelModal").on("click", function(){
        $("#startModal").fadeOut();
        location.reload();
    }
)};


$("#snap").on("click",function(){
    const canvas = document.querySelector('#startCanvas'); // canvas要素を取得
    const context = canvas.getContext('2d'); // canvasの2Dコンテキストを取得
    const video = document.querySelector('#video'); // video要素を取得
    context.drawImage(video, 0, 0, 600, 450); // video要素の画像をcanvasに描画
    $("#snap").fadeOut();
    $("#video").fadeOut();
    $("#cancelModal").fadeOut();
    $("#resnap").fadeIn();
    $("#startCanvas").fadeIn();
    $("#startSubmit").fadeIn(); 
    base64String = canvas.toDataURL("image/png");
});

// 再撮影
$("#resnap").on("click",function(){
    $("#startCanvas").fadeOut();
    $("#snap").fadeIn();
    $("#video").fadeIn(); 
    $("#resnap").fadeOut(); 
    $("#startSubmit").fadeOut(); 
});

// スタートモーダル上のアクション
$("#startSubmit").on("click", function () {
    key++;
    // 日時を取得
    startTime= moment();
    console.log(startTime); 
    record = [];
    $("#start").fadeOut();
    $("#startModal").fadeOut();
    $("#inProgress").fadeIn();
});



// 日時の形式を変換する関数
function timeFix(time){
    var result = time.format('YYYY/MM/DD HH:mm');
    console.log(result);
    return result;
};


// stopRestarttime用
var timerInterval = null;  //setInterval(updateTimer, 1000); をいれてIntervalIDを格納。clearできるようにする必要がある。
var startTime=null;
var lastPauseTime = 0;
var isTimerRunning = false;
var pauseDuration = 0;
var elapsedTime = 0;

// タイマー実装のめも
// スタート、ストップ、再開、時間の表示をそれぞれ分けて実装
// スタートからの時間 - （ストップから再開までの時間）をupdate timeにわたす
// 時間のカウントのタイマー
function timer(){
    function startTimer(){
        startTime = moment();
        pauseDuration = 0;
        updateTimer();
        timerInterval = setInterval(updateTimer,1000);
        isTimerRunning = true;
        // https://www.sejuku.net/blog/24425
    };

    function stopTimer(){
        clearInterval(timerInterval);
        lastPauseTime = moment();
        $("#stop").text("RESTART").attr("id","restart"); 
        attachRestartHandler();
        isTimerRunning = false;
    };

    function restartTimer(){
        pauseDuration = moment().diff(lastPauseTime);
        timerInterval = setInterval(updateTimer,1000);
        $("#restart").text("stop").attr("id", "stop");
        attachStopHandler();
        isTimerRunning = true;
    }
        
    function updateTimer(){
        if (!isTimerRunning){
            return;
        }
        var currentTime = moment();
        var elapsedTime = currentTime.diff(startTime) - pauseDuration;
        var duration = moment.duration(elapsedTime);
        var durationH = duration.hours();
        var durationM = duration.minutes();
        var durationS = duration.seconds();
        var timeFormatted = `${String(durationH).padStart(2, '0')}:${String(durationM).padStart(2, '0')}:${String(durationS).padStart(2, '0')}`;    
        $("#timer").html(timeFormatted);
        console.log(timeFormatted);
    };

    // イベントハンドラの処理
    function attachStopHandler() {
        $("#stop").off("click").on("click", function() {
            stopTimer();
        });
    }
    function attachRestartHandler() {
        $(document).off("click", "#restart").on("click", "#restart", function() {
            restartTimer();
            attachStopHandler(); // ここで停止ボタンのハンドラを再度アタッチ
        });
    }

    $("#startSubmit").on("click", startTimer);
    attachStopHandler(); // 初期の停止ボタンのハンドラ設定
    // $("#stop").on("click", stopTimer);
    // $("#restart").on("click",restartTimer);
};

// フィニッシュボタンによるモーダルの表示
function finishModal (){
    $("#finish").on("click", function(){
        $("#finishModal").fadeIn();
    });
    cancelModalFinish();
};
// cancelModalFinishは
function cancelModalFinish(){
    $("#cancelModalFinish").on("click", function(){
        $("#finishModal").fadeOut();
    }
)};

$("#finishSubmit").on("click", function () {
    // 日時を取得
    const finishTime= moment();
    console.log(startTime)
    console.log(finishTime); 

    // 今日のコミットメントの取得
    var finishOneword= $("#finishOneword").val(); 
    console.log(finishOneword); 
    // 今日の一言の取得
    const finishAchivement= $("#finishAchivement").val();
    console.log(finishAchivement); 

    // 作業時間を計算
    // https://www.sejuku.net/blog/61608
    // var workTime= finishTime.diff(startTime, 'minutes', true) // 91
    console.log(elapsedTime);
    const elapsedTimeH = Math.floor(elapsedTime/60);
    const elapsedTimeM = Math.ceil(elapsedTime%60);
    elapsedTime = (elapsedTimeH)+"時間"+(elapsedTimeM)+"分"
    console.log(elapsedTime);

    // startTime / finishTimeを保存したい形にしてJSONに変換
    var startTimeFixed = timeFix(startTime); // startTimeを修正したい形に変換
    console.log(startTimeFixed); // 修正された日時をログに出力

    var finishTimeFixed = timeFix(finishTime); // finishTimeを修正したい形に変換
    console.log(finishTimeFixed); // 修正された日時をログに出力
    // 一つのレコードとして今日のコミットメントを格納
    record.push(startTimeFixed,base64String,finishTimeFixed,elapsedTime,finishOneword,finishAchivement);
    
    // そのレコードをローカルストレージにお保存
    var serializedRecord = JSON.stringify(record);
    localStorage.setItem(key,serializedRecord);
    
    // reloadする
    location.reload()
});



// 情報の追加
function getList(){
    for (let i = 0; i<localStorage.length; i++ ){
        const key = localStorage.key(i);
        console.log(key);
        const jsonString = localStorage.getItem(key);
        console.log(jsonString);
        
        const array = JSON.parse(jsonString);
        console.log(array);

        // displayの中に、"id=record${i+1} class=record"を含むdiv tagを作ってrecordListの中に追加していく
        const recordDiv = $(`<tr id="record${i}" class="record"></tr>`);

        // valueの配列を一つひとつ取り出してvariables[index1]に変換
        const variables= [];
        array.forEach((value, index) => {
            const propertyName = 'variable' + (index+1);
            variables[propertyName] = value;

            console.log(variables[propertyName]);
            let html ;
            // imgに変換すべきかどうかをif文検証している
            if (value && value.length >= 100){
                html = `
                <td align="center" class="recordContent">
                <img src="${value}" class="image-class" width="400" height="300" />
                </td>`;
            } else {
                html = `
                <td align="center" class="recordContent">${value}</td>;
                `
            } ;

            recordDiv.append(html); //recordDivに生成したhtmlを追加
            
            // タグ指定を上で生成したrecordにする
            $("#records").append(recordDiv);
            
        });
    };
    $('#records').tablesorter();
};

// データ削除
$("#clear").on("click", function () {
    var result = window.confirm("ほんとにすべてのデータ消しちゃうの？努力が水の泡よ？");
    if (result){
        localStorage.clear();
        location.reload()
        console.log('データをすべて削除しました');
    }else{
        console.log('データは削除されませんでした');
    }
});

$(document).ready(function() {
    timer();
    startModal ();
    getList();
    finishModal();
});


// ソート機能を追加。ライブラリから読み込み

// 残りやらなきゃいけないこと
// tableのsort
// 一時停止・再開ボタンの実装
